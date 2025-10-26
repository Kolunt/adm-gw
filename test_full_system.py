#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8004"

def test_full_system():
    """Тестирование полной системы"""
    
    print("=== Тестирование полной системы ===\n")
    
    # 1. Регистрация нового пользователя
    print("1. Регистрация нового пользователя...")
    register_data = {
        "email": "test_full_system@example.com",
        "password": "testpass123",
        "confirm_password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    if response.status_code == 200:
        user_data = response.json()
        print("OK Пользователь зарегистрирован")
        print(f"   ID: {user_data['id']}")
        print(f"   Email: {user_data['email']}")
        print(f"   Profile completed: {user_data['profile_completed']}")
    else:
        print(f"ERROR Ошибка регистрации: {response.status_code}")
        print(response.text)
        return False
    
    # 2. Вход в систему
    print("\n2. Вход в систему...")
    login_data = {
        "email": "test_full_system@example.com",
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
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Заполнение профиля
    print("\n3. Заполнение профиля...")
    profile_data = {
        "gwars_profile_url": "https://www.gwars.io/info.php?id=283494",
        "full_name": "Тестовый Пользователь",
        "address": "Тестовый адрес",
        "interests": "Тестирование"
    }
    
    response = requests.post(f"{BASE_URL}/profile/step1", json={"gwars_profile_url": profile_data["gwars_profile_url"]}, headers=headers)
    if response.status_code == 200:
        print("OK Шаг 1 профиля выполнен")
    
    response = requests.post(f"{BASE_URL}/profile/step2", json={"full_name": profile_data["full_name"], "address": profile_data["address"]}, headers=headers)
    if response.status_code == 200:
        print("OK Шаг 2 профиля выполнен")
    
    response = requests.post(f"{BASE_URL}/profile/step3", json={"interests": profile_data["interests"]}, headers=headers)
    if response.status_code == 200:
        print("OK Шаг 3 профиля выполнен")
    
    # 4. Создание мероприятия (как админ)
    print("\n4. Создание мероприятия...")
    admin_login_data = {
        "email": "admin@example.com",
        "password": "admin"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=admin_login_data)
    if response.status_code == 200:
        admin_token_data = response.json()
        admin_token = admin_token_data["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        now = datetime.utcnow()
        event_data = {
            "name": "Финальное тестовое мероприятие",
            "description": "Мероприятие для финального тестирования",
            "preregistration_start": (now - timedelta(minutes=5)).isoformat(),
            "registration_start": (now + timedelta(hours=2)).isoformat(),
            "registration_end": (now + timedelta(hours=4)).isoformat()
        }
        
        response = requests.post(f"{BASE_URL}/events/", json=event_data, headers=admin_headers)
        if response.status_code == 200:
            event = response.json()
            print(f"OK Мероприятие создано: {event['name']} (ID: {event['id']})")
        else:
            print(f"ERROR Ошибка создания мероприятия: {response.status_code}")
            print(response.text)
            return False
    else:
        print(f"ERROR Ошибка входа как админ: {response.status_code}")
        return False
    
    # 5. Регистрация на мероприятие
    print("\n5. Регистрация на мероприятие...")
    registration_data = {
        "registration_type": "preregistration"
    }
    
    response = requests.post(f"{BASE_URL}/events/{event['id']}/register", json=registration_data, headers=headers)
    if response.status_code == 200:
        registration = response.json()
        print(f"OK Регистрация успешна!")
        print(f"   ID регистрации: {registration['id']}")
        print(f"   Тип регистрации: {registration['registration_type']}")
        print(f"   Подтверждено: {registration['is_confirmed']}")
    else:
        print(f"ERROR Ошибка регистрации: {response.status_code}")
        print(response.text)
        return False
    
    print("\n=== Все тесты пройдены успешно ===")
    print("Система работает корректно!")
    return True

if __name__ == "__main__":
    test_full_system()
