import requests
from datetime import datetime, timedelta

def test_events_api():
    print("=== Тест API мероприятий ===")
    
    # Получаем токен администратора
    login_data = {'email': 'admin@example.com', 'password': 'admin'}
    response = requests.post('http://localhost:8004/auth/login', json=login_data)
    
    if response.status_code != 200:
        print(f"❌ Ошибка входа: {response.text}")
        return False
    
    token = response.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    print("✅ Авторизация успешна")
    
    # Тест 1: Получение списка мероприятий
    print("\n1. Получение списка мероприятий...")
    response = requests.get('http://localhost:8004/events/', headers=headers)
    print(f"   Статус: {response.status_code}")
    
    if response.status_code == 200:
        events = response.json()
        print(f"   ✅ Найдено мероприятий: {len(events)}")
    else:
        print(f"   ❌ Ошибка: {response.text}")
        return False
    
    # Тест 2: Создание мероприятия
    print("\n2. Создание нового мероприятия...")
    now = datetime.now()
    event_data = {
        'name': f'Анонимный Дед Мороз {now.year}',
        'description': 'Ежегодное мероприятие обмена подарками',
        'preregistration_start': (now + timedelta(days=1)).isoformat(),
        'registration_start': (now + timedelta(days=7)).isoformat(),
        'registration_end': (now + timedelta(days=14)).isoformat()
    }
    
    response = requests.post('http://localhost:8004/events/', json=event_data, headers=headers)
    print(f"   Статус: {response.status_code}")
    
    if response.status_code == 200:
        new_event = response.json()
        print(f"   ✅ Создано: {new_event['name']} (ID: {new_event['id']})")
        return True
    else:
        print(f"   ❌ Ошибка: {response.text}")
        return False

if __name__ == "__main__":
    try:
        success = test_events_api()
        if success:
            print("\n🎉 Все тесты прошли успешно!")
        else:
            print("\n❌ Тесты не прошли")
    except Exception as e:
        print(f"\n💥 Ошибка: {e}")
