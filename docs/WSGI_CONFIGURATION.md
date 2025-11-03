# Конфигурация WSGI для PythonAnywhere

## 🔴 Ошибка: ModuleNotFoundError: No module named 'main'

Эта ошибка возникает, когда WSGI файл не может найти модуль `main.py`. 

## ✅ Правильная конфигурация WSGI

### Шаг 1: Откройте WSGI конфигурацию

1. В панели PythonAnywhere откройте **Web**
2. Найдите **WSGI configuration file**
3. Нажмите на ссылку (обычно `/var/www/gwadm_pythonanywhere_com_wsgi.py`)

### Шаг 2: Замените содержимое

**ВАЖНО:** Замените `gwadm` на ваш реальный username на PythonAnywhere!

```python
import sys
import os

# ВАЖНО: Замените 'gwadm' на ваш username!
# Проверить username можно командой: echo $USER
username = 'gwadm'  # ← ЗАМЕНИТЕ НА ВАШ USERNAME!

# Путь к проекту
project_path = f'/home/{username}/gwadm/backend'

# Добавляем путь в sys.path
if project_path not in sys.path:
    sys.path.insert(0, project_path)

# Меняем рабочую директорию на backend
os.chdir(project_path)

# Проверка (для отладки - можно удалить после успешного запуска)
print(f"Current directory: {os.getcwd()}")
print(f"Python path: {sys.path}")
print(f"main.py exists: {os.path.exists('main.py')}")

# Импортируем приложение
from main import app

# Переменная application обязательна для PythonAnywhere
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

## 🐛 Отладка

Если ошибка сохраняется, добавьте в начало WSGI файла:

```python
import sys
import os

# Печать информации для отладки
print("=" * 50)
print(f"Python version: {sys.version}")
print(f"Current working directory: {os.getcwd()}")
print(f"USER environment: {os.environ.get('USER', 'NOT SET')}")
print(f"Home directory: {os.path.expanduser('~')}")
print("=" * 50)
```

Затем проверьте **Server log** в разделе Web - там будет видна эта информация.

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

