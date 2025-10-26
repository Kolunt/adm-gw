#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8004"

def test_current_event_simple():
    """Простое тестирование CurrentEventInfo"""
    
    print("=== Простое тестирование CurrentEventInfo ===\n")
    
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
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Создание тестового мероприятия с правильными датами
    print("\n2. Создание тестового мероприятия...")
    now = datetime.now()
    event_data = {
        "name": "Активное мероприятие для тестирования",
        "description": "Мероприятие для тестирования компонента CurrentEventInfo",
        "preregistration_start": (now - timedelta(hours=1)).isoformat(),  # Началось час назад
        "registration_start": (now + timedelta(hours=1)).isoformat(),     # Начнется через час
        "registration_end": (now + timedelta(hours=3)).isoformat()        # Закончится через 3 часа
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
        print(f"   Предварительная регистрация: {current_event['preregistration_start']}")
        print(f"   Основная регистрация: {current_event['registration_start']}")
        print(f"   Окончание: {current_event['registration_end']}")
    else:
        print(f"ERROR Ошибка получения текущего мероприятия: {response.status_code}")
        print(response.text)
        return False
    
    print("\n=== Тест завершен успешно ===")
    print("Теперь компонент CurrentEventInfo должен работать корректно!")
    print("Проверьте frontend - ошибки 404 должны исчезнуть!")
    return True

if __name__ == "__main__":
    test_current_event_simple()
