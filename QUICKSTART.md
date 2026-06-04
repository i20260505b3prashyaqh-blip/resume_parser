# 🚀 Quick Start Guide - ATS Resume Matcher

## 5-Minute Setup

### Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- PDF files (resumes and job descriptions)

### Step 1: Install Dependencies (2 min)

**On macOS/Linux:**
```bash
chmod +x run.sh
./run.sh
```

**On Windows:**
```bash
run.bat
```

**Or manually:**

Terminal 1 (Backend):
```bash
cd backend
pip install -r requirements.txt
python main.py
```

Terminal 2 (Frontend):
```bash
cd frontend
npm install
npm run dev
```

### Step 2: Open in Browser

- Frontend: http://localhost:5173
- API Docs: http://localhost:8000/docs

### Step 3: Start Using

1. **Upload Resumes** (left panel)
   - Click "Upload Resume" and select PDF files
   - System extracts candidate info automatically

2. **Upload Job Description** (right panel)
   - Upload a JD PDF
   - System extracts requirements and ranks candidates

3. **Recruiter Chat** (right side)
   - Ask "Find Python developers" or similar queries
   - Get AI-powered insights about candidates

4. **View Dashboard**
   - See stats: Total candidates, avg score, experience
   - Monitor recommended candidates

## API Reference

### Upload & Parse Resume
```bash
curl -X POST "http://localhost:8000/upload-resume" \
  -F "file=@resume.pdf"
```

### Extract JD
```bash
curl -X POST "http://localhost:8000/extract-jd" \
  -F "file=@job_description.pdf"
```

### Rank Candidates
```bash
curl -X POST "http://localhost:8000/rank-candidates" \
  -H "Content-Type: application/json" \
  -d '{
    "required_skills": ["Python", "React"],
    "required_experience": 3,
    "required_education": "Bachelor"
  }'
```

### Recruiter Search
```bash
curl -X POST "http://localhost:8000/recruiter-search" \
  -H "Content-Type: application/json" \
  -d '{"query": "Find senior Python developers"}'
```

## File Structure

```
resumeproject/
├── backend/
│   └── main.py           # FastAPI server
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   └── App.jsx       # Main app
│   └── vite.config.js
├── run.sh / run.bat      # Start both services
└── README.md
```

## Troubleshooting

**"Connection refused" error?**
- Backend must be running on port 8000
- Run: `cd backend && python main.py`

**"Module not found" error?**
- Run: `pip install -r backend/requirements.txt`

**Frontend won't load?**
- Run: `cd frontend && npm install && npm run dev`

**PDF upload fails?**
- Ensure file is a valid PDF
- Check Gemini API key in `backend/main.py`

## Next Steps

1. **Customize the model**: Edit `backend/main.py` line 11 to change Gemini model
2. **Add styling**: Modify Tailwind config in `frontend/tailwind.config.js`
3. **Deploy**: Follow deployment guide in main README.md

## Support

- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **GitHub**: Check the repo for examples
- **Issues**: Debug in browser console or check backend logs

---

**Happy recruiting!** 🎉
