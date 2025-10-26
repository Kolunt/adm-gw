import requests

def test_endpoints():
    print("=== Тест API endpoints ===")
    
    # Тест 1: Получение мероприятий
    print("\n1. Тест получения мероприятий...")
    try:
        response = requests.get('http://localhost:8004/events/')
        print(f"   Статус: {response.status_code}")
        if response.status_code == 200:
            print("   OK")
        else:
            print(f"   Ошибка: {response.text}")
    except Exception as e:
        print(f"   Ошибка: {e}")
    
    # Тест 2: Получение регистраций пользователя (без авторизации - должно быть 401)
    print("\n2. Тест получения регистраций пользователя...")
    try:
        response = requests.get('http://localhost:8004/user/registrations')
        print(f"   Статус: {response.status_code}")
        if response.status_code == 401:
            print("   OK (требуется авторизация)")
        else:
            print(f"   Неожиданный статус: {response.text}")
    except Exception as e:
        print(f"   Ошибка: {e}")
    
    # Тест 3: Регистрация на мероприятие (без авторизации - должно быть 401)
    print("\n3. Тест регистрации на мероприятие...")
    try:
        response = requests.post('http://localhost:8004/events/1/register', json={'event_id': 1, 'registration_type': 'preregistration'})
        print(f"   Статус: {response.status_code}")
        if response.status_code == 401:
            print("   OK (требуется авторизация)")
        else:
            print(f"   Неожиданный статус: {response.text}")
    except Exception as e:
        print(f"   Ошибка: {e}")
    
    # Тест 4: Проверка существования endpoint'ов через OPTIONS
    print("\n4. Проверка существования endpoint'ов...")
    endpoints = [
        '/events/',
        '/user/registrations',
        '/events/1/register',
        '/events/1/confirm'
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.options(f'http://localhost:8004{endpoint}')
            print(f"   {endpoint}: {response.status_code}")
        except Exception as e:
            print(f"   {endpoint}: Ошибка - {e}")

if __name__ == "__main__":
    test_endpoints()
