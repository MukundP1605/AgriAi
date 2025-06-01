#!/bin/bash

# AgriAI Frontend Development with Theme Support
# This script builds all themes and starts the development server

echo -e "\033[1;36mStarting AgriAI Frontend with Theme Support\033[0m"
echo -e "\033[1;36m=======================================\033[0m"
echo ""

echo -e "\033[1;32mStep 1: Building theme CSS files...\033[0m"
npm run build:css:all

echo ""
echo -e "\033[1;32mStep 2: Starting theme watcher in the background...\033[0m"
node watch-themes.js &
WATCHER_PID=$!

# Capture SIGINT to make sure we clean up the background process
trap 'kill $WATCHER_PID 2>/dev/null' EXIT INT TERM

echo ""
echo -e "\033[1;32mStep 3: Starting development server with theme support...\033[0m"
npm run dev

# Clean up the background process when the main process exits
echo ""
echo -e "\033[1;33mCleaning up background processes...\033[0m"
kill $WATCHER_PID 2>/dev/null
