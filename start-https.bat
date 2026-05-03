@echo off
cd /d "%~dp0"
echo Starting HTTPS server for camera access...
echo Install serve first if needed: npm install -g serve
npx serve . --ssl -p 3000
if errorlevel 1 (
  echo Trying HTTP fallback...
  npx serve . -p 3000
)
echo.
echo Open: https://localhost:3000 ^(or http://localhost:3000^)
pause

