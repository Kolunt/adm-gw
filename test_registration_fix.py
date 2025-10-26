#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json

BASE_URL = "http://localhost:8004"

def test_registration():
    """Тестирование регистрации пользователя"""
    
    print("=== Тестирование регистрации ===\n")
    
    # 1. Регистрация нового пользователя
    print("1. Регистрация нового пользователя...")
    register_data = {
        "email": "test_registration_fix@example.com",
        "password": "testpass123",
        "confirm_password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    print(f"   Статус: {response.status_code}")
    
    if response.status_code == 200:
        user_data = response.json()
        print("OK Пользователь зарегистрирован")
        print(f"   ID: {user_data['id']}")
        print(f"   Email: {user_data['email']}")
        print(f"   Никнейм GWars: {user_data.get('gwars_nickname', 'Не указан')}")
        print(f"   Профиль завершен: {user_data.get('profile_completed', False)}")
        return True
    else:
        print(f"ERROR Ошибка регистрации: {response.status_code}")
        print(f"   Ответ: {response.text}")
        return False

if __name__ == "__main__":
    test_registration()
