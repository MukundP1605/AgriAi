@echo off
echo Setting up AgriAI Backend with Authentication...

echo Installing required packages...
pip install -r requirements.txt

echo Creating database tables and test user...
python -m app.setup_db

echo Setup complete!
echo.
echo You can now start the backend with: python -m uvicorn app.main:app --reload
echo.
echo Test user credentials:
echo Email: test@agriai.com
echo Password: password123
echo.
pause
