"""
WSGI конфигурация с диагностикой для PythonAnywhere
Используйте этот файл для отладки проблем с импортом
"""
import sys
import os

# Диагностика - выводим информацию в error log
print("=" * 60)
print("WSGI DEBUG INFO")
print("=" * 60)

# Определяем username автоматически
username = os.environ.get('USER', 'unknown')
home_dir = os.path.expanduser('~')
print(f"USER env: {username}")
print(f"Home directory: {home_dir}")
print(f"Current directory: {os.getcwd()}")

# Путь к проекту
project_path = os.path.join(home_dir, 'gwadm', 'backend')
print(f"Project path: {project_path}")
print(f"Project path exists: {os.path.exists(project_path)}")

if os.path.exists(project_path):
    print(f"Files in project_path:")
    try:
        files = os.listdir(project_path)
        for f in files[:10]:  # Показываем первые 10 файлов
            print(f"  - {f}")
    except Exception as e:
        print(f"Error listing files: {e}")

print(f"main.py exists: {os.path.exists(os.path.join(project_path, 'main.py'))}")
print(f"Python path before: {sys.path}")
print("=" * 60)

# Добавляем путь к проекту
if project_path not in sys.path:
    sys.path.insert(0, project_path)

print(f"Python path after: {sys.path}")

# Меняем рабочую директорию
try:
    os.chdir(project_path)
    print(f"Changed to: {os.getcwd()}")
except Exception as e:
    print(f"Error changing directory: {e}")

# Проверка перед импортом
print(f"main.py in current dir: {os.path.exists('main.py')}")
print("=" * 60)

# Импортируем приложение
try:
    from main import app
    print("✅ Successfully imported app")
    application = app
except ImportError as e:
    print(f"❌ Import error: {e}")
    raise
except Exception as e:
    print(f"❌ Other error: {e}")
    raise

print("=" * 60)
print("WSGI configuration loaded successfully")
print("=" * 60)

