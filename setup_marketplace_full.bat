@echo off
echo ===================================
echo AgriAI Marketplace Module Setup
echo ===================================
echo.

echo Step 1: Setting up marketplace database tables...
cd /d D:\AgriAI\backend
python -m app.setup_marketplace
echo.

echo Step 2: Creating product images directories...
mkdir "D:\AgriAI\frontend\public\images\products" 2>nul
mkdir "D:\AgriAI\backend\app\static\images\products" 2>nul
echo.

echo Step 3: Copying default product image...
copy "D:\AgriAI\frontend\public\images\products\default.jpg" "D:\AgriAI\backend\app\static\images\products\default.jpg" /Y

echo.
echo Setup Complete!
echo.
echo To start the application:
echo 1. Run start_backend.bat
echo 2. Run start_frontend.bat
echo.
echo You can then access the marketplace at: http://localhost:5173/marketplace
echo.
pause
