#!/usr/bin/env python3
"""
Отладочный скрипт для проверки функции generate_gift_assignments
"""

import requests
import json

BASE_URL = "http://localhost:8006"

def debug_gift_assignments():
    """Отладка системы назначения подарков"""
    
    # Входим как администратор
    login_data = {
        "email": "admin@example.com",
        "password": "admin"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code != 200:
        print(f"Ошибка входа: {response.status_code} - {response.text}")
        return
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    print("Успешный вход как администратор")
    
    # Проверяем участников мероприятия
    print("\n=== ПРОВЕРКА УЧАСТНИКОВ ===")
    response = requests.get(f"{BASE_URL}/events/2/participants", headers=headers)
    if response.status_code == 200:
        participants = response.json()
        print(f"Участников мероприятия: {len(participants)}")
        for i, participant in enumerate(participants[:3]):
            print(f"  {i+1}. {participant.get('name', 'N/A')} - Подтвержден: {participant.get('is_confirmed', False)}")
    else:
        print(f"Ошибка получения участников: {response.status_code}")
    
    # Проверяем текущие назначения
    print("\n=== ПРОВЕРКА НАЗНАЧЕНИЙ ===")
    response = requests.get(f"{BASE_URL}/admin/events/2/gift-assignments", headers=headers)
    if response.status_code == 200:
        assignments = response.json()
        print(f"Текущих назначений: {len(assignments)}")
    else:
        print(f"Ошибка получения назначений: {response.status_code} - {response.text}")
    
    # Пробуем создать назначения
    print("\n=== СОЗДАНИЕ НАЗНАЧЕНИЙ ===")
    response = requests.post(f"{BASE_URL}/admin/events/2/gift-assignments/generate", headers=headers)
    print(f"Статус ответа: {response.status_code}")
    print(f"Ответ: {response.text}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Результат: {result}")
    else:
        print(f"Ошибка: {response.status_code} - {response.text}")

if __name__ == "__main__":
    debug_gift_assignments()
