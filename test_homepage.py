import requests
from datetime import datetime, timedelta

def test_current_event_api():
    print("=== Тест API текущего мероприятия ===")
    
    BASE_URL = 'http://localhost:8004'
    
    # 1. Тест получения текущего мероприятия (должен быть 404, если нет мероприятий)
    print("\n1. Тест получения текущего мероприятия...")
    try:
        response = requests.get(f'{BASE_URL}/events/current')
        print(f"   Статус: {response.status_code}")
        
        if response.status_code == 200:
            event = response.json()
            print(f"   Найдено мероприятие: {event['name']}")
            print(f"   Описание: {event['description']}")
            print(f"   Предварительная регистрация: {event['preregistration_start']}")
            print(f"   Основная регистрация: {event['registration_start']}")
            print(f"   Завершение: {event['registration_end']}")
            return True
        elif response.status_code == 404:
            print("   Нет активных мероприятий (ожидаемо)")
            return True
        else:
            print(f"   Неожиданный статус: {response.text}")
            return False
    except Exception as e:
        print(f"   Ошибка: {e}")
        return False

def test_with_active_event():
    print("\n2. Создание тестового мероприятия...")
    
    # Логинимся как админ
    login_data = {'email': 'admin@example.com', 'password': 'admin'}
    response = requests.post('http://localhost:8004/auth/login', json=login_data)
    
    if response.status_code != 200:
        print("   Ошибка авторизации администратора")
        return False
    
    admin_token = response.json()['access_token']
    headers = {'Authorization': f'Bearer {admin_token}'}
    
    # Создаем мероприятие
    now = datetime.now()
    event_data = {
        'name': 'Тестовое мероприятие для главной страницы',
        'description': 'Мероприятие для проверки отображения на главной странице',
        'preregistration_start': (now + timedelta(minutes=1)).isoformat(),
        'registration_start': (now + timedelta(minutes=2)).isoformat(),
        'registration_end': (now + timedelta(minutes=5)).isoformat()
    }
    
    response = requests.post('http://localhost:8004/events/', json=event_data, headers=headers)
    if response.status_code != 200:
        print(f"   Ошибка создания мероприятия: {response.text}")
        return False
    
    event = response.json()
    print(f"   Мероприятие создано: {event['name']} (ID: {event['id']})")
    
    # Тестируем получение текущего мероприятия
    print("\n3. Тест получения текущего мероприятия после создания...")
    try:
        response = requests.get('http://localhost:8004/events/current')
        if response.status_code == 200:
            current_event = response.json()
            print(f"   Текущее мероприятие: {current_event['name']}")
            print(f"   ID совпадает: {current_event['id'] == event['id']}")
            return True
        else:
            print(f"   Ошибка: {response.text}")
            return False
    except Exception as e:
        print(f"   Ошибка: {e}")
        return False

if __name__ == "__main__":
    print("Запуск тестов главной страницы...")
    
    # Тест 1: Без мероприятий
    success1 = test_current_event_api()
    
    # Тест 2: С активным мероприятием
    success2 = test_with_active_event()
    
    if success1 and success2:
        print("\nВсе тесты главной страницы прошли успешно!")
        print("Теперь главная страница должна отображать информацию о мероприятии с обратным отсчетом.")
    else:
        print("\nНекоторые тесты не прошли")
