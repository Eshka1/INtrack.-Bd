@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or not in PATH.
  pause
  exit /b 1
)

if not exist "backend\.env" (
  if exist "backend\.env.example" copy /Y "backend\.env.example" "backend\.env" >nul
)

start "IN-Track Backend" cmd /k "cd /d ""%~dp0backend"" && if not exist node_modules npm install && npm run dev"
timeout /t 3 /nobreak >nul
start "IN-Track Frontend" cmd /k "cd /d ""%~dp0frontend"" && if not exist node_modules npm install && npm start"

echo.
echo IN-Track is starting in two terminals.
echo Backend: http://localhost:5000/api/health
echo Frontend: usually http://localhost:3000
echo.
echo If MongoDB is unavailable, the backend will use local authentication fallback for development.
pause
