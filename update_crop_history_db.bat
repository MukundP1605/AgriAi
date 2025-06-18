@echo off
echo Running database schema update for UserCropHistory...
cd /d D:\AgriAI\backend
python -m app.update_crop_history_schema
pause
