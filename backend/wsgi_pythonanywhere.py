"""
WSGI конфигурация для PythonAnywhere

Этот файл нужно скопировать в PythonAnywhere и настроить пути.
В PythonAnywhere откройте Web → WSGI configuration file и замените содержимое на:

import sys
import os

# Добавляем путь к проекту (ЗАМЕНИТЕ yourusername на ваш username!)
path = '/home/yourusername/adm-gw/backend'
if path not in sys.path:
    sys.path.insert(0, path)

# Меняем рабочую директорию
os.chdir(path)

# Импортируем приложение
from main import app

# Переменная application обязательна для PythonAnywhere
application = app
"""

# Локальная версия для тестирования
if __name__ == "__main__":
    import sys
    import os
    
    # Получаем путь к директории этого файла
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    if current_dir not in sys.path:
        sys.path.insert(0, current_dir)
    
    os.chdir(current_dir)
    
    from main import app
    import uvicorn
    
    print("Запуск WSGI приложения...")
    uvicorn.run(app, host="127.0.0.1", port=8006)

