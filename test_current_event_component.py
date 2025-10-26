#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8004"

def test_current_event_component():
    """Тестирование компонента CurrentEventInfo"""
    
    print("=== Тестирование CurrentEventInfo ===\n")
    
    # 1. Вход как админ
    print("1. Вход как администратор...")
    admin_login_data = {
        "email": "admin@example.com",
        "password": "admin"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=admin_login_data)
    if response.status_code == 200:
        token_data = response.json()
        token = token_data["access_token"]
        print("OK Вход выполнен успешно")
    else:
        print(f"ERROR Ошибка входа: {response.status_code}")
        print(response.text)
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Создание тестового мероприятия
    print("\n2. Создание тестового мероприятия...")
    now = datetime.now()
    event_data = {
        "name": "Тестовое мероприятие для CurrentEventInfo",
        "description": "Мероприятие для тестирования компонента",
        "preregistration_start": (now - timedelta(minutes=5)).isoformat(),  # Уже началось
        "registration_start": (now + timedelta(hours=1)).isoformat(),
        "registration_end": (now + timedelta(hours=2)).isoformat()
    }
    
    response = requests.post(f"{BASE_URL}/events/", json=event_data, headers=headers)
    if response.status_code == 200:
        event = response.json()
        print(f"OK Мероприятие создано: {event['name']}")
        print(f"   ID: {event['id']}")
        print(f"   Предварительная регистрация: {event['preregistration_start']}")
        print(f"   Основная регистрация: {event['registration_start']}")
        print(f"   Окончание: {event['registration_end']}")
    else:
        print(f"ERROR Ошибка создания мероприятия: {response.status_code}")
        print(response.text)
        return False
    
    # 3. Проверка endpoint /events/current
    print("\n3. Проверка endpoint /events/current...")
    response = requests.get(f"{BASE_URL}/events/current")
    if response.status_code == 200:
        current_event = response.json()
        print(f"OK Текущее мероприятие получено: {current_event['name']}")
        print(f"   ID: {current_event['id']}")
        print(f"   Активно: {current_event['is_active']}")
    else:
        print(f"ERROR Ошибка получения текущего мероприятия: {response.status_code}")
        print(response.text)
        return False
    
    # 4. Регистрация пользователя для тестирования участников
    print("\n4. Регистрация тестового пользователя...")
    register_data = {
        "email": "test_participant_working@example.com",
        "password": "testpass123",
        "confirm_password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    if response.status_code == 200:
        user_data = response.json()
        print(f"OK Пользователь зарегистрирован: {user_data['email']}")
        user_token = None  # Будем использовать для регистрации на мероприятие
    else:
        print(f"ERROR Ошибка регистрации пользователя: {response.status_code}")
        print(response.text)
        return False
    
    # 5. Вход пользователя
    print("\n5. Вход тестового пользователя...")
    user_login_data = {
        "email": "test_participant_working@example.com",
        "password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=user_login_data)
    if response.status_code == 200:
        user_token_data = response.json()
        user_token = user_token_data["access_token"]
        print("OK Пользователь вошел в систему")
    else:
        print(f"ERROR Ошибка входа пользователя: {response.status_code}")
        print(response.text)
        return False
    
    user_headers = {"Authorization": f"Bearer {user_token}"}
    
    # 6. Заполнение профиля пользователя
    print("\n6. Заполнение профиля пользователя...")
    profile_data = {
        "gwars_profile_url": "https://www.gwars.io/info.php?id=283494",
        "full_name": "Тестовый Пользователь",
        "address": "Тестовый адрес",
        "interests": "Тестирование"
    }
    
    response = requests.post(f"{BASE_URL}/profile/step1", json={"gwars_profile_url": profile_data["gwars_profile_url"]}, headers=user_headers)
    if response.status_code == 200:
        print("OK Шаг 1 профиля выполнен")
    
    response = requests.post(f"{BASE_URL}/profile/step2", json={"full_name": profile_data["full_name"], "address": profile_data["address"]}, headers=user_headers)
    if response.status_code == 200:
        print("OK Шаг 2 профиля выполнен")
    
    response = requests.post(f"{BASE_URL}/profile/step3", json={"interests": profile_data["interests"]}, headers=user_headers)
    if response.status_code == 200:
        print("OK Шаг 3 профиля выполнен")
    
    # 7. Регистрация на мероприятие
    print("\n7. Регистрация на мероприятие...")
    registration_data = {"registration_type": "preregistration", "event_id": event['id']}
    response = requests.post(f"{BASE_URL}/events/{event['id']}/register", json=registration_data, headers=user_headers)
    if response.status_code == 200:
        registration = response.json()
        print(f"OK Пользователь зарегистрирован на мероприятие")
        print(f"   Тип регистрации: {registration['registration_type']}")
        print(f"   Подтверждено: {registration['is_confirmed']}")
    else:
        print(f"ERROR Ошибка регистрации на мероприятие: {response.status_code}")
        print(response.text)
        return False
    
    # 8. Проверка участников мероприятия
    print("\n8. Проверка участников мероприятия...")
    response = requests.get(f"{BASE_URL}/events/{event['id']}/participants", headers=headers)
    if response.status_code == 200:
        participants = response.json()
        print(f"OK Участники получены: {len(participants)} человек")
        for participant in participants:
            print(f"   - {participant.get('gwars_nickname', 'Неизвестно')} ({participant['status_text']})")
    else:
        print(f"ERROR Ошибка получения участников: {response.status_code}")
        print(response.text)
        return False
    
    print("\n=== Тест завершен успешно ===")
    print("Теперь компонент CurrentEventInfo должен работать корректно!")
    return True

if __name__ == "__main__":
    test_current_event_component()
