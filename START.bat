@echo off
title Student Support Portal - Starting...
color 0A

echo ============================================
echo    STUDENT SUPPORT PORTAL - STARTING
echo ============================================
echo.
echo [1/3] Installing Backend dependencies...
cd backend
call npm install --silent
echo Backend ready!

echo.
echo [2/3] Installing Frontend dependencies...
cd ..\project
call npm install --silent
echo Frontend ready!

echo.
echo [3/3] Starting Application...
cd ..
echo.
echo ============================================
echo  Backend  : http://localhost:5000
echo  Frontend : http://localhost:5173
echo ============================================
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:5173
npm start
