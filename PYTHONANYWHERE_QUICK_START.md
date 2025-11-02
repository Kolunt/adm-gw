# PythonAnywhere - Быстрый старт

## 🚀 Минимальная инструкция

### 1. Регистрация
- Зайдите на https://www.pythonanywhere.com
- Зарегистрируйтесь (можно через GitHub)

### 2. Загрузка кода
```bash
cd ~
git clone https://github.com/Kolunt/adm-gw.git
cd adm-gw/backend
```

### 3. Установка зависимостей
```bash
pip3.10 install --user -r requirements.txt
```

### 4. Создание Web App
1. В панели: **Web** → **Add a new web app**
2. Выберите: **Manual configuration** → **Python 3.10**

### 5. Настройка WSGI
В разделе **Web** → **WSGI configuration file** замените содержимое:

```python
import sys
import os

path = '/home/ВАШ_USERNAME/adm-gw/backend'
if path not in sys.path:
    sys.path.insert(0, path)

os.chdir(path)

from main import app
application = app
```

**⚠️ Замените `ВАШ_USERNAME` на ваш username!**

### 6. Настройка Static Files
В **Web** → **Static files** добавьте:
- URL: `/uploads/`
- Directory: `/home/ВАШ_USERNAME/adm-gw/backend/uploads`

### 7. Перезапуск
Нажмите зеленую кнопку **Reload** в разделе **Web**

## ✅ Проверка
Откройте: `https://ВАШ_USERNAME.pythonanywhere.com/docs`

Должна открыться Swagger документация API.

## 📝 Полная инструкция
Смотрите файл `PYTHONANYWHERE_DEPLOYMENT.md`

## 🔗 Интеграция с Frontend
После деплоя обновите `src/utils/axiosConfig.js`:

```javascript
axios.defaults.baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://ВАШ_USERNAME.pythonanywhere.com' 
  : 'http://localhost:8006';
```

Затем пересоберите и задеплойте frontend на GitHub Pages.

