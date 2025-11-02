"""
Конфигурация для PythonAnywhere

Этот файл содержит настройки для деплоя на PythonAnywhere.
Импортируйте эти настройки в main.py при необходимости.
"""

import os

# PythonAnywhere определяет себя через переменную окружения
IS_PYTHONANYWHERE = 'PYTHONANYWHERE_DOMAIN' in os.environ or 'pythonanywhere.com' in os.environ.get('HTTP_HOST', '')

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
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://kolunt.github.io",  # GitHub Pages frontend
]

# Добавляем домен PythonAnywhere если известен
if IS_PYTHONANYWHERE:
    username = os.environ.get('USER', 'yourusername')
    PYTHONANYWHERE_ORIGINS.append(f"https://{username}.pythonanywhere.com")

# Экспорт настроек
__all__ = [
    'IS_PYTHONANYWHERE',
    'SQLALCHEMY_DATABASE_URL',
    'UPLOAD_DIR',
    'ICON_DIR',
    'PYTHONANYWHERE_ORIGINS',
]

