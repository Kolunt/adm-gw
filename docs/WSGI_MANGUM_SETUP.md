# Настройка Mangum для FastAPI на PythonAnywhere

## 🔴 Проблема

Ошибка:
```
TypeError: FastAPI.__call__() missing 1 required positional argument: 'send'
```

Это происходит потому, что FastAPI - это **ASGI** приложение, а PythonAnywhere использует **WSGI**. Нужен адаптер.

## ✅ Решение

### Шаг 1: Установите Mangum

В Bash консоли PythonAnywhere:

```bash
pip3.10 install --user mangum
```

Или если используете `requirements.txt`:

```bash
cd ~/gwadm/backend
pip3.10 install --user -r requirements.txt
```

### Шаг 2: Обновите WSGI конфигурацию

WSGI файл уже обновлен в репозитории (`backend/wsgi_pythonanywhere.py`). Просто скопируйте его содержимое в WSGI конфигурацию на PythonAnywhere:

1. Откройте **Web** → **WSGI configuration file**
2. Скопируйте весь код из `backend/wsgi_pythonanywhere.py`
3. Вставьте в WSGI конфигурацию
4. Нажмите **Save**
5. Нажмите **Reload**

### Шаг 3: Проверьте

В Error log должно быть:
```
✅ Using Mangum ASGI-to-WSGI adapter
✅ Successfully imported app
✅ WSGI application configured successfully
```

## 📦 Что такое Mangum?

Mangum - это адаптер ASGI-to-WSGI, специально созданный для работы FastAPI и Starlette приложений на WSGI серверах (таких как uWSGI на PythonAnywhere).

## 🔍 Альтернативные решения

Если Mangum не работает, можно попробовать:

### Вариант 1: asgiref (менее надежно)

```python
from asgiref.wsgi import WsgiToAsgi
application = WsgiToAsgi(app)
```

Установка:
```bash
pip3.10 install --user asgiref
```

### Вариант 2: Использовать uvicorn напрямую

PythonAnywhere поддерживает uvicorn, но для этого нужна особая конфигурация. Mangum - более простое решение.

## ✅ Проверка установки

```bash
pip3.10 list | grep mangum
```

Должно показать: `mangum (0.17.0)` или похожую версию.

## 📚 Дополнительная информация

- Документация Mangum: https://mangum.io/
- FastAPI deployment: https://fastapi.tiangolo.com/deployment/
- WSGI vs ASGI: https://asgi.readthedocs.io/

