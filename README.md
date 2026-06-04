# ATS Resume Matcher - React + Vite Frontend

A modern, AI-powered resume ranking system built with **React 18**, **Vite**, **Tailwind CSS**, and **FastAPI backend**.

## Features

- ✅ **Resume Upload & Parsing** - Extract text and data from PDF resumes (with OCR support)
- ✅ **Job Description Analysis** - Extract requirements from JD PDFs
- ✅ **AI-Powered Scoring** - Google Gemini 2.5 Flash Lite for resume analysis
- ✅ **Vector Search** - ChromaDB for semantic candidate search
- ✅ **Smart Reranking** - FlashRank T5 reranker for better results
- ✅ **Recruiter Chat** - AI assistant to search and get insights about candidates
- ✅ **Dashboard Analytics** - Real-time stats on candidates, skills, and experience
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile

## Project Structure

```
resumeproject/
├── backend/                 # FastAPI REST API
│   ├── main.py             # FastAPI app with all endpoints
│   └── requirements.txt     # Python dependencies
├── frontend/               # React + Vite web app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── utils/          # API calls and utilities
│   │   ├── App.jsx         # Main app component
│   │   ├── main.jsx        # React entry point
│   │   └── index.css       # Tailwind styles
│   ├── package.json        # Node dependencies
│   ├── vite.config.js      # Vite configuration
│   ├── tailwind.config.js  # Tailwind CSS config
│   └── index.html          # HTML template
├── app3.py                 # Original Streamlit app (reference)
├── resume_db/              # ChromaDB persistent storage
└── flashrank_cache/        # FlashRank model cache
```

## Setup & Installation

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Terminal 1: Start FastAPI Backend

```bash
cd backend
python main.py
```

Backend will be available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### Terminal 2: Start Vite Dev Server

```bash
cd frontend
npm run dev
```

Frontend will be available at `http://localhost:5173`

## Production Build

### Build Frontend

```bash
cd frontend
npm run build
```

This creates a `dist/` folder with optimized production files.

### Deploy Backend

```bash
cd backend
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 main:app
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check API health |
| POST | `/upload-resume` | Parse resume PDF |
| POST | `/extract-jd` | Extract JD requirements |
| POST | `/store-candidate` | Store candidate in DB |
| POST | `/rank-candidates` | Rank candidates against JD |
| POST | `/recruiter-search` | Search with AI insights |
| GET | `/candidates` | Get all candidates |

## Components

- **ResumeUpload** - Upload and parse resume PDFs
- **JDUpload** - Upload job description and extract requirements
- **RankingTable** - Display ranked candidates with scores
- **RecruiterChat** - AI-powered search and insights
- **Dashboard** - Analytics and statistics

## Technologies

### Frontend
- React 18
- Vite (fast build tool)
- Tailwind CSS (utility-first CSS)
- Lucide React (icons)
- Axios (HTTP client)

### Backend
- FastAPI (Python web framework)
- ChromaDB (vector database)
- Google Generative AI (Gemini 2.5 Flash Lite)
- FlashRank (ML reranker)
- PyMuPDF + pytesseract (PDF processing + OCR)

## Troubleshooting

**Backend not connecting?**
- Ensure FastAPI is running on `http://localhost:8000`
- Check firewall/port conflicts
- Use `python main.py` or `python -m uvicorn main:app --reload`

**Components not loading?**
- Clear browser cache: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)
- Verify `npm install` completed successfully
- Check browser console for errors

**PDF upload failing?**
- Ensure file is a valid PDF
- Check file size (keep under 50MB)
- Verify Gemini API key is set in `backend/main.py`

## Environment Variables

Create a `.env` file in the backend folder:

```
GEMINI_API_KEY=AQ.Ab8RN6LJ6_6uFsLgIxqEmtWB7GHj2HusHJ0d1e9OS6ZwGirbGQ
```

Update `backend/main.py` to load from environment:
```python
import os
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
```

## License

MIT License - Feel free to use and modify!

## Support

For issues or questions:
1. Check the API docs: `http://localhost:8000/docs`
2. Review React DevTools for component state
3. Check FastAPI console for backend errors
