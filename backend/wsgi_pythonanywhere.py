"""
WSGI конфигурация для PythonAnywhere
Эта версия использует расширенную диагностику и автоматическое определение путей
"""
import sys
import os

# Диагностика - выводим информацию в error log
print("=" * 70)
print("WSGI CONFIGURATION DEBUG")
print("=" * 70)

# Автоматическое определение username и home directory
username = os.environ.get('USER', 'unknown')
home_dir = os.path.expanduser('~')
current_dir = os.getcwd()

print(f"Username (from env): {username}")
print(f"Home directory: {home_dir}")
print(f"Current directory (before chdir): {current_dir}")

# Проверяем возможные пути к проекту
possible_paths = [
    os.path.join(home_dir, 'gwadm', 'backend'),      # Стандартный путь
    os.path.join(home_dir, 'gwadm', 'gwadm', 'backend'),  # Если двойная вложенность
    '/home/gwadm/gwadm/backend',  # Явный путь
    os.path.join(current_dir, 'backend'),  # Относительно текущей директории
]

print("\nChecking possible project paths:")
valid_path = None
for path in possible_paths:
    abs_path = os.path.abspath(path)
    exists = os.path.exists(abs_path)
    main_py_exists = os.path.exists(os.path.join(abs_path, 'main.py'))
    print(f"  - {abs_path}")
    print(f"    Exists: {exists}")
    print(f"    main.py exists: {main_py_exists}")
    if exists and main_py_exists and not valid_path:
        valid_path = abs_path
        print(f"    ✅ SELECTED THIS PATH")

print("\n" + "=" * 70)

if not valid_path:
    print("❌ ERROR: No valid project path found!")
    print("Please check:")
    print("1. Project structure on PythonAnywhere")
    print("2. Location of main.py file")
    print("3. Execute: cd ~/gwadm && find . -name 'main.py'")
    raise ImportError("Cannot find main.py. Check project structure on PythonAnywhere.")

# Используем найденный путь
project_path = valid_path
print(f"✅ Using project path: {project_path}")

# Добавляем путь в sys.path
if project_path not in sys.path:
    sys.path.insert(0, project_path)
    print(f"✅ Added to sys.path: {project_path}")

# Меняем рабочую директорию
try:
    os.chdir(project_path)
    print(f"✅ Changed to: {os.getcwd()}")
except Exception as e:
    print(f"❌ Error changing directory: {e}")
    raise

# Проверка перед импортом
main_py_path = os.path.join(project_path, 'main.py')
if not os.path.exists(main_py_path):
    print(f"❌ ERROR: main.py not found at {main_py_path}")
    print("\nTroubleshooting:")
    print(f"1. Check if file exists: ls -la {main_py_path}")
    print(f"2. List directory contents: ls -la {project_path}")
    print("3. Update from Git: cd ~/gwadm && git pull origin master")
    raise ImportError(f"main.py not found at {main_py_path}")

print(f"✅ main.py found at: {main_py_path}")

# Импортируем приложение
try:
    print("Importing app from main...")
    from main import app
    print("✅ Successfully imported app")
    application = app
    print("✅ WSGI application configured successfully")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("\nTroubleshooting:")
    print("1. Check main.py syntax: python3.10 -m py_compile main.py")
    print("2. Check dependencies: pip3.10 list | grep fastapi")
    print("3. Check error log for detailed traceback")
    raise
except Exception as e:
    print(f"❌ Other error: {e}")
    import traceback
    traceback.print_exc()
    raise

print("=" * 70)
print("WSGI configuration loaded successfully")
print("=" * 70)
