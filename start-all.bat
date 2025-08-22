@echo off
echo Starting All Servers...
echo.
echo Starting Backend Server...
start "Backend" cmd /k "cd /d C:\IntermatchApp\intermatch-web\backend-python & python app.py"
echo.
echo Starting Frontend Server...
start "Frontend" cmd /k "cd /d C:\IntermatchApp\intermatch-web\frontend & npm start"
echo.
echo Both servers are starting...
echo Frontend: http://localhost:3003
echo Backend: http://localhost:5001
echo.
pause
