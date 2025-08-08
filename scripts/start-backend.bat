@echo off
echo ====================================================
echo 🐍 Starting Python Backend for Intermatch Web
echo ====================================================

cd backend-python

echo 📦 Installing Python dependencies...
pip install -r requirements.txt

echo.
echo 🚀 Starting Python Backend Server...
echo 🌐 Server: http://localhost:5000
echo 📖 API Docs: http://localhost:5000/analyze
echo.

python run.py

pause
