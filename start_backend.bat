@echo off
cd /d D:\AgriAI
call venv\Scripts\activate
cd /d D:\AgriAI\backend
uvicorn app.main:app --reload
pause
