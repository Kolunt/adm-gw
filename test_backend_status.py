#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8004"

def test_backend_status():
    """Тестирование статуса backend"""
    
    print("=== Тестирование статуса backend ===\n")
    
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
    
    # Тестируем вход как админ
    print("\n1. Тестирование входа как администратор...")
    admin_login_data = {
        "email": "admin@example.com",
        "password": "admin"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=admin_login_data, timeout=10)
        if response.status_code == 200:
            token_data = response.json()
            print("OK Вход как администратор работает")
            print(f"   Token получен: {len(token_data['access_token'])} символов")
        else:
            print(f"ERROR Ошибка входа: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при входе: {e}")
        return False
    
    print("\n=== Backend работает корректно ===")
    return True

if __name__ == "__main__":
    test_backend_status()
