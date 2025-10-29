@echo off
echo Установка зависимостей для проекта Анонимный Дед Мороз
echo.

echo Проверяем Python...
python --version
if %errorlevel% neq 0 (
    echo Python не найден!
    pause
    exit /b 1
)

echo.
echo Устанавливаем зависимости из requirements.txt...
python -m pip install -r requirements.txt

if %errorlevel% equ 0 (
    echo.
    echo Зависимости установлены успешно!
) else (
    echo.
    echo Ошибка при установке зависимостей!
)

echo.
echo Готово!
pause

