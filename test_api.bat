@echo off
echo ========================================
echo    ТЕСТИРОВАНИЕ API
echo ========================================

echo Проверяем бэкенд...
curl -s http://localhost:8006/api/test
echo.

echo Проверяем FAQ...
curl -s http://localhost:8006/api/faq
echo.

echo Проверяем меню...
curl -s http://localhost:8006/api/menu
echo.

echo.
echo Нажмите любую клавишу для выхода...
pause >nul
