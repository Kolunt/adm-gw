#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8004"

def test_backend_connection():
    """Тестирование подключения к backend"""
    
    print("=== Тестирование подключения к backend ===\n")
    
    try:
        # Проверяем доступность API
        response = requests.get(f"{BASE_URL}/docs", timeout=5)
        if response.status_code == 200:
            print("OK Backend доступен на порту 8004")
        else:
            print(f"ERROR Backend недоступен: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("ERROR Не удается подключиться к backend на порту 8004")
        return False
    except Exception as e:
        print(f"ERROR Ошибка подключения: {e}")
        return False
    
    # Тестируем регистрацию пользователя
    print("\n1. Тестирование регистрации пользователя...")
    register_data = {
        "email": "test_backend_connection@example.com",
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
    
    print("\n=== Backend работает корректно ===")
    return True

if __name__ == "__main__":
    test_backend_connection()
