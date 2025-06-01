// build-themes.js
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

// Function to execute a command and return a promise
function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.warn(`Command warning: ${stderr}`);
      }
      console.log(stdout);
      resolve(stdout);
    });
  });
}

async function buildThemes() {
  try {
    console.log('Building Classic theme CSS...');
    await execPromise('npm run build:css:classic');
    
    console.log('Building Futuristic theme CSS...');
    await execPromise('npm run build:css:futuristic');
    
    console.log('All themes built successfully!');
  } catch (error) {
    console.error('Error building themes:', error);
    process.exit(1);
  }
}

// Run the build process
buildThemes();
