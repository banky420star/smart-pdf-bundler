@echo off
chcp 65001 >nul
title Smart PDF Bundler Launcher

echo 🚀 Starting Smart PDF Bundler...
echo ==================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    echo Visit: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    echo Visit: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed
echo.

REM Start backend
echo 🔧 Starting backend server...
cd backend

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo 📦 Installing backend dependencies...
pip install -r requirements.txt

REM Start backend server
echo 🚀 Backend starting on http://localhost:8000
start "Backend Server" cmd /k "uvicorn main:app --reload --host 0.0.0.0 --port 8000"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo 🎨 Starting frontend server...
cd ..\frontend

REM Install dependencies
echo 📦 Installing frontend dependencies...
npm install

REM Start frontend server
echo 🚀 Frontend starting on http://localhost:3000
start "Frontend Server" cmd /k "npm run dev"

echo.
echo 🎉 Smart PDF Bundler is running!
echo ==================================
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo ✨ Features:
echo    • AI-powered document processing
echo    • Real-time progress tracking
echo    • Beautiful drag-and-drop interface
echo    • Professional PDF generation
echo.
echo The application will open in your browser automatically.
echo Close the command windows to stop the servers.
echo.
pause 