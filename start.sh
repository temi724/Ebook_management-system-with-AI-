#!/bin/bash

echo "🚀 Starting E-Library Management System..."
echo ""

# Colors
GREEN='\033[0.32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if MySQL is running
echo "${BLUE}Checking MySQL...${NC}"
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL not found. Please install MySQL first."
    exit 1
fi

# Create database if it doesn't exist
echo "${BLUE}Setting up database...${NC}"
mysql -u root -ppassword -e "CREATE DATABASE IF NOT EXISTS elibrary_db;" 2>/dev/null || echo "Using existing database..."

# Start backend
echo ""
echo "${BLUE}Starting Backend (FastAPI)...${NC}"
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt

echo "${GREEN}✓ Backend starting at http://localhost:8000${NC}"
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start frontend
echo ""
echo "${BLUE}Starting Frontend (React + Vite)...${NC}"
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "${GREEN}✓ Frontend starting at http://localhost:5173${NC}"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "${GREEN}========================================${NC}"
echo "${GREEN}✨ E-Library is ready!${NC}"
echo "${GREEN}========================================${NC}"
echo ""
echo "📚 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:8000"
echo "📖 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for user interrupt
wait $BACKEND_PID $FRONTEND_PID
