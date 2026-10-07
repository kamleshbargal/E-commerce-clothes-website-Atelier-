@echo off
title StyleHub Atelier - All-In-One Launcher
color 0A
echo ===================================================
echo     STARTING STYLEHUB LUXURY ATELIER WEBSITE
echo ===================================================
echo.

echo [1/3] Starting MySQL Database...
start "" "C:\xampp\mysql_start.bat"

echo [2/3] Starting Python Backend API (Port 5000)...
start "StyleHub Backend" /min cmd /c "cd /d c:\Kamlesh\clothes website\Backend && python app.py"

echo [3/3] Starting Frontend Web Server (Port 5500)...
start "StyleHub Frontend" /min cmd /c "cd /d c:\Kamlesh\clothes website\front end && python -m http.server 5500"

timeout /t 3 >nul

echo.
echo ===================================================
echo   ALL SYSTEMS ONLINE! OPENING YOUR WEBSITE...
echo ===================================================
start http://localhost:5500/index.html
start http://localhost:5500/admin.html
exit
