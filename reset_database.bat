@echo off
echo 🎅 Сброс базы данных Анонимный Дед Мороз
echo ================================================

REM Останавливаем все процессы Python
echo 🛑 Останавливаем backend...
taskkill /f /im python.exe >nul 2>&1

REM Удаляем базу данных
echo 🗑️ Удаляем старую базу данных...
if exist santa.db (
    del santa.db
    echo ✅ База данных удалена
) else (
    echo ℹ️ База данных не найдена
)

REM Запускаем скрипт сброса
echo 🔄 Запускаем скрипт сброса...
python reset_database.py

echo.
echo ✅ Готово! Теперь запустите:
echo    .\start_backend_8006.bat
echo.
pause

