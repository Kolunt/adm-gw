#!/usr/bin/env python3
"""Скрипт для очистки репозитория от лишних файлов"""
import subprocess
import os

# Файлы и паттерны для удаления из git
files_to_remove = []

# Находим все REPORT.md файлы (кроме основных)
report_files = []
for f in os.listdir('.'):
    if f.endswith('_REPORT.md') and os.path.isfile(f):
        report_files.append(f)

# Находим тестовые скрипты
test_scripts = [f for f in os.listdir('.') if f.startswith('test_') and f.endswith('.py')]
check_scripts = [f for f in os.listdir('.') if f.startswith('check_') and f.endswith('.py')]
create_scripts = [f for f in os.listdir('.') if f.startswith('create_') and f.endswith('.py')]
copy_scripts = [f for f in os.listdir('.') if f.startswith('copy_') and f.endswith('.py')]
debug_scripts = [f for f in os.listdir('.') if f.startswith('debug_') and f.endswith('.py')]

all_files = report_files + test_scripts + check_scripts + create_scripts + copy_scripts + debug_scripts

# Добавляем файлы, которые нужно удалить из git
files_to_remove.extend([
    'test_api.bat',
    'add_block_reason_field.py',
    'bump_version.py',
    'deploy.py',
    'reset_database.py',
    'start_backend.py',
    'start_simple.py',
    'start.py',
    'version.py',
    'analyze_size.py',
    'cleanup_repo.py'
])

files_to_remove.extend(all_files)

print(f"Найдено файлов для удаления из git: {len(files_to_remove)}")
print("\nСписок файлов:")
for f in sorted(files_to_remove):
    if os.path.exists(f):
        print(f"  - {f}")

response = input("\nУдалить эти файлы из git tracking? (y/n): ")
if response.lower() == 'y':
    for f in files_to_remove:
        if os.path.exists(f):
            try:
                subprocess.run(['git', 'rm', '--cached', f], check=True, capture_output=True)
                print(f"  ✓ Удален из git: {f}")
            except subprocess.CalledProcessError as e:
                print(f"  ✗ Ошибка при удалении {f}: {e}")
    
    print("\n✓ Готово! Файлы удалены из git tracking.")
    print("  Файлы остались на диске, но больше не отслеживаются.")
    print("\nСледующие шаги:")
    print("  1. Проверьте изменения: git status")
    print("  2. Закоммитьте: git commit -m 'Remove test scripts and reports from tracking'")
else:
    print("Отменено.")

