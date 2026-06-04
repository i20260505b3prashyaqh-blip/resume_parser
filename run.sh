#!/bin/bash

echo "=== ATS Resume Matcher Startup ==="
echo ""

# Check if backend dependencies are installed
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "📦 Installing backend dependencies..."
    cd backend
    pip install -r requirements.txt -q
    cd ..
    echo "✅ Backend dependencies installed"
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install -q
    cd ..
    echo "✅ Frontend dependencies installed"
fi

echo ""
echo "🚀 Starting services..."
echo ""
echo "Backend will start on: http://localhost:8000"
echo "Frontend will start on: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Start backend in background
cd backend
python main.py &
BACKEND_PID=$!
cd ..

# Start frontend
cd frontend
npm run dev
FRONTEND_PID=$!
cd ..

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
