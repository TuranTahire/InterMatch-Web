@echo off
echo ====================================================
echo 🚀 Intermatch Web - Full Stack Setup
echo ====================================================

echo Starting both Frontend and Python Backend...

echo.
echo 🐍 Starting Python Backend...
start "Python Backend" cmd /k "cd backend-python && python run.py"

timeout /t 3 /nobreak > nul

echo.
echo ⚛️  Starting React Frontend...
start "React Frontend" cmd /k "cd frontend && npm start"

echo.
echo ✅ Both servers are starting...
echo 🌐 Frontend: http://localhost:3002
echo 🐍 Backend: http://localhost:5000
echo 📖 API Docs: http://localhost:5000/analyze
echo.
echo Press any key to close this window...
pause > nul
