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
    
    # FastAPI - это ASGI приложение, а PythonAnywhere использует WSGI
    # Нужен адаптер ASGI-to-WSGI
    print("⚠️ Creating custom WSGI adapter for ASGI application")
    
    def wsgi_app(environ, start_response):
        """WSGI обертка для ASGI приложения (FastAPI)"""
        import asyncio
        from io import BytesIO
        
        try:
            # Преобразуем WSGI environ в ASGI scope
            method = environ['REQUEST_METHOD']
            path = environ.get('PATH_INFO', '/')
            raw_path = path.encode('utf-8')
            query_string = environ.get('QUERY_STRING', '').encode('utf-8')
            
            # Парсим headers
            headers = []
            for key, value in environ.items():
                if key.startswith('HTTP_'):
                    header_name = key[5:].replace('_', '-').lower()
                    headers.append((header_name.encode('utf-8'), str(value).encode('utf-8')))
                elif key == 'CONTENT_TYPE' and value:
                    headers.append((b'content-type', str(value).encode('utf-8')))
                elif key == 'CONTENT_LENGTH' and value:
                    headers.append((b'content-length', str(value).encode('utf-8')))
            
            scope = {
                'type': 'http',
                'method': method,
                'path': path,
                'raw_path': raw_path,
                'query_string': query_string,
                'headers': headers,
                'client': (environ.get('REMOTE_ADDR', ''), int(environ.get('REMOTE_PORT', 0) or 0)),
                'server': (environ.get('SERVER_NAME', ''), int(environ.get('SERVER_PORT', 80) or 80)),
                'scheme': environ.get('wsgi.url_scheme', 'http'),
                'root_path': environ.get('SCRIPT_NAME', ''),
                'path_info': path,
                'http_version': '1.1',
            }
            
            # Состояние ответа
            response_status = None
            response_headers = []
            response_body_parts = []
            
            async def receive():
                """Получаем тело запроса"""
                wsgi_input = environ.get('wsgi.input', BytesIO())
                content_length = int(environ.get('CONTENT_LENGTH', 0) or 0)
                if content_length > 0:
                    body = wsgi_input.read(content_length)
                else:
                    body = b''
                return {'type': 'http.request', 'body': body, 'more_body': False}
            
            async def send(message):
                """Получаем ответ от ASGI приложения"""
                nonlocal response_status, response_headers, response_body_parts
                if message['type'] == 'http.response.start':
                    response_status = message['status']
                    response_headers = [
                        (k.decode('utf-8') if isinstance(k, bytes) else str(k),
                         v.decode('utf-8') if isinstance(v, bytes) else str(v))
                        for k, v in message.get('headers', [])
                    ]
                elif message['type'] == 'http.response.body':
                    body_chunk = message.get('body', b'')
                    if body_chunk:
                        response_body_parts.append(body_chunk)
            
            # Запускаем ASGI приложение
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                # Логируем запрос для отладки
                print(f"WSGI REQUEST: {method} {path}")
                loop.run_until_complete(app(scope, receive, send))
            except Exception as e:
                # Логируем ошибку для диагностики
                import traceback
                error_msg = f"Error in ASGI app: {str(e)}\n{traceback.format_exc()}"
                print(f"WSGI ERROR: {error_msg}")
                
                # Возвращаем ошибку 500
                response_status = 500
                response_headers = [('Content-Type', 'text/html; charset=utf-8')]
                error_html = f"""<html><body><h1>500 Internal Server Error</h1>
                <p>An error occurred while processing your request.</p>
                <pre>{error_msg}</pre>
                </body></html>"""
                response_body_parts = [error_html.encode('utf-8')]
            finally:
                loop.close()
            
            # Формируем WSGI ответ
            if response_status is None:
                response_status = 500
                response_headers = [('Content-Type', 'text/plain')]
                response_body_parts = [b'Internal Server Error']
            
            status_text = f"{response_status} {_get_status_text(response_status)}"
            start_response(status_text, response_headers)
            
            return response_body_parts
            
        except Exception as e:
            # Обработка критических ошибок в WSGI адаптере
            import traceback
            error_msg = f"Critical WSGI adapter error: {str(e)}\n{traceback.format_exc()}"
            print(f"CRITICAL WSGI ERROR: {error_msg}")
            
            # Возвращаем минимальный ответ об ошибке
            try:
                start_response('500 Internal Server Error', [('Content-Type', 'text/plain')])
            except:
                pass  # Если start_response уже был вызван
            
            return [f"Internal Server Error: {str(e)}".encode('utf-8')]
    
    def _get_status_text(status_code):
        """Получаем текст статуса по коду"""
        status_texts = {
            200: 'OK',
            201: 'Created',
            204: 'No Content',
            301: 'Moved Permanently',
            302: 'Found',
            304: 'Not Modified',
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Not Found',
            500: 'Internal Server Error',
            502: 'Bad Gateway',
            503: 'Service Unavailable',
        }
        return status_texts.get(status_code, 'Unknown')
    
    application = wsgi_app
    print("✅ Using custom WSGI adapter for ASGI")
    print("✅ Successfully imported app")
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
