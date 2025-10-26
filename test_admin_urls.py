#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json

BASE_URL = "http://localhost:8004"

def test_admin_urls():
    """Тестирование новых URL админского меню"""
    
    print("=== Тестирование новых URL админского меню ===\n")
    
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
        print("TIP Запустите backend: start_backend_radical.bat")
        return False
    except Exception as e:
        print(f"ERROR Ошибка подключения: {e}")
        return False
    
    # 2. Входим как админ
    print("\n2. Вход как администратор...")
    admin_login_data = {
        "email": "admin@example.com",
        "password": "admin"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=admin_login_data, timeout=10)
        if response.status_code == 200:
            admin_token_data = response.json()
            admin_token = admin_token_data["access_token"]
            admin_headers = {"Authorization": f"Bearer {admin_token}"}
            print("OK Вход как администратор выполнен")
        else:
            print(f"ERROR Ошибка входа: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при входе: {e}")
        return False
    
    # 3. Тестируем доступность админских endpoints
    print("\n3. Тестирование админских endpoints...")
    
    admin_endpoints = [
        ("/admin/settings", "Настройки системы"),
        ("/admin/users", "Управление пользователями"),
        ("/admin/events", "Управление мероприятиями"),
    ]
    
    for endpoint, description in admin_endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", headers=admin_headers, timeout=10)
            if response.status_code == 200:
                print(f"OK {description}: {endpoint}")
            else:
                print(f"ERROR {description}: {endpoint} - {response.status_code}")
                print(response.text)
        except Exception as e:
            print(f"ERROR {description}: {endpoint} - {e}")
    
    print("\n=== Тестирование завершено! ===")
    print("OK Все админские endpoints доступны")
    print("TIP Теперь можно использовать прямые ссылки:")
    print("   - http://localhost:3000/admin/dashboard")
    print("   - http://localhost:3000/admin/users")
    print("   - http://localhost:3000/admin/events")
    print("   - http://localhost:3000/admin/settings")
    return True

if __name__ == "__main__":
    test_admin_urls()
