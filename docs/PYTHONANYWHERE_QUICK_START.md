# PythonAnywhere - Быстрый старт (через Git)

## 🚀 Минимальная инструкция

### 1. Регистрация
- Зайдите на https://www.pythonanywhere.com
- Зарегистрируйтесь (можно через GitHub)

### 2. Клонирование репозитория

В Bash консоли PythonAnywhere:

```bash
cd ~
git clone https://github.com/Kolunt/gwadm.git
cd gwadm
```

### 3. Установка зависимостей Backend

```bash
cd ~/gwadm/backend
# requirements.txt должен быть в папке backend/
pip3.10 install --user -r requirements.txt
```

### 4. Сборка Frontend

**Рекомендуется: сборка через Git**

На вашем компьютере (локально):
```bash
cd C:\Users\TBG\Documents\adm-gw  # или путь к проекту
npm install
npm run build
git add build/
git commit -m "Update production build"
git push origin master
```

На PythonAnywhere:
```bash
cd ~/gwadm
git pull origin master
```

**Альтернативный вариант: сборка на PythonAnywhere**

Если у вас платный план PythonAnywhere или установлен Node.js:

```bash
cd ~/gwadm
# Установите Node.js через nvm (если еще не установлен)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Установите зависимости и соберите
npm install
npm run build
```

**Важно:** После сборки убедитесь, что папка `build/` находится в корне проекта (`~/gwadm/build/`).

### 5. Создание и настройка базы данных

```bash
cd ~/gwadm/backend
python3.10 create_tables.py
python3.10 create_current_event.py
```

### 6. Создание Web App

1. В панели PythonAnywhere: **Web** → **Add a new web app**
2. Выберите: **Manual configuration** → **Python 3.10**
3. Укажите домен (например, `gwadm.pythonanywhere.com`)

### 7. Настройка WSGI

В разделе **Web** → **WSGI configuration file** замените содержимое:

```python
import sys
import os

path = '/home/ВАШ_USERNAME/gwadm/backend'
if path not in sys.path:
    sys.path.insert(0, path)

os.chdir(path)

from main import app
application = app
```

**⚠️ Замените `ВАШ_USERNAME` на ваш username!**

### 8. Настройка Static Files (опционально)

В **Web** → **Static files** добавьте для загрузок:
- URL: `/uploads/`
- Directory: `/home/ВАШ_USERNAME/gwadm/backend/uploads`

**Примечание:** Frontend раздается через FastAPI автоматически, отдельная настройка для него не нужна.

### 9. Перезапуск

Нажмите зеленую кнопку **Reload** в разделе **Web**

## ✅ Проверка

1. **Проверка API:** Откройте `https://ВАШ_USERNAME.pythonanywhere.com/docs`
   - Должна открыться Swagger документация API

2. **Проверка Frontend:** Откройте `https://ВАШ_USERNAME.pythonanywhere.com`
   - Должна открыться главная страница React приложения

3. **Проверка роутов:** Откройте `https://ВАШ_USERNAME.pythonanywhere.com/my_login_page`
   - Должна открыться страница кросс-серверного логина (не 404!)

## 🔄 Обновление проекта

### Обновление Backend

```bash
cd ~/gwadm
git pull origin master
cd backend
pip3.10 install --user -r requirements.txt  # если добавились новые зависимости
```

Затем нажмите **Reload** в панели Web.

### Обновление Frontend

**Вариант 1: Через Git (рекомендуется)**

На вашем компьютере:
```bash
# Внесите изменения в код
npm run build
git add build/
git commit -m "Update frontend build"
git push origin master
```

На PythonAnywhere:
```bash
cd ~/gwadm
git pull origin master
```

Затем нажмите **Reload** в панели Web.

**Вариант 2: Сборка на PythonAnywhere**

```bash
cd ~/gwadm
git pull origin master
npm install  # если изменились зависимости
npm run build
```

Затем нажмите **Reload** в панели Web.

## 🔧 Полезные команды

### Проверка структуры файлов

```bash
cd ~/gwadm
ls -la                    # Список файлов в корне
ls -la build/             # Проверка наличия build папки
ls -la backend/           # Проверка backend файлов
```

### Проверка логов

В панели PythonAnywhere:
- **Web** → **Error log** - логи ошибок
- **Web** → **Server log** - общие логи сервера

### Проверка статуса Git

```bash
cd ~/gwadm
git status
git log --oneline -5      # Последние 5 коммитов
```

## 📝 Полная инструкция

Смотрите файл `PYTHONANYWHERE_DEPLOYMENT.md` для подробной документации.
