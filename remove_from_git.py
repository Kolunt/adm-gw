#!/usr/bin/env python3
import subprocess
import os

# Получаем список всех REPORT.md файлов из git
result = subprocess.run(['git', 'ls-files'], capture_output=True, text=True)
all_files = result.stdout.strip().split('\n')

# Фильтруем файлы для удаления
files_to_remove = []
patterns = [
    '_REPORT.md',
    'test_',
    'check_',
    'create_',
    'copy_',
    'debug_',
]

for file in all_files:
    filename = os.path.basename(file)
    if any(pattern in filename for pattern in patterns):
        files_to_remove.append(file)

# Также добавляем специфичные файлы
extra_files = [
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
    'cleanup_repo.py',
    'remove_from_git.py',
]

for f in extra_files:
    if f in all_files:
        files_to_remove.append(f)

# Удаляем файлы из git tracking
print(f"Удаление {len(files_to_remove)} файлов из git tracking...\n")

for f in files_to_remove:
    try:
        subprocess.run(['git', 'rm', '--cached', f], check=True, capture_output=True)
        print(f"[OK] {f}")
    except subprocess.CalledProcessError:
        pass

print(f"\n[OK] Готово! Удалено {len(files_to_remove)} файлов из git tracking.")

