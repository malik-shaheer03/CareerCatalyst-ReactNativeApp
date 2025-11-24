@echo off
echo Starting CareerCatalyst Backend Services...
echo.

REM Start Password Reset Service (Port 5001)
start "Password Reset Service" cmd /k "node passwordReset.js"
timeout /t 2 /nobreak >nul

REM Start Candidate Email Service (Port 5000)
start "Candidate Email Service" cmd /k "node send_candidate_email.js"
timeout /t 2 /nobreak >nul

REM Start Resume Email Service (Port 5002)
start "Resume Email Service" cmd /k "node sendResumeEmail.js"
timeout /t 2 /nobreak >nul

echo.
echo All backend services started!
echo - Password Reset Service: http://localhost:5001
echo - Candidate Email Service: http://localhost:5000
echo - Resume Email Service: http://localhost:5002
echo.
pause
