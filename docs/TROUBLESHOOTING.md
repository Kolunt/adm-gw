# Устранение проблем при деплое на PythonAnywhere

## 🔴 Ошибка: main.py exists: False

Если в Server log видно:
```
Project path: /home/username/gwadm/backend
main.py exists: False
```

Это означает, что файл `main.py` не найден в директории `backend/`.

### ✅ Решение

**Проверьте структуру проекта на PythonAnywhere:**

```bash
cd ~/gwadm
ls -la
# Должны быть: backend/, build/, package.json, src/

cd ~/gwadm/backend
ls -la main.py  # Должен существовать!
```

**Если `main.py` отсутствует:**

1. Обновите проект из GitHub:
   ```bash
   cd ~/gwadm
   git pull origin master
   ```

2. Проверьте, что файл появился:
   ```bash
   ls -la backend/main.py
   ```

3. Перезапустите приложение:
   - Web → Reload

**Если файл всё ещё отсутствует:**

Проверьте, правильно ли был склонирован репозиторий:
```bash
cd ~
ls -la gwadm/  # Проверьте структуру
cd gwadm
git status
git remote -v  # Должен показывать https://github.com/Kolunt/gwadm.git
```

## 🔴 Ошибка 500 (Internal Server Error)

Если вы получаете ошибку 500 при открытии сайта, выполните следующие шаги:

### Шаг 1: Проверка логов ошибок

1. Откройте панель PythonAnywhere: **Web**
2. Нажмите на **Error log** (или откройте `/var/log/yourusername.pythonanywhere.com.error.log`)
3. Скопируйте последние строки ошибки

Обычные причины ошибки 500:
- Проблемы с импортами
- Ошибки в пути к базе данных
- Отсутствующие зависимости
- Проблемы с путями к файлам

### Шаг 2: Проверка структуры файлов

Убедитесь, что структура правильная:

```bash
cd ~/gwadm
ls -la                    # Должна быть папка backend
ls -la backend/           # Должна быть main.py
ls -la build/             # Должна быть папка build с фронтендом
```

### Шаг 3: Проверка базы данных

```bash
cd ~/gwadm/backend
ls -la santa.db           # Проверьте наличие базы данных
```

Если базы данных нет:
```bash
python3.10 create_tables.py
```

### Шаг 4: Проверка зависимостей

```bash
cd ~/gwadm/backend
pip3.10 list | grep fastapi    # Должен быть установлен
pip3.10 list | grep sqlalchemy # Должен быть установлен
```

Если чего-то не хватает:
```bash
pip3.10 install --user -r requirements.txt
```

### Шаг 5: Тестовая проверка приложения

Попробуйте запустить приложение вручную:

```bash
cd ~/gwadm/backend
python3.10 -c "from main import app; print('OK')"
```

Если есть ошибки импорта, они будут видны здесь.

### Шаг 6: Проверка WSGI конфигурации (КРИТИЧНО!)

**Ошибка `ModuleNotFoundError: No module named 'main'` почти всегда связана с неправильным username в WSGI файле!**

1. **Узнайте ваш username:**
   ```bash
   echo $USER
   # или
   whoami
   ```

2. **Откройте Web → WSGI configuration file**

3. **Убедитесь, что путь правильный:**
   ```python
   username = 'gwadm'  # ← Должен совпадать с выводом echo $USER
   project_path = f'/home/{username}/gwadm/backend'
   ```
   
   **ВАЖНО:** Если ваш username не `gwadm`, обязательно замените его в WSGI файле!

4. **Проверьте структуру:**
   ```bash
   cd ~/gwadm/backend
   pwd                    # Должен быть /home/ВАШ_USERNAME/gwadm/backend
   ls main.py             # Файл должен существовать
   ```

5. **Правильный WSGI файл:**
   ```python
   import sys
   import os
   
   # Узнайте username командой: echo $USER
   username = 'gwadm'  # ← ЗАМЕНИТЕ НА ВАШ USERNAME!
   
   project_path = f'/home/{username}/gwadm/backend'
   if project_path not in sys.path:
       sys.path.insert(0, project_path)
   
   os.chdir(project_path)
   
   from main import app
   application = app
   ```

Подробная инструкция: см. `docs/WSGI_CONFIGURATION.md`

### Шаг 7: Проверка путей к базе данных

На PythonAnywhere база данных должна создаваться автоматически, но проверить можно так:

```bash
python3.10 -c "
import os
home = os.path.expanduser('~')
db_path = os.path.join(home, 'gwadm', 'backend', 'santa.db')
print(f'DB path: {db_path}')
print(f'Exists: {os.path.exists(db_path)}')
print(f'Dir exists: {os.path.exists(os.path.dirname(db_path))}')
"
```

### Шаг 8: Создание необходимых директорий

```bash
cd ~/gwadm/backend
mkdir -p uploads/icons
chmod 755 uploads
chmod 755 uploads/icons
```

## 🔍 Частые ошибки и решения

### Ошибка: "ModuleNotFoundError: No module named 'fastapi'"

**Решение:**
```bash
pip3.10 install --user fastapi uvicorn sqlalchemy
pip3.10 install --user -r requirements.txt
```

### Ошибка: "No such file or directory: '/home/gwadm/gwadm/backend/santa.db'"

**Решение:**
1. Убедитесь, что username правильный в WSGI файле
2. Создайте базу данных:
   ```bash
   cd ~/gwadm/backend
   python3.10 create_tables.py
   ```

### Ошибка: "Permission denied" или проблемы с uploads

**Решение:**
```bash
cd ~/gwadm/backend
chmod -R 755 uploads
```

### Ошибка при импорте main.py

Проверьте синтаксис:
```bash
cd ~/gwadm/backend
python3.10 -m py_compile main.py
```

Если ошибок нет, вывод будет пустым.

## 📝 Проверка работоспособности

После исправления ошибок:

1. Нажмите **Reload** в разделе Web
2. Проверьте **Error log** снова
3. Откройте `https://gwadm.pythonanywhere.com/docs` - должна открыться Swagger документация
4. Откройте `https://gwadm.pythonanywhere.com` - должна открыться главная страница

## 💡 Дополнительные команды для диагностики

```bash
# Проверка окружения PythonAnywhere
echo $PYTHONANYWHERE_DOMAIN

# Проверка версии Python
python3.10 --version

# Проверка путей
python3.10 -c "import sys; print(sys.path)"

# Тест импорта
cd ~/gwadm/backend
python3.10 -c "import sys; sys.path.insert(0, '.'); from main import app; print('Import OK')"
```

