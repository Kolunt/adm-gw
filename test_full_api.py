import requests
import json

def test_all_endpoints():
    print("=== Полный тест API endpoints ===")
    
    # 1. Тест получения мероприятий
    print("\n1. Получение мероприятий...")
    try:
        response = requests.get('http://localhost:8004/events/')
        print(f"   Статус: {response.status_code}")
        if response.status_code == 200:
            events = response.json()
            print(f"   Найдено мероприятий: {len(events)}")
            if events:
                print(f"   Первое мероприятие: {events[0]['name']}")
        else:
            print(f"   Ошибка: {response.text}")
    except Exception as e:
        print(f"   Ошибка: {e}")
    
    # 2. Тест авторизации администратора
    print("\n2. Авторизация администратора...")
    try:
        login_data = {'email': 'admin@example.com', 'password': 'admin'}
        response = requests.post('http://localhost:8004/auth/login', json=login_data)
        print(f"   Статус: {response.status_code}")
        if response.status_code == 200:
            token_data = response.json()
            admin_token = token_data['access_token']
            print("   Авторизация успешна")
            return admin_token
        else:
            print(f"   Ошибка: {response.text}")
            return None
    except Exception as e:
        print(f"   Ошибка: {e}")
        return None

def test_with_auth(token):
    if not token:
        print("\nПропускаем тесты с авторизацией")
        return
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # 3. Тест получения регистраций пользователя
    print("\n3. Получение регистраций пользователя...")
    try:
        response = requests.get('http://localhost:8004/user/registrations', headers=headers)
        print(f"   Статус: {response.status_code}")
        if response.status_code == 200:
            registrations = response.json()
            print(f"   Найдено регистраций: {len(registrations)}")
        else:
            print(f"   Ошибка: {response.text}")
    except Exception as e:
        print(f"   Ошибка: {e}")
    
    # 4. Тест создания мероприятия
    print("\n4. Создание тестового мероприятия...")
    try:
        from datetime import datetime, timedelta
        now = datetime.now()
        event_data = {
            'name': 'Тестовое мероприятие для проверки',
            'description': 'Мероприятие для тестирования API',
            'preregistration_start': (now + timedelta(minutes=1)).isoformat(),
            'registration_start': (now + timedelta(minutes=2)).isoformat(),
            'registration_end': (now + timedelta(minutes=5)).isoformat()
        }
        response = requests.post('http://localhost:8004/events/', json=event_data, headers=headers)
        print(f"   Статус: {response.status_code}")
        if response.status_code == 200:
            event = response.json()
            print(f"   Мероприятие создано: {event['name']} (ID: {event['id']})")
            return event['id']
        else:
            print(f"   Ошибка: {response.text}")
            return None
    except Exception as e:
        print(f"   Ошибка: {e}")
        return None

if __name__ == "__main__":
    print("Запуск полного теста API...")
    admin_token = test_all_endpoints()
    event_id = test_with_auth(admin_token)
    
    if event_id:
        print(f"\nВсе тесты прошли успешно! Мероприятие ID: {event_id}")
    else:
        print("\nНекоторые тесты не прошли")
