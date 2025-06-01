#!/usr/bin/env node

/**
 * This script runs the complete theme build process and starts the development server
 * It's a convenient way to test theme changes during development
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m"
};

console.log(`${colors.bright}${colors.cyan}AgriAI Theme Development Script${colors.reset}`);
console.log(`${colors.yellow}This script builds all themes and starts the development server${colors.reset}\n`);

// Function to run a command and return a promise
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`${colors.bright}> ${command} ${args.join(' ')}${colors.reset}`);
    
    const childProcess = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    childProcess.on('close', (code) => {
      if (code === 0 || options.ignoreError) {
        resolve();
      } else {
        reject(new Error(`Command "${command} ${args.join(' ')}" failed with exit code ${code}`));
      }
    });
    
    childProcess.on('error', (error) => {
      reject(error);
    });
  });
}

// Main function to run all the steps
async function main() {
  try {
    // Step 1: Build all themes
    console.log(`\n${colors.bright}${colors.green}Step 1: Building all themes...${colors.reset}`);
    await runCommand('npm', ['run', 'build:css:all']);
    
    // Step 2: Start the theme watcher in the background
    console.log(`\n${colors.bright}${colors.green}Step 2: Starting theme watcher...${colors.reset}`);
    const watcher = spawn('node', ['watch-themes.js'], {
      stdio: 'inherit',
      shell: true,
      detached: true
    });
    
    // Step 3: Start the development server
    console.log(`\n${colors.bright}${colors.green}Step 3: Starting development server...${colors.reset}`);
    await runCommand('npm', ['run', 'dev']);
    
    // When the development server exits, kill the watcher
    process.on('exit', () => {
      if (watcher && !watcher.killed) {
        watcher.kill();
      }
    });
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the main function
main();
