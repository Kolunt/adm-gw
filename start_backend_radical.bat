@echo off
echo ========================================
echo  АНОНИМНЫЙ ДЕД МОРОЗ - АВТОЗАПУСК
echo ========================================
echo.

echo [1/4] Остановка всех процессов Python...
taskkill /f /im python.exe 2>nul
if %errorlevel% neq 0 (
    echo Процессы Python не найдены или уже остановлены
)

echo [2/4] Ожидание завершения процессов...
timeout /t 2 /nobreak >nul

echo [3/4] Удаление старой базы данных...
cd backend
if exist santa.db del santa.db
echo База данных удалена

echo [4/4] Запуск backend сервера...
echo Backend запускается на http://localhost:8004
echo Нажмите Ctrl+C для остановки
echo.
python -m uvicorn main:app --host 127.0.0.1 --port 8004 --reload

pause
