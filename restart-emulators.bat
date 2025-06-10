@echo off
echo Restarting Firebase Emulators...
cd backend
set USE_FIREBASE_EMULATOR=true
npx firebase emulators:start --import=./emulator-data --export-on-exit=./emulator-data