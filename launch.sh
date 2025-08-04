#!/bin/bash

# Smart PDF Bundler Launch Script

echo "🚀 Starting Smart PDF Bundler..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend
echo "🔧 Starting backend server..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if requirements.txt is newer than venv
if [ requirements.txt -nt venv/pyvenv.cfg ]; then
    echo "📦 Installing backend dependencies..."
    pip install -r requirements.txt
fi

# Start backend server
echo "🚀 Backend starting on http://localhost:8000"
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "🎨 Starting frontend server..."
cd ../frontend

# Install dependencies if package.json is newer than node_modules
if [ package.json -nt node_modules/.package-lock.json ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start frontend server
echo "🚀 Frontend starting on http://localhost:3000"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 Smart PDF Bundler is running!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for background processes
wait 