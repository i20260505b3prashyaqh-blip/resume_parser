@echo off
echo === ATS Resume Matcher Startup ===
echo.

REM Check and install backend dependencies
python -c "import fastapi" >nul 2>&1
if errorlevel 1 (
    echo Installing backend dependencies...
    cd backend
    pip install -r requirements.txt -q
    cd ..
    echo Backend dependencies installed
)

REM Check and install frontend dependencies
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install -q
    cd ..
    echo Frontend dependencies installed
)

echo.
echo Starting services...
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop
echo.

REM Start backend in one terminal
start cmd /k "cd backend && python main.py"

REM Wait a bit for backend to start
timeout /t 2 /nobreak

REM Start frontend in current terminal
cd frontend
call npm run dev
