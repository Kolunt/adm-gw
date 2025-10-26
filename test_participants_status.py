#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json

BASE_URL = "http://localhost:8004"

def test_participants_with_status():
    print("=== Тестирование API участников с статусами ===")
    
    # 1. Вход в систему
    print("\n1. Вход в систему...")
    login_data = {
        "email": "participant@test.com",
        "password": "password123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code == 200:
        print("OK Пользователь вошел в систему")
        user_data = response.json()
        token = user_data["access_token"]
    else:
        print(f"ERROR Ошибка входа: {response.status_code}")
        print(response.text)
        return
    
    # 2. Получение текущего мероприятия
    print("\n2. Получение текущего мероприятия...")
    response = requests.get(f"{BASE_URL}/events/current")
    if response.status_code == 200:
        event = response.json()
        print(f"OK Мероприятие найдено: {event['name']} (ID: {event['id']})")
        event_id = event['id']
    else:
        print(f"ERROR Нет активных мероприятий: {response.status_code}")
        return
    
    # 3. Получение участников мероприятия с статусами
    print("\n3. Получение участников мероприятия с статусами...")
    response = requests.get(f"{BASE_URL}/events/{event_id}/participants")
    if response.status_code == 200:
        participants = response.json()
        print(f"OK Участники получены: {len(participants)} человек")
        for participant in participants:
            status_emoji = "OK" if participant['status'] == 'confirmed' else "WAIT"
            print(f"  {status_emoji} {participant['nickname']}: {participant['status_text']}")
            print(f"     Профиль: {participant['gwars_profile_url']}")
    else:
        print(f"ERROR Ошибка получения участников: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    test_participants_with_status()
