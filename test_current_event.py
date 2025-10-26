#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8004"

def test_current_event():
    """Тестирование получения текущего мероприятия"""
    
    print("=== Тестирование текущего мероприятия ===\n")
    
    # 1. Проверяем текущее мероприятие
    print("1. Проверка текущего мероприятия...")
    response = requests.get(f"{BASE_URL}/events/current")
    print(f"   Статус: {response.status_code}")
    
    if response.status_code == 200:
        event = response.json()
        print(f"   OK Найдено мероприятие: {event['name']}")
        return True
    elif response.status_code == 404:
        print("   INFO Нет активных мероприятий")
        return False
    else:
        print(f"   ERROR: {response.text}")
        return False

def create_test_event():
    """Создание тестового мероприятия"""
    
    print("\n2. Создание тестового мероприятия...")
    
    # Входим как админ
    admin_login_data = {
        "email": "admin@example.com",
        "password": "admin"
    }
    
    admin_response = requests.post(f"{BASE_URL}/auth/login", json=admin_login_data)
    if admin_response.status_code != 200:
        print(f"   ERROR Не удалось войти как админ: {admin_response.status_code}")
        return False
    
    admin_token = admin_response.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Создаем мероприятие
    now = datetime.now()
    event_data = {
        "name": "Тестовое мероприятие 2024",
        "description": "Тестовое мероприятие для проверки CurrentEventInfo",
        "preregistration_start": (now - timedelta(days=1)).isoformat(),
        "registration_start": (now + timedelta(days=1)).isoformat(),
        "registration_end": (now + timedelta(days=30)).isoformat()
    }
    
    event_response = requests.post(f"{BASE_URL}/events/", json=event_data, headers=admin_headers)
    if event_response.status_code == 200:
        event_id = event_response.json()["id"]
        print(f"   OK Мероприятие создано: ID {event_id}")
        return True
    else:
        print(f"   ERROR Ошибка создания мероприятия: {event_response.status_code}")
        print(f"   {event_response.text}")
        return False

if __name__ == "__main__":
    # Проверяем текущее мероприятие
    has_event = test_current_event()
    
    # Если нет мероприятия, создаем тестовое
    if not has_event:
        create_test_event()
        
        # Проверяем снова
        print("\n3. Повторная проверка...")
        test_current_event()
