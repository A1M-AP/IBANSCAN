@echo off
setlocal
title IBANScan - Avvio sito
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js non e installato. Installa Node.js 22 o successivo da https://nodejs.org
  pause
  exit /b 1
)
node "%~dp0scripts\preview-launcher.mjs" start
if errorlevel 1 (
  echo.
  echo Avvio non riuscito. I dettagli sono riportati sopra.
  pause
  exit /b 1
)
exit /b 0
