@echo off
echo.
echo ========================================
echo   PopcornIQ - Starting Servers
echo ========================================
echo.

echo [1/4] Checking MongoDB status...
sc query MongoDB | find "RUNNING" >nul
if errorlevel 1 (
    echo  ERROR: MongoDB is not running!
    echo  Please start MongoDB service first.
    pause
    exit /b 1
) else (
    echo  OK: MongoDB is running
)

echo.
echo [2/4] Killing existing Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo.
echo [3/4] Installing dependencies (if needed)...
call npm install --silent

echo.
echo [4/4] Starting both servers...
echo.
echo  Frontend will start on: http://localhost:5173
echo  Backend will start on: http://localhost:5000
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start both servers with concurrently
call npm run dev

pause
