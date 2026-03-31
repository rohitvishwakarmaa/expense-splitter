@echo off
echo =======================================================
echo Starting Smart Expense Splitter Application...
echo =======================================================
echo.
echo Starting Backend API (FastAPI) on Port 8000...
start "Backend API" cmd /k "cd backend && .\venv\Scripts\activate.bat && uvicorn app.main:app --reload --port 8000"

echo Starting Frontend UI (React+Vite) on Port 5173...
start "Frontend UI" cmd /k "cd frontend && npm run dev"

echo.
echo Servers are booting up in separate windows!
echo Please wait a few seconds for everything to load.
echo.
echo The frontend will be available at: http://localhost:5173/
echo The backend API will be available at: http://localhost:8000/
echo.
echo To stop the servers, close the "Backend API" and "Frontend UI" command windows.
pause
