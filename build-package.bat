@echo off
REM Script để build extension package cho Chrome Web Store / Edge Add-ons (Windows)

echo 📦 Building extension package...

REM Lấy version từ manifest.json
for /f "tokens=2 delims=:" %%a in ('findstr /c:"version" extension\manifest.json') do (
    set VERSION=%%a
    set VERSION=!VERSION:"=!
    set VERSION=!VERSION:,=!
    set VERSION=!VERSION: =!
)

echo Version: %VERSION%
set PACKAGE_NAME=metruyencv-reader-v%VERSION%.zip

REM Xóa file ZIP cũ nếu có
if exist "%PACKAGE_NAME%" del "%PACKAGE_NAME%"

REM Tạo ZIP từ thư mục extension
echo Creating ZIP file...
cd extension
powershell Compress-Archive -Path * -DestinationPath ..\%PACKAGE_NAME% -Force
cd ..

echo ✅ Package created: %PACKAGE_NAME%
for %%A in (%PACKAGE_NAME%) do echo 📏 File size: %%~zA bytes
echo.
echo 📋 Checklist before upload:
echo   [ ] Icons đã có (16x16, 48x48, 128x128)
echo   [ ] Đã test extension
echo   [ ] Privacy Policy đã chuẩn bị
echo   [ ] Screenshots đã có
echo.
echo 🚀 Ready to upload to store!
pause

