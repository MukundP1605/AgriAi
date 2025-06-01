# start_frontend_with_themes.ps1
Write-Host "Starting AgriAI Frontend with Theme Support" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Building theme CSS files..." -ForegroundColor Green
npm run build:css:all

Write-Host ""
Write-Host "Step 2: Starting theme watcher in a separate window..." -ForegroundColor Green
Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run watch:themes"

Write-Host ""
Write-Host "Step 3: Starting development server with theme support..." -ForegroundColor Green
npm run dev

Write-Host "`nDon't forget to close the theme watcher window when you're finished!" -ForegroundColor Yellow
