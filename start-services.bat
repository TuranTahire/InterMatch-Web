@echo off
echo ========================================
echo    INTERMATCH WEB SERVISLERI BASLIYOR
echo ========================================
echo.

echo 1. Backend baslatiliyor...
start "Backend Server" cmd /k "cd /d C:\IntermatchApp\intermatch-web\backend-python && C:\Python312-Full\python.exe app.py"

echo 2. Frontend baslatiliyor...
start "Frontend Server" cmd /k "cd /d C:\IntermatchApp\intermatch-web\frontend && npm start"

echo.
echo ========================================
echo    SERVISLER BASLATILDI!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3002
echo.
echo Servisleri durdurmak icin bu pencereleri kapatabilirsiniz.
echo.
pause
