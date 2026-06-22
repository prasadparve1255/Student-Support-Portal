// Script to run all seed scripts in sequence
const { spawn } = require('child_process');
const path = require('path');

const runScript = (scriptName) => {
  return new Promise((resolve, reject) => {
    console.log(`Running ${scriptName}...`);
    
    const child = spawn('node', [scriptName], { stdio: 'inherit' });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`${scriptName} completed successfully`);
        resolve();
      } else {
        console.error(`${scriptName} failed with code ${code}`);
        reject(new Error(`${scriptName} failed with code ${code}`));
      }
    });
    
    child.on('error', (err) => {
      console.error(`Failed to start ${scriptName}:`, err);
      reject(err);
    });
  });
};

const seedAll = async () => {
  try {
    // Run seed scripts in sequence
    await runScript('seed-departments.js');
    await runScript('seed-admins.js');
    await runScript('seed-students.js');
    console.log('All seed scripts completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed process failed:', error);
    process.exit(1);
  }
};

seedAll();