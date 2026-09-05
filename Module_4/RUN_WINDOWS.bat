@echo off
title IN-Track Module 4 - Final Simple
cd /d %~dp0

echo.
echo ==========================================
echo      IN-Track Module 4 - Final Simple
echo ==========================================
echo.

if not exist node_modules (
  echo Installing root dependency...
  call npm install
)

if not exist frontend\node_modules (
  echo Installing frontend dependencies...
  call npm install --prefix frontend
)

if not exist backend\node_modules (
  echo Installing backend dependencies...
  call npm install --prefix backend
)

echo.
echo Backend : http://localhost:5000
echo Frontend: http://localhost:5173
echo.

call npm run dev
