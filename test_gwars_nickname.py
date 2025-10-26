#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json

BASE_URL = "http://localhost:8004"

def test_gwars_nickname_functionality():
    """Тестирование функционала сохранения и отображения никнейма GWars"""
    
    print("=== Тестирование функционала никнейма GWars ===\n")
    
    # 1. Регистрация нового пользователя
    print("1. Регистрация нового пользователя...")
    register_data = {
        "email": "test_nickname_2024@example.com",
        "password": "testpass123",
        "confirm_password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    if response.status_code == 200:
        print("OK Пользователь зарегистрирован")
    else:
        print(f"ERROR Ошибка регистрации: {response.status_code}")
        print(response.text)
        return
    
    # 2. Вход в систему
    print("\n2. Вход в систему...")
    login_data = {
        "email": "test_nickname_2024@example.com",
        "password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code == 200:
        token_data = response.json()
        token = token_data["access_token"]
        print("OK Вход выполнен успешно")
    else:
        print(f"ERROR Ошибка входа: {response.status_code}")
        print(response.text)
        return
    
    # 3. Парсинг GWars профиля
    print("\n3. Парсинг GWars профиля...")
    headers = {"Authorization": f"Bearer {token}"}
    profile_data = {
        "profile_url": "https://www.gwars.io/info.php?id=283494"
    }
    
    response = requests.post(f"{BASE_URL}/auth/parse-gwars-profile", json=profile_data, headers=headers)
    if response.status_code == 200:
        result = response.json()
        if result["success"]:
            print(f"OK Профиль спарсен: {result['profile']['nickname']}")
        else:
            print(f"ERROR Ошибка парсинга: {result['error']}")
            return
    else:
        print(f"ERROR Ошибка запроса: {response.status_code}")
        print(response.text)
        return
    
    # 4. Получение профиля пользователя
    print("\n4. Получение профиля пользователя...")
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    if response.status_code == 200:
        user_data = response.json()
        print(f"OK Профиль получен")
        print(f"   Никнейм GWars: {user_data.get('gwars_nickname', 'Не указан')}")
        print(f"   URL профиля: {user_data.get('gwars_profile_url', 'Не указан')}")
        print(f"   Верифицирован: {user_data.get('gwars_verified', False)}")
    else:
        print(f"ERROR Ошибка получения профиля: {response.status_code}")
        print(response.text)
    
    # 5. Создание мероприятия (как админ)
    print("\n5. Создание мероприятия...")
    admin_login_data = {
        "email": "admin@example.com",
        "password": "admin"
    }
    
    admin_response = requests.post(f"{BASE_URL}/auth/login", json=admin_login_data)
    if admin_response.status_code == 200:
        admin_token = admin_response.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        event_data = {
            "name": "Тест никнейма 2026",
            "description": "Тестовое мероприятие для проверки никнеймов",
            "preregistration_start": "2024-12-01T00:00:00",
            "registration_start": "2024-12-15T00:00:00",
            "registration_end": "2024-12-31T23:59:59"
        }
        
        event_response = requests.post(f"{BASE_URL}/events/", json=event_data, headers=admin_headers)
        if event_response.status_code == 200:
            event_id = event_response.json()["id"]
            print(f"OK Мероприятие создано: ID {event_id}")
        else:
            print(f"ERROR Ошибка создания мероприятия: {event_response.status_code}")
            return
    else:
        print("ERROR Не удалось войти как админ")
        return
    
    # 6. Регистрация на мероприятие
    print("\n6. Регистрация на мероприятие...")
    registration_data = {
        "event_id": event_id,
        "registration_type": "preregistration"
    }
    
    response = requests.post(f"{BASE_URL}/events/{event_id}/register", json=registration_data, headers=headers)
    if response.status_code == 200:
        print("OK Регистрация на мероприятие выполнена")
    else:
        print(f"ERROR Ошибка регистрации: {response.status_code}")
        print(response.text)
    
    # 7. Получение участников мероприятия
    print("\n7. Получение участников мероприятия...")
    response = requests.get(f"{BASE_URL}/events/{event_id}/participants")
    if response.status_code == 200:
        participants = response.json()
        print(f"OK Участники получены: {len(participants)} человек")
        for participant in participants:
            print(f"   Никнейм: {participant['nickname']}")
            print(f"   Статус: {participant['status_text']}")
            print(f"   Профиль: {participant['gwars_profile_url']}")
    else:
        print(f"ERROR Ошибка получения участников: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    test_gwars_nickname_functionality()
