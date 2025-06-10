// Simple script to start Firebase emulator and seed it with data
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Create emulator-data directory if it doesn't exist
const emulatorDataDir = path.join(__dirname, 'emulator-data');
if (!fs.existsSync(emulatorDataDir)) {
  fs.mkdirSync(emulatorDataDir, { recursive: true });
}

// Start the Firebase emulator
console.log('Starting Firebase emulator...');
const emulator = spawn('npx', ['firebase', 'emulators:start', '--project=digital-complaint-system'], {
  stdio: 'inherit',
  shell: true
});

// Handle emulator process events
emulator.on('error', (error) => {
  console.error('Failed to start Firebase emulator:', error);
});

emulator.on('exit', (code, signal) => {
  if (code) {
    console.log(`Firebase emulator process exited with code ${code}`);
  } else if (signal) {
    console.log(`Firebase emulator process was killed with signal ${signal}`);
  } else {
    console.log('Firebase emulator process exited');
  }
});

console.log('Firebase emulator started. Press Ctrl+C to stop.');