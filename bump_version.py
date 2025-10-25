#!/usr/bin/env python3
"""
Скрипт для автоматического увеличения версии проекта
"""

import subprocess
import sys
import os

def run_command(command):
    """Выполнить команду и вернуть результат"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def main():
    """Основная функция для увеличения версии"""
    print("🚀 Увеличение версии проекта Анонимный Дед Мороз...")
    
    # Запускаем скрипт версионирования
    success, stdout, stderr = run_command("python version.py increment")
    
    if success:
        print(stdout)
        print("\n✅ Версия успешно увеличена!")
        
        # Показываем текущую версию
        success, version_output, _ = run_command("python version.py")
        if success:
            print(f"\n📦 {version_output}")
    else:
        print(f"❌ Ошибка при увеличении версии: {stderr}")
        sys.exit(1)

if __name__ == "__main__":
    main()
