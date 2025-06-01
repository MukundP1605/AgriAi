@echo off
REM AgriAI Frontend Development with Theme Support
REM This script builds all themes and starts the development server

echo Starting AgriAI Frontend with Theme Support
echo =======================================
echo.

echo Step 1: Building theme CSS files...
call npm run build:css:all

echo.
echo Step 2: Starting theme watcher in a new window...
start cmd /k "cd %CD% && npm run watch:themes"

echo.
echo Step 3: Starting development server with theme support...
call npm run dev

echo.
echo Don't forget to close the theme watcher window when you're finished!
