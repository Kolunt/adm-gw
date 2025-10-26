#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json

BASE_URL = "http://localhost:8004"

def test_participants_api():
    print("=== Тестирование API участников мероприятия ===")
    
    # 1. Регистрация пользователя
    print("\n1. Регистрация пользователя...")
    register_data = {
        "email": "participant@test.com",
        "password": "password123",
        "confirm_password": "password123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    if response.status_code == 200:
        print("OK Пользователь зарегистрирован")
        user_data = response.json()
        token = user_data["access_token"]
    else:
        print(f"ERROR Ошибка регистрации: {response.status_code}")
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
    
    # 3. Получение участников мероприятия
    print("\n3. Получение участников мероприятия...")
    response = requests.get(f"{BASE_URL}/events/{event_id}/participants")
    if response.status_code == 200:
        participants = response.json()
        print(f"OK Участники получены: {len(participants)} человек")
        for participant in participants:
            print(f"  - {participant['nickname']}: {participant['gwars_profile_url']}")
    else:
        print(f"ERROR Ошибка получения участников: {response.status_code}")
        print(response.text)
    
    # 4. Завершение профиля пользователя
    print("\n4. Завершение профиля пользователя...")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Шаг 1: GWars профиль
    profile_data = {
        "gwars_profile_url": "https://www.gwars.io/info.php?id=12345"
    }
    response = requests.post(f"{BASE_URL}/profile/step1", json=profile_data, headers=headers)
    if response.status_code == 200:
        print("OK GWars профиль добавлен")
    
    # Шаг 2: ФИО и адрес
    profile_data = {
        "full_name": "Тестовый Участник",
        "address": "Тестовый адрес 123"
    }
    response = requests.post(f"{BASE_URL}/profile/step2", json=profile_data, headers=headers)
    if response.status_code == 200:
        print("OK ФИО и адрес добавлены")
    
    # Шаг 3: Интересы
    profile_data = {
        "interests": "Тестирование, программирование"
    }
    response = requests.post(f"{BASE_URL}/profile/step3", json=profile_data, headers=headers)
    if response.status_code == 200:
        print("OK Профиль завершен")
    
    # 5. Регистрация на мероприятие
    print("\n5. Регистрация на мероприятие...")
    registration_data = {
        "registration_type": "preregistration"
    }
    response = requests.post(f"{BASE_URL}/events/{event_id}/register", json=registration_data, headers=headers)
    if response.status_code == 200:
        print("OK Регистрация на мероприятие выполнена")
    else:
        print(f"ERROR Ошибка регистрации: {response.status_code}")
        print(response.text)
    
    # 6. Подтверждение участия
    print("\n6. Подтверждение участия...")
    confirmation_data = {
        "confirmed_address": "Подтвержденный адрес 456"
    }
    response = requests.post(f"{BASE_URL}/events/{event_id}/confirm", json=confirmation_data, headers=headers)
    if response.status_code == 200:
        print("OK Участие подтверждено")
    else:
        print(f"ERROR Ошибка подтверждения: {response.status_code}")
        print(response.text)
    
    # 7. Повторное получение участников
    print("\n7. Повторное получение участников...")
    response = requests.get(f"{BASE_URL}/events/{event_id}/participants")
    if response.status_code == 200:
        participants = response.json()
        print(f"OK Участники обновлены: {len(participants)} человек")
        for participant in participants:
            print(f"  - {participant['nickname']}: {participant['gwars_profile_url']}")
    else:
        print(f"ERROR Ошибка получения участников: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    test_participants_api()
