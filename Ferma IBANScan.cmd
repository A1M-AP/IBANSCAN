@echo off
setlocal
title IBANScan - Arresto sito
cd /d "%~dp0"
node "%~dp0scripts\preview-launcher.mjs" stop
if errorlevel 1 (
  pause
  exit /b 1
)
timeout /t 2 /nobreak >nul
exit /b 0
