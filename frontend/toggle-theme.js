#!/usr/bin/env node

/**
 * AgriAI Theme Toggler
 * 
 * This script allows quickly toggling between themes from the command line.
 * It's useful for debugging theme-specific issues without having to click the UI button.
 * 
 * Usage:
 *   node toggle-theme.js classic   # Switch to classic theme
 *   node toggle-theme.js futuristic # Switch to futuristic theme
 *   node toggle-theme.js           # Toggle between themes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m"
};

// Get the local storage file path
const getLocalStorageFilePath = () => {
  const appName = 'AgriAI';
  const userDataPath = process.env.APPDATA || 
    (process.platform === 'darwin' ? 
      path.join(process.env.HOME, 'Library', 'Application Support') : 
      path.join(process.env.HOME, '.local', 'share'));
  
  return path.join(userDataPath, appName, 'localStorage.json');
};

// Read the current theme from localStorage
const getCurrentTheme = () => {
  try {
    const filePath = getLocalStorageFilePath();
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return data.uiTheme || 'classic';
    }
  } catch (error) {
    console.error(`${colors.red}Error reading localStorage: ${error.message}${colors.reset}`);
  }
  return 'classic'; // Default theme
};

// Save the theme to localStorage
const saveTheme = (theme) => {
  try {
    const filePath = getLocalStorageFilePath();
    const directory = path.dirname(filePath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    
    // Read existing data or create empty object
    let data = {};
    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    
    // Update theme and save
    data.uiTheme = theme;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    console.log(`${colors.green}Theme set to ${colors.bright}${theme}${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Error saving theme: ${error.message}${colors.reset}`);
    return false;
  }
};

// Toggle the theme
const toggleTheme = () => {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === 'classic' ? 'futuristic' : 'classic';
  return saveTheme(newTheme);
};

// Set specific theme
const setTheme = (theme) => {
  if (theme !== 'classic' && theme !== 'futuristic') {
    console.error(`${colors.red}Invalid theme: ${theme}. Use 'classic' or 'futuristic'.${colors.reset}`);
    return false;
  }
  return saveTheme(theme);
};

// Main function
const main = () => {
  console.log(`${colors.cyan}${colors.bright}AgriAI Theme Toggler${colors.reset}\n`);
  
  const args = process.argv.slice(2);
  const themeArg = args[0];
  
  if (themeArg) {
    // Set specific theme
    setTheme(themeArg);
  } else {
    // Toggle theme
    const currentTheme = getCurrentTheme();
    console.log(`Current theme: ${colors.yellow}${currentTheme}${colors.reset}`);
    toggleTheme();
  }
  
  console.log(`\n${colors.yellow}Restart your app to see the changes.${colors.reset}`);
};

// Run the script
main();
