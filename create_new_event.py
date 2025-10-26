#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8004"

def create_new_event():
    """Создание нового мероприятия с правильным временем"""
    
    print("=== Создание нового мероприятия ===\n")
    
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
    
    # 2. Создание нового мероприятия
    print("\n2. Создание нового мероприятия...")
    now = datetime.now()
    event_data = {
        "name": "Новое мероприятие для тестирования",
        "description": "Мероприятие с правильным временем",
        "preregistration_start": (now - timedelta(minutes=10)).isoformat(),  # Началось 10 минут назад
        "registration_start": (now + timedelta(hours=1)).isoformat(),        # Начнется через час
        "registration_end": (now + timedelta(hours=3)).isoformat()           # Закончится через 3 часа
    }
    
    response = requests.post(f"{BASE_URL}/events/", json=event_data, headers=headers)
    if response.status_code == 200:
        event = response.json()
        print(f"OK Мероприятие создано: {event['name']}")
        print(f"   ID: {event['id']}")
        print(f"   Предварительная регистрация: {event['preregistration_start']}")
        print(f"   Основная регистрация: {event['registration_start']}")
        print(f"   Окончание: {event['registration_end']}")
        return event
    else:
        print(f"ERROR Ошибка создания мероприятия: {response.status_code}")
        print(response.text)
        return False

if __name__ == "__main__":
    create_new_event()
