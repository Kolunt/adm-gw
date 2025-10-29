# Запуск проекта Анонимный Дед Мороз
Write-Host "========================================" -ForegroundColor Green
Write-Host "   ЗАПУСК ПРОЕКТА АНОНИМНЫЙ ДЕД МОРОЗ" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Останавливаем все процессы на портах 3000 и 8006
Write-Host "`n[1/3] Останавливаем все процессы на портах 3000 и 8006..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Get-NetTCPConnection -LocalPort 8006 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

# Запускаем бэкенд
Write-Host "[2/3] Запускаем бэкенд на порту 8006..." -ForegroundColor Yellow
Set-Location backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python main.py" -WindowStyle Normal
Set-Location ..

# Ждем немного, чтобы бэкенд запустился
Start-Sleep -Seconds 3

# Запускаем фронтенд
Write-Host "[3/3] Запускаем фронтенд на порту 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "   ПРОЕКТ ЗАПУЩЕН!" -ForegroundColor Green
Write-Host "   Фронтенд: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Бэкенд:   http://localhost:8006" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nНажмите любую клавишу для выхода..." -ForegroundColor White
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
