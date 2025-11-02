# Dockerfile для проекта "Анонимный Дед Мороз"
# Многостадийная сборка для оптимизации размера

# ============================================
# Stage 1: Сборка Frontend (React)
# ============================================
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Копируем файлы package.json для установки зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production=false

# Копируем исходный код фронтенда
COPY public/ ./public/
COPY src/ ./src/

# Собираем React приложение
RUN npm run build

# ============================================
# Stage 2: Backend + Frontend
# ============================================
FROM python:3.10-slim

WORKDIR /app

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Копируем requirements и устанавливаем Python зависимости
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Копируем backend код
COPY backend/ ./backend/

# Копируем собранный frontend из предыдущей стадии
COPY --from=frontend-builder /app/build ./build

# Создаем необходимые директории
RUN mkdir -p backend/uploads/icons

# Переменные окружения
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Открываем порт
EXPOSE 8006

# Команда запуска
WORKDIR /app/backend
CMD ["python", "main.py"]

