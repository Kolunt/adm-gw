#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json

BASE_URL = "http://localhost:8004"

def test_nickname_parsing():
    """Тестирование исправленного парсинга никнейма"""
    
    print("=== Тестирование парсинга никнейма GWars ===\n")
    
    # 1. Регистрация нового пользователя
    print("1. Регистрация нового пользователя...")
    register_data = {
        "email": "test_nickname_parsing_new@example.com",
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
        "email": "test_nickname_parsing_new@example.com",
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
            print(f"OK Профиль спарсен:")
            print(f"   Никнейм: '{result['profile']['nickname']}'")
            print(f"   Уровень: {result['profile']['level']}")
            print(f"   URL: {result['profile']['url']}")
            
            # Проверяем, что никнейм извлечен корректно
            expected_nickname = "_Колунт_"
            if result['profile']['nickname'] == expected_nickname:
                print(f"OK Никнейм извлечен корректно: '{expected_nickname}'")
            else:
                print(f"ERROR Ошибка! Ожидался '{expected_nickname}', получен '{result['profile']['nickname']}'")
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
        print(f"   Никнейм GWars: '{user_data.get('gwars_nickname', 'Не указан')}'")
        print(f"   URL профиля: {user_data.get('gwars_profile_url', 'Не указан')}")
        print(f"   Верифицирован: {user_data.get('gwars_verified', False)}")
        
        # Проверяем сохранение в базе данных
        if user_data.get('gwars_nickname') == expected_nickname:
            print(f"OK Никнейм корректно сохранен в базе данных: '{expected_nickname}'")
        else:
            print(f"ERROR Ошибка сохранения! Ожидался '{expected_nickname}', сохранен '{user_data.get('gwars_nickname')}'")
    else:
        print(f"ERROR Ошибка получения профиля: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    test_nickname_parsing()
