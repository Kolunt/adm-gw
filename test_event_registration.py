import requests
from datetime import datetime, timedelta

def test_event_registration():
    print("=== Тест регистрации на мероприятия ===")
    
    BASE_URL = 'http://localhost:8004'
    
    # 1. Создаем тестового пользователя
    print("\n1. Создание тестового пользователя...")
    email = f'test_user_{datetime.now().strftime("%Y%m%d_%H%M%S")}@example.com'
    password = 'password123'
    
    register_data = {
        'email': email,
        'password': password,
        'confirm_password': password
    }
    
    response = requests.post(f'{BASE_URL}/auth/register', json=register_data)
    if response.status_code != 200:
        print(f"❌ Ошибка регистрации: {response.text}")
        return False
    
    user_data = response.json()
    print(f"✅ Пользователь создан: {user_data['email']}")
    
    # 2. Логинимся как пользователь
    print("\n2. Вход пользователя...")
    login_data = {'email': email, 'password': password}
    response = requests.post(f'{BASE_URL}/auth/login', json=login_data)
    
    if response.status_code != 200:
        print(f"❌ Ошибка входа: {response.text}")
        return False
    
    user_token = response.json()['access_token']
    user_headers = {'Authorization': f'Bearer {user_token}'}
    print("✅ Пользователь авторизован")
    
    # 3. Заполняем профиль пользователя
    print("\n3. Заполнение профиля...")
    
    # Шаг 1: GWars профиль
    step1_data = {'gwars_profile_url': 'https://www.gwars.io/info.php?id=12345'}
    response = requests.post(f'{BASE_URL}/profile/step1', json=step1_data, headers=user_headers)
    if response.status_code != 200:
        print(f"❌ Ошибка шага 1: {response.text}")
        return False
    
    # Шаг 2: Личные данные
    step2_data = {
        'full_name': 'Тестовый Пользователь',
        'address': 'г. Москва, ул. Тестовая, д. 1, кв. 1'
    }
    response = requests.post(f'{BASE_URL}/profile/step2', json=step2_data, headers=user_headers)
    if response.status_code != 200:
        print(f"❌ Ошибка шага 2: {response.text}")
        return False
    
    # Шаг 3: Интересы
    step3_data = {'interests': 'Тестирование системы'}
    response = requests.post(f'{BASE_URL}/profile/step3', json=step3_data, headers=user_headers)
    if response.status_code != 200:
        print(f"❌ Ошибка шага 3: {response.text}")
        return False
    
    print("✅ Профиль заполнен")
    
    # 4. Логинимся как админ для создания мероприятия
    print("\n4. Создание мероприятия администратором...")
    admin_login_data = {'email': 'admin@example.com', 'password': 'admin'}
    response = requests.post(f'{BASE_URL}/auth/login', json=admin_login_data)
    
    if response.status_code != 200:
        print(f"❌ Ошибка входа админа: {response.text}")
        return False
    
    admin_token = response.json()['access_token']
    admin_headers = {'Authorization': f'Bearer {admin_token}'}
    
    # Создаем мероприятие
    now = datetime.now()
    event_data = {
        'name': f'Тестовое мероприятие {now.strftime("%Y-%m-%d %H:%M")}',
        'description': 'Тестовое мероприятие для проверки регистрации',
        'preregistration_start': (now + timedelta(minutes=1)).isoformat(),
        'registration_start': (now + timedelta(minutes=2)).isoformat(),
        'registration_end': (now + timedelta(minutes=5)).isoformat()
    }
    
    response = requests.post(f'{BASE_URL}/events/', json=event_data, headers=admin_headers)
    if response.status_code != 200:
        print(f"❌ Ошибка создания мероприятия: {response.text}")
        return False
    
    event = response.json()
    print(f"✅ Мероприятие создано: {event['name']} (ID: {event['id']})")
    
    # 5. Тестируем регистрацию на мероприятие
    print("\n5. Тестирование регистрации на мероприятие...")
    
    # Пытаемся зарегистрироваться до начала предварительной регистрации
    print("   - Попытка регистрации до начала предварительной регистрации...")
    registration_data = {
        'event_id': event['id'],
        'registration_type': 'preregistration'
    }
    response = requests.post(f'{BASE_URL}/events/{event["id"]}/register', json=registration_data, headers=user_headers)
    if response.status_code == 400 and "еще не началась" in response.text:
        print("   ✅ Корректно отклонена регистрация до начала периода")
    else:
        print(f"   ❌ Неожиданный ответ: {response.status_code} - {response.text}")
    
    # Ждем начала предварительной регистрации
    print("   - Ожидание начала предварительной регистрации...")
    import time
    time.sleep(70)  # Ждем 70 секунд
    
    # Регистрируемся на предварительную регистрацию
    print("   - Регистрация на предварительную регистрацию...")
    response = requests.post(f'{BASE_URL}/events/{event["id"]}/register', json=registration_data, headers=user_headers)
    if response.status_code == 200:
        registration = response.json()
        print(f"   ✅ Предварительная регистрация успешна (ID: {registration['id']})")
        print(f"   ✅ Подтверждено: {registration['is_confirmed']}")
    else:
        print(f"   ❌ Ошибка предварительной регистрации: {response.text}")
        return False
    
    # Ждем начала основной регистрации
    print("   - Ожидание начала основной регистрации...")
    time.sleep(70)  # Ждем еще 70 секунд
    
    # Подтверждаем участие
    print("   - Подтверждение участия...")
    confirm_data = {
        'confirmed_address': 'г. Москва, ул. Подтвержденная, д. 2, кв. 2'
    }
    response = requests.post(f'{BASE_URL}/events/{event["id"]}/confirm', json=confirm_data, headers=user_headers)
    if response.status_code == 200:
        confirmed_registration = response.json()
        print(f"   ✅ Участие подтверждено")
        print(f"   ✅ Подтвержденный адрес: {confirmed_registration['confirmed_address']}")
    else:
        print(f"   ❌ Ошибка подтверждения: {response.text}")
        return False
    
    # 6. Проверяем регистрации пользователя
    print("\n6. Проверка регистраций пользователя...")
    response = requests.get(f'{BASE_URL}/user/registrations', headers=user_headers)
    if response.status_code == 200:
        registrations = response.json()
        print(f"   ✅ Найдено регистраций: {len(registrations)}")
        for reg in registrations:
            print(f"   - Мероприятие {reg['event_id']}: {reg['registration_type']}, подтверждено: {reg['is_confirmed']}")
    else:
        print(f"   ❌ Ошибка получения регистраций: {response.text}")
    
    print("\n🎉 Все тесты регистрации на мероприятия прошли успешно!")
    return True

if __name__ == "__main__":
    try:
        success = test_event_registration()
        if not success:
            print("\n❌ Тесты не прошли")
    except Exception as e:
        print(f"\n💥 Ошибка: {e}")
