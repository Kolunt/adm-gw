#!/bin/bash
# Скрипт автоматического деплоя на PythonAnywhere
# Использование: загрузите этот файл на PythonAnywhere и выполните ~/deploy_pythonanywhere.sh

set -e  # Остановка при ошибке

echo "=== Деплой проекта Анонимный Дед Мороз ==="
echo ""

# Получаем путь к проекту
PROJECT_DIR="$HOME/gwadm"
BACKEND_DIR="$PROJECT_DIR/backend"

# Проверяем существование проекта
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Папка проекта не найдена: $PROJECT_DIR"
    echo "Выполните сначала: git clone https://github.com/Kolunt/gwadm.git"
    exit 1
fi

# Переходим в папку проекта
cd "$PROJECT_DIR"

# Обновляем код из Git
echo "1. Обновление кода из Git..."
if git pull origin master; then
    echo "✅ Код обновлен"
else
    echo "❌ Ошибка обновления кода из Git"
    echo "Проверьте подключение к интернету и права доступа"
    exit 1
fi

# Переходим в папку backend
cd "$BACKEND_DIR"

# Проверяем наличие requirements.txt
if [ ! -f "requirements.txt" ]; then
    echo "⚠️  requirements.txt не найден в backend/, пытаемся скопировать из корня..."
    if [ -f "../requirements.txt" ]; then
        cp ../requirements.txt .
        echo "✅ requirements.txt скопирован"
    else
        echo "❌ requirements.txt не найден ни в backend/, ни в корне проекта"
        exit 1
    fi
fi

# Устанавливаем/обновляем зависимости
echo ""
echo "2. Проверка и установка зависимостей..."
if pip3.10 install --user -r requirements.txt --quiet --upgrade; then
    echo "✅ Зависимости обновлены"
else
    echo "⚠️  Предупреждение: некоторые зависимости могли не установиться"
fi

# Проверяем наличие main.py
if [ ! -f "main.py" ]; then
    echo "❌ main.py не найден в $BACKEND_DIR"
    exit 1
fi

echo ""
echo "3. Проверка структуры проекта..."
echo "✅ Проект готов"

echo ""
echo "=========================================="
echo "✅ Деплой завершен успешно!"
echo ""
echo "⚠️  ВАЖНО: Перейдите в панель PythonAnywhere → Web → Reload"
echo "для применения изменений и перезапуска веб-приложения"
echo "=========================================="

