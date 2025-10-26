#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8004"

def test_event_registration_fix():
    """Тестирование исправления регистрации на мероприятие"""
    
    print("=== Тестирование исправления регистрации ===\n")
    
    # 1. Регистрация нового пользователя
    print("1. Регистрация нового пользователя...")
    register_data = {
        "email": "test_registration_working@example.com",
        "password": "testpass123",
        "confirm_password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    if response.status_code == 200:
        print("OK Пользователь зарегистрирован")
    else:
        print(f"ERROR Ошибка регистрации: {response.status_code}")
        print(response.text)
        return False
    
    # 2. Вход в систему
    print("\n2. Вход в систему...")
    login_data = {
        "email": "test_registration_working@example.com",
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
    
    # 4. Получение активного мероприятия
    print("\n4. Получение активного мероприятия...")
    response = requests.get(f"{BASE_URL}/events/current")
    if response.status_code == 200:
        event = response.json()
        print(f"OK Активное мероприятие: {event['name']} (ID: {event['id']})")
    else:
        print(f"ERROR Нет активного мероприятия: {response.status_code}")
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
    
    print("\n=== Тест завершен успешно ===")
    print("Регистрация на мероприятие работает корректно!")
    return True

if __name__ == "__main__":
    test_event_registration_fix()
