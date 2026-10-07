@echo off
title StyleHub Haute Atelier Launcher
echo ============================================================
echo      Starting StyleHub Haute Atelier Web Application
echo ============================================================
echo.

:: 1. Start Python HTTP Frontend Server on Port 5500
echo [1/3] Starting Frontend Server on port 5500...
cd /d "%~dp0front end"
start "StyleHub-Frontend" /B python -m http.server 5500 --bind 127.0.0.1 >nul 2>&1

:: 2. Start Flask Backend Server on Port 5000
echo [2/3] Starting Backend API Server on port 5000...
cd /d "%~dp0Backend"
start "StyleHub-Backend" /B python app.py >nul 2>&1

:: 3. Wait 2 seconds for servers to initialize
timeout /t 2 /nobreak >nul

echo [3/3] Launching StyleHub in your default browser...
start http://localhost:5500/index.html

echo.
echo ============================================================
echo   [SUCCESS] StyleHub Website is now LIVE!
echo   Website URL:  http://localhost:5500/index.html
echo   Admin Panel:  http://localhost:5500/admin.html
echo ============================================================
echo.
echo Leave this window open while using the website.
echo To close the website servers, simply close this window.
echo.
pause
