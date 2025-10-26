#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8004"

def test_unique_event_urls():
    """Тестирование уникальных URL мероприятий"""
    
    print("=== Тестирование уникальных URL мероприятий ===\n")
    
    # 1. Проверяем доступность backend
    print("1. Проверка доступности backend...")
    try:
        response = requests.get(f"{BASE_URL}/docs", timeout=5)
        if response.status_code == 200:
            print("OK Backend доступен на порту 8004")
        else:
            print(f"ERROR Backend недоступен: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("ERROR Не удается подключиться к backend на порту 8004")
        print("TIP Запустите: start_backend_radical.bat")
        return False
    except Exception as e:
        print(f"ERROR Ошибка подключения: {e}")
        return False
    
    # 2. Входим как админ
    print("\n2. Вход как администратор...")
    admin_login_data = {
        "email": "admin@example.com",
        "password": "admin"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=admin_login_data, timeout=10)
        if response.status_code == 200:
            admin_token_data = response.json()
            admin_token = admin_token_data["access_token"]
            admin_headers = {"Authorization": f"Bearer {admin_token}"}
            print("OK Вход как администратор выполнен")
        else:
            print(f"ERROR Ошибка входа: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при входе: {e}")
        return False
    
    # 3. Создаем тестовое мероприятие
    print("\n3. Создание тестового мероприятия...")
    now = datetime.utcnow()
    event_data = {
        "name": "Тестовое мероприятие с уникальным URL",
        "description": "Мероприятие для тестирования уникальных URL",
        "preregistration_start": (now - timedelta(minutes=5)).isoformat(),
        "registration_start": (now + timedelta(hours=2)).isoformat(),
        "registration_end": (now + timedelta(hours=4)).isoformat()
    }
    
    try:
        response = requests.post(f"{BASE_URL}/events/", json=event_data, headers=admin_headers, timeout=10)
        if response.status_code == 200:
            event = response.json()
            print(f"OK Мероприятие создано")
            print(f"   ID: {event['id']}")
            print(f"   Unique ID: {event['unique_id']}")
            print(f"   Название: {event['name']}")
        else:
            print(f"ERROR Ошибка создания мероприятия: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при создании мероприятия: {e}")
        return False
    
    # 4. Тестируем получение мероприятия по уникальному ID
    print("\n4. Тестирование получения мероприятия по уникальному ID...")
    try:
        response = requests.get(f"{BASE_URL}/events/unique/{event['unique_id']}", timeout=10)
        if response.status_code == 200:
            event_by_unique = response.json()
            print(f"OK Мероприятие получено по уникальному ID")
            print(f"   Unique ID: {event_by_unique['unique_id']}")
            print(f"   Название: {event_by_unique['name']}")
        else:
            print(f"ERROR Ошибка получения мероприятия: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при получении мероприятия: {e}")
        return False
    
    # 5. Тестируем получение участников по уникальному ID
    print("\n5. Тестирование получения участников по уникальному ID...")
    try:
        response = requests.get(f"{BASE_URL}/events/unique/{event['unique_id']}/participants", timeout=10)
        if response.status_code == 200:
            participants = response.json()
            print(f"OK Участники получены по уникальному ID")
            print(f"   Количество участников: {len(participants)}")
        else:
            print(f"ERROR Ошибка получения участников: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при получении участников: {e}")
        return False
    
    # 6. Создаем второе мероприятие для проверки уникальности ID
    print("\n6. Создание второго мероприятия для проверки уникальности...")
    event_data_2 = {
        "name": "Второе тестовое мероприятие",
        "description": "Второе мероприятие для проверки уникальности ID",
        "preregistration_start": (now + timedelta(days=1)).isoformat(),
        "registration_start": (now + timedelta(days=1, hours=2)).isoformat(),
        "registration_end": (now + timedelta(days=1, hours=4)).isoformat()
    }
    
    try:
        response = requests.post(f"{BASE_URL}/events/", json=event_data_2, headers=admin_headers, timeout=10)
        if response.status_code == 200:
            event_2 = response.json()
            print(f"OK Второе мероприятие создано")
            print(f"   ID: {event_2['id']}")
            print(f"   Unique ID: {event_2['unique_id']}")
            print(f"   Название: {event_2['name']}")
            
            # Проверяем, что unique_id увеличился
            if event_2['unique_id'] > event['unique_id']:
                print("OK Unique ID увеличился корректно")
            else:
                print("ERROR Unique ID не увеличился")
                return False
        else:
            print(f"ERROR Ошибка создания второго мероприятия: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при создании второго мероприятия: {e}")
        return False
    
    print("\n=== Все тесты уникальных URL прошли успешно! ===")
    print("OK Backend поддерживает уникальные ID мероприятий")
    print("OK Мероприятия можно получать по уникальному ID")
    print("OK Участники получаются по уникальному ID")
    print("OK Unique ID увеличивается корректно")
    print("OK Frontend может использовать URL вида /event/{unique_id}")
    return True

if __name__ == "__main__":
    test_unique_event_urls()
