@echo off
echo Building and starting the futuristic theme frontend...

cd frontend

echo Building CSS for all themes...
npm run build:css:all

echo Starting the frontend...
npm run dev
