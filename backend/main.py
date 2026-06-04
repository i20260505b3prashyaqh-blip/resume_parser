from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import chromadb
import uuid
import google.generativeai as genai
from flashrank import Ranker, RerankRequest
import fitz
import pytesseract
from PIL import Image
import io

# Initialize FastAPI
app = FastAPI(title="ATS Resume Matcher API", version="1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)
model = genai.GenerativeModel("gemini-2.5-flash-lite")

# ChromaDB
client = chromadb.PersistentClient(path="./resume_db")
collection = client.get_or_create_collection(name="candidates")

# FlashRank
ranker = Ranker(model_name="rank-T5-flan", cache_dir="./flashrank_cache")


# Pydantic Models
class JDResponse(BaseModel):
    required_skills: List[str]
    min_experience: int
    education: str

class RankingRequest(BaseModel):
    required_skills: List[str]
    required_experience: int
    required_education: str
    jd_text: Optional[str] = None
    custom_skill: Optional[str] = None

class RecruiterQuery(BaseModel):
    query: str

class ChatResponse(BaseModel):
    reply: str


# Helper Functions
def extract_text_with_ocr(pdf_bytes: bytes) -> str:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    text = text.strip()

    if len(text) < 100:
        print("Scanned PDF detected, applying OCR...")
        ocr_text = ""
        for page_num, page in enumerate(doc):
            try:
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                img = Image.open(io.BytesIO(pix.tobytes("ppm")))
                ocr_text += pytesseract.image_to_string(img) + "\n"
                print(f"OCR page {page_num + 1}: {len(ocr_text)} chars")
            except Exception as e:
                print(f"OCR error page {page_num + 1}: {e}")
        text = ocr_text.strip()

    return text


def build_rerank_passage(meta: dict) -> str:
    return (
        f"Name: {meta.get('name', 'N/A')}\n"
        f"Skills: {meta.get('skills', '')}\n"
        f"Experience: {meta.get('experience', 'N/A')}\n"
        f"Education: {meta.get('education', '')}\n"
        f"Projects: {meta.get('projects', '')}\n"
        f"ATS Score: {meta.get('ats_score', '0')}"
    )


# Routes
@app.get("/health")
async def health():
    return {"status": "ok", "candidates": collection.count()}


@app.post("/extract-jd")
async def extract_jd(file: UploadFile = File(...)):
    try:
        jd_text = extract_text_with_ocr(await file.read())
        prompt = f"""
Extract required skills, min experience, and education. Return ONLY JSON.

{{"required_skills": [], "min_experience": 0, "education": "Any"}}

JD: {jd_text}
"""
        response = model.generate_content(prompt)
        parsed = json.loads(response.text.replace("```json", "").replace("```", "").strip())
        return JDResponse(**parsed)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    try:
        text = extract_text_with_ocr(await file.read())
        print(f"Extracted {len(text)} chars")

        prompt = f"""
Extract resume information. Return ONLY valid JSON with these fields.
If any field is missing, return empty string or empty array.

{{"name":"","email":"","phone":"","education":[],"skills":[],"projects":[],"total_experience_years":0,"summary":""}}

Resume text:
{text[:2000]}
"""
        response = model.generate_content(prompt)
        response_text = response.text.strip()

        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]

        parsed = json.loads(response_text.strip())

        defaults = {"name": "", "email": "", "phone": "", "education": [], "skills": [], "projects": [], "total_experience_years": 0, "summary": ""}
        for key, val in defaults.items():
            if key not in parsed:
                parsed[key] = val

        return parsed
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON from AI: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/store-candidate")
async def store_candidate(data: dict = Body(...)):
    try:
        candidate_id = str(uuid.uuid4())

        def to_str(val):
            if isinstance(val, list): return ", ".join([str(v) for v in val if v])
            return str(val) if val else ""

        ats_score = min(float(data.get("ats_score", 0)), 100.0)

        metadata = {
            "name": str(data.get("name", "")).strip(),
            "email": str(data.get("email", "")).strip(),
            "phone": str(data.get("phone", "")).strip(),
            "experience": str(data.get("total_experience_years", 0)),
            "ats_score": str(ats_score),
            "skills": to_str(data.get("skills", [])),
            "education": to_str(data.get("education", [])),
            "projects": to_str(data.get("projects", [])),
        }

        doc = f"Name: {metadata['name']}\nSkills: {metadata['skills']}\nExperience: {metadata['experience']}"
        collection.add(ids=[candidate_id], documents=[doc], metadatas=[metadata])
        print(f"Stored candidate: {metadata['name']} ({candidate_id})")

        return {"status": "stored", "id": candidate_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/rank-candidates")
async def rank_candidates(request: RankingRequest):
    try:
        all_data = collection.get()
        if not all_data["metadatas"]:
            return {"candidates": [], "narrative": "No candidates found."}

        all_required = list(request.required_skills)
        if request.custom_skill:
            all_required.append(request.custom_skill)

        ranked = []
        for meta in all_data["metadatas"]:
            c_skills = [s.strip().lower() for s in str(meta.get("skills", "")).split(",") if s.strip()]
            matched = sum(1 for skill in all_required if any(skill.lower() in cs for cs in c_skills))

            s_score = min((matched / len(all_required) * 100) if all_required else 100, 100.0)
            c_exp = float(meta.get("experience", 0) or 0)
            e_score = min(100 if c_exp >= request.required_experience else (c_exp / max(request.required_experience, 1)) * 100, 100.0)
            ed_score = min(100 if request.required_education == "Any" or request.required_education.lower() in str(meta.get("education", "")).lower() else 50, 100.0)
            total = min(round(s_score * 0.5 + e_score * 0.3 + ed_score * 0.2, 1), 100.0)

            ranked.append({
                "name": meta.get("name", "N/A"),
                "email": meta.get("email", "N/A"),
                "jd_score": total,
                "skills": meta.get("skills", ""),
                "experience": c_exp,
                "education": meta.get("education", ""),
                "ats_score": min(float(meta.get("ats_score", 0) or 0), 100.0),
            })

        if request.jd_text and ranked:
            passages = [{"id": i, "text": build_rerank_passage(c)} for i, c in enumerate(ranked)]
            try:
                reranked = ranker.rerank(RerankRequest(query=request.jd_text[:1200], passages=passages))
                ranked = [ranked[r["id"]] for r in reranked]
            except:
                pass

        ranked.sort(key=lambda x: x["jd_score"], reverse=True)
        return {"candidates": ranked}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/recruiter-search")
async def recruiter_search(request: RecruiterQuery):
    try:
        if collection.count() == 0:
            return ChatResponse(reply="No candidates found. Please upload resumes first.")

        results = collection.query(
            query_texts=[request.query],
            n_results=min(5, collection.count())
        )
        candidate_metas = results.get("metadatas", [[]])[0] if results.get("metadatas") else []

        if candidate_metas:
            passages = [{"id": i, "text": build_rerank_passage(meta)} for i, meta in enumerate(candidate_metas)]
            try:
                reranked = ranker.rerank(RerankRequest(query=request.query, passages=passages))
                candidate_metas = [candidate_metas[r["id"]] for r in reranked]
            except:
                pass

        candidate_info = ""
        for meta in candidate_metas:
            candidate_info += f"""
Name: {meta.get('name', 'N/A')}
Email: {meta.get('email', 'N/A')}
Experience: {meta.get('experience', 'N/A')} years
ATS Score: {meta.get('ats_score', 'N/A')}
Skills: {meta.get('skills', 'N/A')}
Education: {meta.get('education', 'N/A')}
"""

        prompt = f"""
You are a recruiter assistant.
Rules:
- Answer in 2-3 sentences maximum.
- Be concise and direct.
- Mention only the most relevant candidate(s).
- Maximum 50 words.

HR Query: {request.query}

Candidates:
{candidate_info or "No candidates found."}
"""
        response = model.generate_content(prompt)
        return ChatResponse(reply=response.text)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/candidates")
async def get_all_candidates():
    try:
        data = collection.get()
        return {"candidates": data.get("metadatas", [])}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/delete-candidate/{candidate_id}")
async def delete_candidate(candidate_id: str):
    try:
        collection.delete(ids=[candidate_id])
        return {"status": "deleted", "id": candidate_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)