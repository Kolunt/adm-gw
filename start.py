#!/usr/bin/env python3
"""
Скрипт для запуска приложения Анонимный Дед Мороз
"""

import os
import sys
import subprocess
import time
import threading
from pathlib import Path

def run_backend():
    """Запуск FastAPI backend"""
    print("🚀 Запуск FastAPI backend...")
    os.chdir("backend")
    subprocess.run([sys.executable, "main.py"])

def run_frontend():
    """Запуск React frontend"""
    print("🚀 Запуск React frontend...")
    subprocess.run(["npm", "start"])

def main():
    print("🎅 Запуск Анонимного Дед Мороза...")
    
    # Проверяем наличие зависимостей
    if not Path("requirements.txt").exists():
        print("❌ Файл requirements.txt не найден!")
        return
    
    if not Path("package.json").exists():
        print("❌ Файл package.json не найден!")
        return
    
    # Устанавливаем Python зависимости
    print("📦 Установка Python зависимостей...")
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    
    # Устанавливаем Node.js зависимости
    print("📦 Установка Node.js зависимостей...")
    subprocess.run(["npm", "install"])
    
    # Запускаем backend в отдельном потоке
    backend_thread = threading.Thread(target=run_backend)
    backend_thread.daemon = True
    backend_thread.start()
    
    # Ждем немного, чтобы backend запустился
    time.sleep(3)
    
    # Запускаем frontend
    try:
        run_frontend()
    except KeyboardInterrupt:
        print("\n👋 Остановка приложения...")

if __name__ == "__main__":
    main()
