@echo off
echo ============================================================
echo   Career Path ML Service - Complete Setup
echo ============================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo [1/3] Installing Python dependencies...
echo.
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/3] Training ML model...
echo.
python train_model.py
if errorlevel 1 (
    echo ERROR: Model training failed
    pause
    exit /b 1
)

echo.
echo [3/3] Starting ML API server...
echo.
echo API will be available at: http://localhost:8001
echo Documentation: http://localhost:8001/docs
echo.
echo Press Ctrl+C to stop the server
echo.

python api\ml_server.py

pause
