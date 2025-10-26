#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
import time

BASE_URL = "http://127.0.0.1:8004"

def test_interests_system():
    """Тестирование системы интересов"""
    print("=== Тестирование системы интересов ===")
    
    # Ждем запуска backend
    print("Ожидание запуска backend...")
    for i in range(10):
        try:
            response = requests.get(f"{BASE_URL}/docs")
            if response.status_code == 200:
                print("Backend запущен!")
                break
        except:
            pass
        time.sleep(1)
    else:
        print("ERROR: Backend не запустился")
        return
    
    # Регистрация тестового пользователя
    print("\n1. Регистрация тестового пользователя...")
    register_data = {
        "email": "test_interests@example.com",
        "password": "testpass123",
        "confirm_password": "testpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        if response.status_code == 200:
            print("✓ Пользователь зарегистрирован")
        else:
            print(f"ERROR: Ошибка регистрации: {response.status_code} {response.text}")
            return
    except Exception as e:
        print(f"ERROR: Ошибка регистрации: {e}")
        return
    
    # Вход в систему
    print("\n2. Вход в систему...")
    login_data = {
        "email": "test_interests@example.com",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            token = response.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            print("✓ Вход выполнен")
        else:
            print(f"ERROR: Ошибка входа: {response.status_code} {response.text}")
            return
    except Exception as e:
        print(f"ERROR: Ошибка входа: {e}")
        return
    
    # Тест поиска интересов
    print("\n3. Тест поиска интересов...")
    try:
        response = requests.get(f"{BASE_URL}/api/interests/search?query=спорт")
        if response.status_code == 200:
            results = response.json()
            print(f"✓ Поиск работает. Найдено: {len(results)} результатов")
        else:
            print(f"ERROR: Ошибка поиска: {response.status_code} {response.text}")
    except Exception as e:
        print(f"ERROR: Ошибка поиска: {e}")
    
    # Тест создания нового интереса
    print("\n4. Тест создания нового интереса...")
    try:
        interest_data = {"name": "программирование"}
        response = requests.post(f"{BASE_URL}/api/interests/create", json=interest_data, headers=headers)
        if response.status_code == 200:
            interest = response.json()
            print(f"✓ Интерес создан: {interest['name']} (ID: {interest['id']})")
        else:
            print(f"ERROR: Ошибка создания интереса: {response.status_code} {response.text}")
    except Exception as e:
        print(f"ERROR: Ошибка создания интереса: {e}")
    
    # Тест создания существующего интереса
    print("\n5. Тест создания существующего интереса...")
    try:
        interest_data = {"name": "программирование"}
        response = requests.post(f"{BASE_URL}/api/interests/create", json=interest_data, headers=headers)
        if response.status_code == 200:
            interest = response.json()
            print(f"✓ Существующий интерес возвращен: {interest['name']} (ID: {interest['id']})")
        else:
            print(f"ERROR: Ошибка создания существующего интереса: {response.status_code} {response.text}")
    except Exception as e:
        print(f"ERROR: Ошибка создания существующего интереса: {e}")
    
    # Тест получения популярных интересов
    print("\n6. Тест получения популярных интересов...")
    try:
        response = requests.get(f"{BASE_URL}/api/interests/popular")
        if response.status_code == 200:
            interests = response.json()
            print(f"✓ Популярные интересы получены: {len(interests)} штук")
            for interest in interests[:3]:
                print(f"  - {interest['name']}")
        else:
            print(f"ERROR: Ошибка получения популярных интересов: {response.status_code} {response.text}")
    except Exception as e:
        print(f"ERROR: Ошибка получения популярных интересов: {e}")
    
    print("\n=== Тестирование завершено ===")

if __name__ == "__main__":
    test_interests_system()
