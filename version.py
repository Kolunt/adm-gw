#!/usr/bin/env python3
"""
Скрипт для управления версиями проекта Анонимный Дед Мороз
"""

import os
import re
import sys
from pathlib import Path

def get_version():
    """Получить текущую версию из файла VERSION"""
    version_file = Path("VERSION")
    if version_file.exists():
        return version_file.read_text().strip()
    return "0.0.1"

def increment_version():
    """Увеличить версию на 1"""
    current_version = get_version()
    parts = current_version.split('.')
    
    # Увеличиваем последнюю часть версии
    parts[-1] = str(int(parts[-1]) + 1)
    new_version = '.'.join(parts)
    
    # Записываем новую версию
    with open("VERSION", "w") as f:
        f.write(new_version)
    
    return new_version

def update_package_json(version):
    """Обновить версию в package.json"""
    package_json_path = Path("package.json")
    if package_json_path.exists():
        content = package_json_path.read_text(encoding='utf-8')
        # Заменяем версию в package.json
        content = re.sub(r'"version":\s*"[^"]*"', f'"version": "{version}"', content)
        package_json_path.write_text(content, encoding='utf-8')
        print(f"Обновлен package.json до версии {version}")

def update_backend_version(version):
    """Обновить версию в backend/main.py"""
    main_py_path = Path("backend/main.py")
    if main_py_path.exists():
        content = main_py_path.read_text(encoding='utf-8')
        # Заменяем версию в FastAPI app
        content = re.sub(r'version="[^"]*"', f'version="{version}"', content)
        main_py_path.write_text(content, encoding='utf-8')
        print(f"Обновлен backend/main.py до версии {version}")

def update_readme_version(version):
    """Обновить версию в README.md"""
    readme_path = Path("README.md")
    if readme_path.exists():
        content = readme_path.read_text(encoding='utf-8')
        # Заменяем версию в заголовке
        content = re.sub(r'# 🎅 Анонимный Дед Мороз v\d+\.\d+\.\d+', f'# 🎅 Анонимный Дед Мороз v{version}', content)
        if not re.search(r'# 🎅 Анонимный Дед Мороз v\d+\.\d+\.\d+', content):
            # Если заголовок без версии, добавляем версию
            content = content.replace('# 🎅 Анонимный Дед Мороз', f'# 🎅 Анонимный Дед Мороз v{version}')
        readme_path.write_text(content, encoding='utf-8')
        print(f"Обновлен README.md до версии {version}")

def main():
    """Основная функция"""
    if len(sys.argv) > 1 and sys.argv[1] == "increment":
        # Увеличиваем версию
        new_version = increment_version()
        print(f"Версия увеличена до: {new_version}")
        
        # Обновляем все файлы
        update_package_json(new_version)
        update_backend_version(new_version)
        update_readme_version(new_version)
        
        print(f"Все файлы обновлены до версии {new_version}")
        
        # Автоматически деплоим в GitHub
        print("\nАвтоматический деплой в GitHub...")
        import subprocess
        try:
            result = subprocess.run([sys.executable, "deploy.py"], capture_output=True, text=True)
            if result.returncode == 0:
                print("Деплой в GitHub завершен успешно!")
                print("Репозиторий: https://github.com/Kolunt/adm-gw")
            else:
                print(f"⚠️ Деплой завершен с предупреждениями: {result.stderr}")
        except Exception as e:
            print(f"Ошибка при деплое: {e}")
            print("Выполните деплой вручную: python deploy.py")
    else:
        # Показываем текущую версию
        current_version = get_version()
        print(f"Текущая версия: {current_version}")
        print("\nИспользование:")
        print("  python version.py          - показать текущую версию")
        print("  python version.py increment - увеличить версию на 1 и задеплоить в GitHub")

if __name__ == "__main__":
    main()
