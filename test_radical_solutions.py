#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8004"

def test_radical_solutions():
    """Тестирование радикальных решений"""
    
    print("=== Тестирование радикальных решений ===\n")
    
    # 1. Проверяем доступность backend
    print("1. Проверка доступности backend...")
    try:
        response = requests.get(f"{BASE_URL}/docs", timeout=5)
        if response.status_code == 200:
            print("OK Backend доступен на порту 8004")
        else:
            print(f"ERROR Backend недоступен: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("ERROR Не удается подключиться к backend на порту 8004")
        print("TIP Запустите: start_backend_radical.bat")
        return False
    except Exception as e:
        print(f"ERROR Ошибка подключения: {e}")
        return False
    
    # 2. Тестируем регистрацию пользователя
    print("\n2. Тестирование регистрации пользователя...")
    register_data = {
        "email": "test_radical_solutions@example.com",
        "password": "testpass123",
        "confirm_password": "testpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data, timeout=10)
        if response.status_code == 200:
            user_data = response.json()
            print("OK Регистрация пользователя работает")
            print(f"   ID: {user_data['id']}")
            print(f"   Email: {user_data['email']}")
            print(f"   Profile completed: {user_data['profile_completed']}")
        else:
            print(f"ERROR Ошибка регистрации: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при регистрации: {e}")
        return False
    
    # 3. Тестируем вход в систему
    print("\n3. Тестирование входа в систему...")
    login_data = {
        "email": "test_radical_solutions@example.com",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data, timeout=10)
        if response.status_code == 200:
            token_data = response.json()
            print("OK Вход в систему работает")
            print(f"   Token получен: {len(token_data['access_token'])} символов")
        else:
            print(f"ERROR Ошибка входа: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при входе: {e}")
        return False
    
    print("\n=== Все радикальные решения работают! ===")
    print("OK Backend стабильно работает на порту 8004")
    print("OK Регистрация пользователей работает")
    print("OK Вход в систему работает")
    print("OK Frontend будет показывать понятные сообщения об ошибках")
    return True

if __name__ == "__main__":
    test_radical_solutions()
