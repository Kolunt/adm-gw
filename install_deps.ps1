# Установка зависимостей для проекта Анонимный Дед Мороз
Write-Host "Установка Python зависимостей..." -ForegroundColor Green

# Проверяем Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python найден: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Python не найден!" -ForegroundColor Red
    exit 1
}

# Устанавливаем зависимости
Write-Host "Устанавливаем зависимости из requirements.txt..." -ForegroundColor Yellow
python -m pip install -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host "Зависимости установлены успешно!" -ForegroundColor Green
} else {
    Write-Host "Ошибка при установке зависимостей!" -ForegroundColor Red
}

Write-Host "Готово!" -ForegroundColor Green

