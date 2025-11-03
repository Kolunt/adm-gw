# Конфигурация WSGI для PythonAnywhere

## 🔴 Ошибка: ModuleNotFoundError: No module named 'main'

Эта ошибка возникает, когда WSGI файл не может найти модуль `main.py`. 

## ✅ Правильная конфигурация WSGI

### Шаг 1: Откройте WSGI конфигурацию

1. В панели PythonAnywhere откройте **Web**
2. Найдите **WSGI configuration file**
3. Нажмите на ссылку (обычно `/var/www/gwadm_pythonanywhere_com_wsgi.py`)

### Шаг 2: Замените содержимое

**Вариант A: С автоматическим определением username (рекомендуется)**

```python
import sys
import os

# Автоматическое определение username (не требует ручной замены)
username = os.environ.get('USER', os.path.expanduser('~').split('/')[-1])
home_dir = os.path.expanduser('~')

# Путь к проекту
project_path = os.path.join(home_dir, 'gwadm', 'backend')

# Добавляем путь в sys.path
if project_path not in sys.path:
    sys.path.insert(0, project_path)

# Меняем рабочую директорию
os.chdir(project_path)

# Импортируем приложение
from main import app

# Переменная application обязательна для PythonAnywhere
application = app
```

**Вариант B: С явным указанием username**

Если вариант A не работает, используйте этот (замените username):

```python
import sys
import os

# ВАЖНО: Замените 'gwadm' на ваш username!
# Проверить username: echo $USER
username = 'gwadm'  # ← ЗАМЕНИТЕ НА ВАШ USERNAME!

project_path = f'/home/{username}/gwadm/backend'

if project_path not in sys.path:
    sys.path.insert(0, project_path)

os.chdir(project_path)

from main import app
application = app
```

### Шаг 3: Как узнать ваш username

В Bash консоли PythonAnywhere выполните:

```bash
echo $USER
# или
whoami
```

### Шаг 4: Проверка путей

После настройки WSGI проверьте в консоли:

```bash
cd ~/gwadm/backend
ls -la main.py  # Должен существовать
pwd             # Должен показать /home/ВАШ_USERNAME/gwadm/backend
```

### Шаг 5: Перезапуск

После изменения WSGI файла:
1. Нажмите **Save** в редакторе WSGI
2. Нажмите **Reload** в разделе Web
3. Проверьте **Error log** на наличие новых ошибок

## 🐛 Отладка с помощью диагностического WSGI файла

Если ошибка сохраняется, используйте версию WSGI с диагностикой:

1. Скопируйте содержимое файла `backend/wsgi_debug.py` в WSGI конфигурацию
2. Или используйте этот вариант с автоматическим определением username:

```python
import sys
import os

# Автоматическое определение username
username = os.environ.get('USER', os.path.expanduser('~').split('/')[-1])
home_dir = os.path.expanduser('~')

# Диагностика (можно удалить после успешного запуска)
print(f"USER: {username}")
print(f"Home: {home_dir}")
print(f"Current dir: {os.getcwd()}")

# Путь к проекту с автоматическим определением username
project_path = os.path.join(home_dir, 'gwadm', 'backend')

print(f"Project path: {project_path}")
print(f"Exists: {os.path.exists(project_path)}")
print(f"main.py exists: {os.path.exists(os.path.join(project_path, 'main.py'))}")

# Добавляем путь
if project_path not in sys.path:
    sys.path.insert(0, project_path)

os.chdir(project_path)

from main import app
application = app
```

Проверьте **Server log** в разделе Web - там будет видна диагностическая информация.

## ✅ Проверка правильности пути

Выполните в консоли PythonAnywhere:

```bash
cd ~
echo $USER  # Ваш username

cd gwadm/backend
pwd         # Должен быть /home/ВАШ_USERNAME/gwadm/backend
ls main.py  # Должен показать файл
```

Убедитесь, что путь в WSGI файле совпадает с выводом `pwd`.

