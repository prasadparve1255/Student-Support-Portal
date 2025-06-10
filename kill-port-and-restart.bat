@echo off
echo Killing process using port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    taskkill /F /PID %%a
)
echo Starting Firebase emulators...
cd backend
set USE_FIREBASE_EMULATOR=true
npx firebase emulators:start --import=./emulator-data --export-on-exit=./emulator-data