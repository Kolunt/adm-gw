"""
Конфигурация для автоматического определения окружения (локальное/продакшн)
Используется для переключения между локальной разработкой и PythonAnywhere
"""
import os

# Определение окружения
IS_PYTHONANYWHERE = (
    'PYTHONANYWHERE_DOMAIN' in os.environ or 
    'pythonanywhere.com' in os.environ.get('HTTP_HOST', '') or
    'pythonanywhere.com' in os.environ.get('SERVER_NAME', '')
)

# Константы доменов
PRODUCTION_DOMAIN = "https://gwadm.pythonanywhere.com"
LOCAL_BACKEND_URL = "http://localhost:8006"
LOCAL_FRONTEND_URL = "http://localhost:3000"

# Настройки базы данных
if IS_PYTHONANYWHERE:
    # Production на PythonAnywhere (бесплатный план)
    DB_PATH = os.path.join(os.path.expanduser('~'), 'gwadm', 'backend', 'santa.db')
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"
    
    # Пути для загрузки файлов
    UPLOAD_DIR = os.path.join(os.path.expanduser('~'), 'gwadm', 'backend', 'uploads')
    ICON_DIR = os.path.join(UPLOAD_DIR, 'icons')
else:
    # Локальная разработка
    DB_PATH = "santa.db"
    SQLALCHEMY_DATABASE_URL = "sqlite:///./santa.db"
    
    # Пути для загрузки файлов
    UPLOAD_DIR = "uploads"
    ICON_DIR = os.path.join(UPLOAD_DIR, "icons")

# CORS origins
if IS_PYTHONANYWHERE:
    CORS_ORIGINS = [
        PRODUCTION_DOMAIN,
        LOCAL_FRONTEND_URL,  # Для локальной разработки фронтенда с production backend
        "http://127.0.0.1:3000",
    ]
else:
    CORS_ORIGINS = [
        LOCAL_FRONTEND_URL,
        "http://127.0.0.1:3000",
        PRODUCTION_DOMAIN,  # Для тестирования
    ]

# Добавляем кастомные origins из переменной окружения
custom_origins = os.getenv("CORS_ORIGINS", "")
if custom_origins:
    CORS_ORIGINS.extend([origin.strip() for origin in custom_origins.split(",") if origin.strip()])

# Убираем дубликаты
CORS_ORIGINS = list(dict.fromkeys(CORS_ORIGINS))

# Экспорт
__all__ = [
    'IS_PYTHONANYWHERE',
    'PRODUCTION_DOMAIN',
    'LOCAL_BACKEND_URL',
    'LOCAL_FRONTEND_URL',
    'DB_PATH',
    'SQLALCHEMY_DATABASE_URL',
    'UPLOAD_DIR',
    'ICON_DIR',
    'CORS_ORIGINS',
]

