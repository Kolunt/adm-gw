#!/usr/bin/env python3
"""Оптимизация размера проекта"""
import subprocess
import os
import shutil

def run_command(cmd):
    """Выполняет команду"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def main():
    print("Оптимизация размера проекта...")
    print()
    
    # 1. Очистка .git через git gc
    print("[1/5] Очистка .git репозитория...")
    success, stdout, stderr = run_command("git gc --aggressive --prune=now")
    if success:
        print("  OK: .git оптимизирован")
    else:
        print(f"  Ошибка: {stderr}")
    
    # 2. Удаление build и dist папок
    print("\n[2/5] Удаление папок build/ и dist/...")
    for folder in ['build', 'dist']:
        if os.path.exists(folder):
            try:
                shutil.rmtree(folder)
                print(f"  OK: {folder}/ удален")
            except Exception as e:
                print(f"  Ошибка удаления {folder}/: {e}")
        else:
            print(f"  INFO: {folder}/ не существует")
    
    # 3. Очистка __pycache__
    print("\n[3/5] Очистка __pycache__...")
    removed = 0
    for root, dirs, files in os.walk('.'):
        if '__pycache__' in dirs:
            pycache_path = os.path.join(root, '__pycache__')
            try:
                shutil.rmtree(pycache_path)
                removed += 1
            except:
                pass
    print(f"  OK: Удалено {removed} __pycache__ папок")
    
    # 4. Проверка node_modules в git
    print("\n[4/5] Проверка node_modules в git...")
    success, stdout, stderr = run_command('git ls-files | findstr /c:"node_modules"')
    if stdout.strip():
        print("  WARNING: node_modules найден в git!")
        print("  Выполните: git rm -r --cached node_modules")
    else:
        print("  OK: node_modules не отслеживается git")
    
    # 5. Очистка .git от больших файлов (если node_modules был в истории)
    print("\n[5/5] Проверка истории git на большие файлы...")
    success, stdout, stderr = run_command('git rev-list --objects --all | git cat-file --batch-check="%(objecttype) %(objectname) %(objectsize) %(rest)" | findstr /c:"blob" | findstr /c:"node_modules"')
    if stdout.strip():
        print("  WARNING: node_modules найден в истории git!")
        print("  Рекомендуется использовать git filter-branch или BFG Repo-Cleaner")
    else:
        print("  OK: node_modules не найден в истории")
    
    print("\n" + "="*50)
    print("Оптимизация завершена!")
    print("\nСледующие шаги:")
    print("1. Если node_modules был в git - удалите его из истории")
    print("2. Проверьте размер: python check_sizes.py")
    print("3. Закоммитьте изменения (если были)")

if __name__ == "__main__":
    main()

