"""
Конфигурация для PythonAnywhere

Этот файл содержит настройки для деплоя на PythonAnywhere.
Импортируйте эти настройки в main.py при необходимости.
"""

import os

# PythonAnywhere определяет себя через переменную окружения
IS_PYTHONANYWHERE = (
    'PYTHONANYWHERE_DOMAIN' in os.environ or 
    'pythonanywhere.com' in os.environ.get('HTTP_HOST', '') or
    'pythonanywhere.com' in os.environ.get('SERVER_NAME', '')
)

# Конкретный домен для этого проекта
PRODUCTION_DOMAIN = "https://gwadm.pythonanywhere.com"

# База данных
if IS_PYTHONANYWHERE:
    # Используем абсолютный путь на PythonAnywhere
    DB_PATH = os.path.join(os.path.expanduser('~'), 'gwadm', 'backend', 'santa.db')
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"
else:
    # Локальная разработка
    SQLALCHEMY_DATABASE_URL = "sqlite:///./santa.db"

# Пути для загрузки файлов
if IS_PYTHONANYWHERE:
    UPLOAD_DIR = os.path.join(os.path.expanduser('~'), 'gwadm', 'backend', 'uploads')
    ICON_DIR = os.path.join(UPLOAD_DIR, 'icons')
else:
    UPLOAD_DIR = "uploads"
    ICON_DIR = os.path.join(UPLOAD_DIR, "icons")

# CORS origins для PythonAnywhere
PYTHONANYWHERE_ORIGINS = [
    "https://gwadm.pythonanywhere.com",  # Production домен
    "http://localhost:3000",  # Локальная разработка
    "http://127.0.0.1:3000",
]

# Экспорт настроек
__all__ = [
    'IS_PYTHONANYWHERE',
    'SQLALCHEMY_DATABASE_URL',
    'UPLOAD_DIR',
    'ICON_DIR',
    'PYTHONANYWHERE_ORIGINS',
]

