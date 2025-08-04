@echo off
chcp 65001 >nul
title Smart PDF Bundler Browser Launcher

echo 🚀 Opening Smart PDF Bundler in your browser...

REM Wait a moment for servers to start
timeout /t 2 /nobreak >nul

REM Open the frontend in the default browser
start http://localhost:3000

echo ✅ Smart PDF Bundler opened in your browser!
echo If the page doesn't load, make sure the servers are running.
echo.
echo To start the servers, run: launch.bat
pause 