import requests
import time
from datetime import datetime, timedelta

# Тест API мероприятий
print("=== Тест API мероприятий ===")

# Сначала получим токен администратора
login_data = {'email': 'admin@example.com', 'password': 'admin'}
response = requests.post('http://localhost:8004/auth/login', json=login_data)
if response.status_code != 200:
    print(f'Ошибка входа: {response.text}')
    exit(1)

token = response.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

print("1. Получение списка мероприятий")
response = requests.get('http://localhost:8004/events/', headers=headers)
print(f'Статус: {response.status_code}')
if response.status_code == 200:
    events = response.json()
    print(f'Количество мероприятий: {len(events)}')
    for event in events:
        print(f'  - {event["name"]} (ID: {event["id"]})')

print("\n2. Создание нового мероприятия")
# Создаем даты для мероприятия
now = datetime.now()
preregistration_start = now + timedelta(days=1)
registration_start = now + timedelta(days=7)
registration_end = now + timedelta(days=14)

event_data = {
    'name': f'Анонимный Дед Мороз {now.year}',
    'description': 'Ежегодное мероприятие обмена подарками',
    'preregistration_start': preregistration_start.isoformat(),
    'registration_start': registration_start.isoformat(),
    'registration_end': registration_end.isoformat()
}

response = requests.post('http://localhost:8004/events/', json=event_data, headers=headers)
print(f'Статус создания: {response.status_code}')
if response.status_code == 200:
    new_event = response.json()
    print(f'Создано мероприятие: {new_event["name"]} (ID: {new_event["id"]})')
    print(f'Предварительная регистрация: {new_event["preregistration_start"]}')
    print(f'Регистрация: {new_event["registration_start"]}')
    print(f'Закрытие регистрации: {new_event["registration_end"]}')
else:
    print(f'Ошибка: {response.text}')

print("\n3. Получение конкретного мероприятия")
if response.status_code == 200:
    event_id = new_event['id']
    response = requests.get(f'http://localhost:8004/events/{event_id}', headers=headers)
    print(f'Статус получения: {response.status_code}')
    if response.status_code == 200:
        event = response.json()
        print(f'Мероприятие: {event["name"]}')
        print(f'Активно: {event["is_active"]}')

print("\n4. Обновление мероприятия")
if response.status_code == 200:
    update_data = {
        'name': f'Анонимный Дед Мороз {now.year} (Обновлено)',
        'description': 'Обновленное описание мероприятия'
    }
    response = requests.put(f'http://localhost:8004/events/{event_id}', json=update_data, headers=headers)
    print(f'Статус обновления: {response.status_code}')
    if response.status_code == 200:
        updated_event = response.json()
        print(f'Обновлено: {updated_event["name"]}')

print("\n5. Удаление мероприятия")
if response.status_code == 200:
    response = requests.delete(f'http://localhost:8004/events/{event_id}', headers=headers)
    print(f'Статус удаления: {response.status_code}')
    if response.status_code == 200:
        print('Мероприятие удалено')

print("\nТест завершен!")
