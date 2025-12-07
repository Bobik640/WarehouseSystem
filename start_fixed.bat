@echo off
echo Закрываю старый процесс на порту 3001...
taskkill /F /PID 10092 2>nul
timeout /t 1 /nobreak >nul

cd /d "C:\Users\user\Desktop\WarehouseSystem"
echo.
echo 🚀 ЗАПУСКАЮ WAREHOUSE API...
echo 📍 Адрес: http://localhost:3001
echo.
node server.js

pause