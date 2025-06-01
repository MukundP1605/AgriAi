@echo off
echo Setting up AgriAI Marketplace database...
cd backend
python -m app.setup_marketplace
echo Done!
pause
