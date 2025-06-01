@echo off
echo Creating marketplace product images directory...

set IMAGES_DIR=D:\AgriAI\backend\app\static\images\products
if not exist "%IMAGES_DIR%" (
  mkdir "%IMAGES_DIR%"
  echo Created directory: %IMAGES_DIR%
) else (
  echo Directory already exists: %IMAGES_DIR%
)

echo Copying sample product images...
:: Copy a default image that can be used if product images are missing
copy D:\AgriAI\backend\app\static\placeholder.png "%IMAGES_DIR%\default.jpg"

echo Marketplace setup complete!
pause
