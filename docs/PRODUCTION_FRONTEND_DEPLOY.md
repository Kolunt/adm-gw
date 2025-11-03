# Развертывание фронтенда на Production (PythonAnywhere)

## Проблема: 404 ошибка на `/my_login_page`

Если вы получаете 404 ошибку при открытии `https://gwadm.pythonanywhere.com/my_login_page`, это означает, что фронтенд не развернут на сервере.

## Решение

### Шаг 1: Соберите фронтенд локально

```bash
cd C:\Users\TBG\Documents\adm-gw  # или ваш путь к проекту
npm install
npm run build
```

Это создаст папку `build/` в корне проекта со следующей структурой:
```
build/
├── index.html
├── static/
│   ├── css/
│   ├── js/
│   └── media/
├── favicon.ico
└── manifest.json
```

### Шаг 2: Загрузите папку `build/` на PythonAnywhere

**Вариант A: Через Files интерфейс**

1. Откройте PythonAnywhere → **Files**
2. Перейдите в `~/gwadm/`
3. Если папка `build` существует - удалите её (или переименуйте в `build.old`)
4. Загрузите новую папку `build/` с вашего компьютера
5. Убедитесь, что структура правильная:
   ```
   ~/gwadm/
   ├── backend/
   │   ├── main.py
   │   └── ...
   └── build/          # ← Должна быть здесь!
       ├── index.html
       ├── static/
       └── ...
   ```

**Вариант B: Через Git (если build не в .gitignore)**

```bash
# На вашем компьютере
git add build/
git commit -m "Add production build"
git push origin master

# На PythonAnywhere
cd ~/gwadm
git pull origin master
```

**Примечание:** Обычно `build/` находится в `.gitignore`, поэтому лучше использовать вариант A.

### Шаг 3: Проверьте права доступа

```bash
# На PythonAnywhere в Bash консоли
cd ~/gwadm
chmod -R 755 build
```

### Шаг 4: Перезапустите веб-приложение

1. Откройте PythonAnywhere → **Web**
2. Нажмите зеленую кнопку **Reload**
3. Проверьте **Error log** на наличие ошибок

### Шаг 5: Проверьте работу

1. Откройте `https://gwadm.pythonanywhere.com`
   - Должна загрузиться главная страница React приложения

2. Откройте `https://gwadm.pythonanywhere.com/my_login_page`
   - Должна загрузиться страница кросс-серверного логина (не 404!)

3. Проверьте другие роуты:
   - `https://gwadm.pythonanywhere.com/login`
   - `https://gwadm.pythonanywhere.com/cross-server-login`
   - Все должны работать без 404

## Устранение неполадок

### Проблема: Все еще 404

**Решение:**
1. Проверьте, что папка `build` существует: `ls -la ~/gwadm/build`
2. Проверьте, что `index.html` существует: `ls -la ~/gwadm/build/index.html`
3. Проверьте логи ошибок в PythonAnywhere → Web → Error log
4. Убедитесь, что приложение перезапущено (Reload)

### Проблема: "Frontend not found"

**Решение:**
Это означает, что backend не может найти папку `build`. Проверьте:
- Папка должна быть в `~/gwadm/build/` (не в `~/gwadm/backend/build/`)
- Или в `~/gwadm/backend/build/` (если вы используете другой путь)

Backend автоматически проверяет следующие пути:
- `../build` (относительно backend/)
- `build` (в backend/)
- `dist` (старый путь)
- `../dist`

### Проблема: Статические файлы не загружаются

**Решение:**
1. Проверьте, что папка `static/` существует: `ls -la ~/gwadm/build/static`
2. Проверьте права доступа: `chmod -R 755 ~/gwadm/build/static`

## Автоматизация

Можно создать скрипт для автоматической загрузки:

```bash
#!/bin/bash
# deploy_frontend.sh

# Сборка локально
npm run build

# Здесь можно добавить команды для автоматической загрузки на сервер
# Например, через rsync или scp
```

Но для PythonAnywhere обычно проще использовать Files интерфейс или Git.

