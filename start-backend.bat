@echo off
echo ===================================================
echo Starting ParivarSetu Backend API (FastAPI)
echo Government of Gujarat - One Family One ID
echo ===================================================
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
