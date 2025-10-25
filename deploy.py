#!/usr/bin/env python3
"""
Скрипт для автоматического деплоя в GitHub репозиторий после версионирования
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, cwd=None):
    """Выполнить команду и вернуть результат"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, cwd=cwd)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def check_git_status():
    """Проверить статус git репозитория"""
    success, stdout, stderr = run_command("git status --porcelain")
    if success:
        return stdout.strip() != ""
    return False

def commit_and_push():
    """Закоммитить и запушить изменения"""
    print("🔄 Подготовка к деплою в GitHub...")
    
    # Проверяем, есть ли изменения
    if not check_git_status():
        print("ℹ️ Нет изменений для коммита")
        return True
    
    # Добавляем все файлы
    print("📁 Добавление файлов в git...")
    success, stdout, stderr = run_command("git add .")
    if not success:
        print(f"❌ Ошибка при добавлении файлов: {stderr}")
        return False
    
    # Получаем текущую версию
    version_file = Path("VERSION")
    if version_file.exists():
        version = version_file.read_text().strip()
    else:
        version = "unknown"
    
    # Создаем коммит
    commit_message = f"🚀 Release v{version} - Анонимный Дед Мороз"
    print(f"💾 Создание коммита: {commit_message}")
    success, stdout, stderr = run_command(f'git commit -m "{commit_message}"')
    if not success:
        print(f"❌ Ошибка при создании коммита: {stderr}")
        return False
    
    # Пушим в репозиторий
    print("🚀 Отправка в GitHub репозиторий...")
    success, stdout, stderr = run_command("git push origin main")
    if not success:
        # Пробуем master если main не работает
        success, stdout, stderr = run_command("git push origin master")
        if not success:
            print(f"❌ Ошибка при отправке в репозиторий: {stderr}")
            return False
    
    print("✅ Успешно отправлено в GitHub!")
    return True

def main():
    """Основная функция деплоя"""
    print("🎅 Деплой проекта Анонимный Дед Мороз в GitHub...")
    
    # Проверяем, что мы в git репозитории
    if not Path(".git").exists():
        print("❌ Не найден git репозиторий. Инициализируем...")
        success, stdout, stderr = run_command("git init")
        if not success:
            print(f"❌ Ошибка инициализации git: {stderr}")
            return False
        
        # Добавляем remote origin
        success, stdout, stderr = run_command("git remote add origin https://github.com/Kolunt/adm-gw.git")
        if not success:
            print(f"❌ Ошибка добавления remote: {stderr}")
            return False
    
    # Проверяем remote
    success, stdout, stderr = run_command("git remote -v")
    if success:
        print(f"📡 Remote репозитории: {stdout}")
    
    # Коммитим и пушим
    if commit_and_push():
        print("🎉 Деплой завершен успешно!")
        print("🌐 Репозиторий: https://github.com/Kolunt/adm-gw")
    else:
        print("❌ Ошибка при деплое")
        sys.exit(1)

if __name__ == "__main__":
    main()
