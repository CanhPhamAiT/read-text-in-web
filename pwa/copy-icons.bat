@echo off
REM Script to copy icons from extension to PWA (Windows)

echo Copying icons from extension to PWA...

REM Create icons directory if it doesn't exist
if not exist "icons" mkdir icons

REM Copy base icon
if exist "..\extension\icons\icon128.png" (
    copy "..\extension\icons\icon128.png" "icons\icon128.png"
    echo ✓ Copied icon128.png
) else (
    echo ⚠ Warning: icon128.png not found in extension\icons\
)

REM Create other sizes (copy same icon for now)
if exist "icons\icon128.png" (
    copy "icons\icon128.png" "icons\icon72.png"
    copy "icons\icon128.png" "icons\icon96.png"
    copy "icons\icon128.png" "icons\icon144.png"
    copy "icons\icon128.png" "icons\icon192.png"
    copy "icons\icon128.png" "icons\icon512.png"
    echo ✓ Created all icon sizes (using icon128 as base)
    echo ⚠ Note: You should create proper sized icons for production
) else (
    echo ❌ Error: Could not find base icon
    exit /b 1
)

echo Done! Icons are in pwa\icons\

