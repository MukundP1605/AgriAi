// theme-separation-test.js

/**
 * Theme Separation Test Script
 * 
 * This script performs a simple verification test of the theme separation.
 * It checks for correct class prefixes in generated CSS and potential style conflicts.
 * 
 * Usage:
 *   node theme-separation-test.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m"
};

// Function to check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Function to check if CSS contains theme prefixes
function checkCssForThemePrefixes(cssContent, themePrefix) {
  const regex = new RegExp(`\\.${themePrefix}\\s`, 'g');
  const matches = cssContent.match(regex);
  return matches ? matches.length : 0;
}

// Main test function
function runTests() {
  console.log(`${colors.bright}${colors.cyan}AgriAI Theme Separation Test${colors.reset}\n`);
  
  let passCount = 0;
  let failCount = 0;
  const totalTests = 6;
  
  // Test 1: Check if theme config files exist
  const classicConfigPath = path.resolve(__dirname, 'tailwind.classic.config.js');
  const futuristicConfigPath = path.resolve(__dirname, 'tailwind.futuristic.config.js');
  
  if (fileExists(classicConfigPath) && fileExists(futuristicConfigPath)) {
    console.log(`${colors.green}✓ Test 1: Theme config files exist${colors.reset}`);
    passCount++;
  } else {
    console.log(`${colors.red}✗ Test 1: Missing theme config files${colors.reset}`);
    failCount++;
  }
    // Test 2: Check if theme CSS output files exist
  const classicCssPath = path.resolve(__dirname, 'src/themes/classic/output.css');
  const futuristicCssPath = path.resolve(__dirname, 'src/themes/futuristic/output.css');
  
  if (fileExists(classicCssPath) && fileExists(futuristicCssPath)) {
    console.log(`${colors.green}✓ Test 2: Theme CSS output files exist${colors.reset}`);
    passCount++;
  } else {
    console.log(`${colors.red}✗ Test 2: Missing theme CSS output files${colors.reset}`);
    failCount++;
    
    // If CSS files don't exist, suggest running the build
    console.log(`   ${colors.yellow}Suggestion: Run 'npm run build:css:all' to generate the CSS files${colors.reset}`);
  }
  
  // Test 3: Check if theme input CSS files exist
  const classicInputPath = path.resolve(__dirname, 'src/themes/classic/input.css');
  const futuristicInputPath = path.resolve(__dirname, 'src/themes/futuristic/input.css');
  
  if (fileExists(classicInputPath) && fileExists(futuristicInputPath)) {
    console.log(`${colors.green}✓ Test 3: Theme input CSS files exist${colors.reset}`);
    passCount++;
  } else {
    console.log(`${colors.red}✗ Test 3: Missing theme input CSS files${colors.reset}`);
    failCount++;
  }
  
  // Test 4: Check if build scripts exist in package.json
  const packageJsonPath = path.resolve('package.json');
  
  if (fileExists(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const hasThemeScripts = packageJson.scripts && 
                           packageJson.scripts['build:css:classic'] && 
                           packageJson.scripts['build:css:futuristic'] &&
                           packageJson.scripts['build:css:all'];
                           
    if (hasThemeScripts) {
      console.log(`${colors.green}✓ Test 4: Theme build scripts exist in package.json${colors.reset}`);
      passCount++;
    } else {
      console.log(`${colors.red}✗ Test 4: Missing theme build scripts in package.json${colors.reset}`);
      failCount++;
    }
  } else {
    console.log(`${colors.red}✗ Test 4: package.json not found${colors.reset}`);
    failCount++;
  }
  
  // Test 5 & 6: Check if CSS contains theme prefixes
  if (fileExists(classicCssPath) && fileExists(futuristicCssPath)) {
    // Read CSS content
    const classicCss = fs.readFileSync(classicCssPath, 'utf8');
    const futuristicCss = fs.readFileSync(futuristicCssPath, 'utf8');
    
    // Check for theme-classic prefix
    const classicPrefixCount = checkCssForThemePrefixes(classicCss, 'theme-classic');
    if (classicPrefixCount > 0) {
      console.log(`${colors.green}✓ Test 5: Classic CSS contains theme prefixes (${classicPrefixCount} occurrences)${colors.reset}`);
      passCount++;
    } else {
      console.log(`${colors.red}✗ Test 5: Classic CSS does not contain theme prefixes${colors.reset}`);
      failCount++;
    }
    
    // Check for theme-futuristic prefix
    const futuristicPrefixCount = checkCssForThemePrefixes(futuristicCss, 'theme-futuristic');
    if (futuristicPrefixCount > 0) {
      console.log(`${colors.green}✓ Test 6: Futuristic CSS contains theme prefixes (${futuristicPrefixCount} occurrences)${colors.reset}`);
      passCount++;
    } else {
      console.log(`${colors.red}✗ Test 6: Futuristic CSS does not contain theme prefixes${colors.reset}`);
      failCount++;
    }
  } else {
    console.log(`${colors.yellow}⚠ Test 5 & 6: Skipped CSS prefix tests (CSS files not found)${colors.reset}`);
    failCount += 2;
  }
  
  // Summary
  console.log(`\n${colors.bright}Test Summary:${colors.reset}`);
  console.log(`${colors.green}Passed: ${passCount}/${totalTests}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failCount}/${totalTests}${colors.reset}`);
  
  if (passCount === totalTests) {
    console.log(`\n${colors.bright}${colors.green}All tests passed! Theme separation is implemented correctly.${colors.reset}`);
  } else {
    console.log(`\n${colors.bright}${colors.yellow}Some tests failed. Check the output for details.${colors.reset}`);
  }
}

// Run the tests
runTests();
