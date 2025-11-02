#!/usr/bin/env python3
"""
Скрипт для запуска backend сервера
"""
import os
import sys
import subprocess

def main():
    # Переходим в директорию backend
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    os.chdir(backend_dir)
    
    print(f"Запуск backend из директории: {os.getcwd()}")
    
    # Проверяем, что main.py существует
    if not os.path.exists('main.py'):
        print("❌ Файл main.py не найден!")
        return
    
    # Удаляем старую базу данных если она есть
    db_file = 'santa.db'
    if os.path.exists(db_file):
        os.remove(db_file)
        print(f"🗑️ Удалена старая база данных: {db_file}")
    
    # Запускаем uvicorn
    try:
        print("🚀 Запуск backend сервера...")
        subprocess.run([
            sys.executable, '-m', 'uvicorn', 
            'main:app', 
            '--host', '127.0.0.1', 
            '--port', '8001', 
            '--reload'
        ], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Ошибка при запуске: {e}")
    except KeyboardInterrupt:
        print("\n🛑 Остановка сервера...")

if __name__ == "__main__":
    main()

