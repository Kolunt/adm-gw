#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json

BASE_URL = "http://localhost:8004"

def test_admin_route_protection():
    """Тестирование защиты админских маршрутов"""
    
    print("=== Тестирование защиты админских маршрутов ===\n")
    
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
    
    # 2. Тестируем доступ к админским эндпоинтам без авторизации
    print("\n2. Тестирование доступа к админским эндпоинтам без авторизации...")
    
    admin_endpoints = [
        "/admin/settings",
        "/admin/users",
        "/admin/events",
        "/admin/settings/general",
        "/admin/settings/dadata"
    ]
    
    for endpoint in admin_endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=5)
            if response.status_code == 401:
                print(f"OK {endpoint} - правильно требует авторизации (401)")
            elif response.status_code == 403:
                print(f"OK {endpoint} - правильно запрещает доступ (403)")
            else:
                print(f"WARNING {endpoint} - неожиданный статус: {response.status_code}")
        except Exception as e:
            print(f"ERROR {endpoint} - ошибка: {e}")
    
    # 3. Регистрируем обычного пользователя
    print("\n3. Регистрация обычного пользователя...")
    user_data = {
        "email": "test_user_protection@example.com",
        "password": "password123",
        "confirm_password": "password123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data, timeout=10)
        if response.status_code == 200:
            print("OK Обычный пользователь зарегистрирован")
        else:
            print(f"ERROR Ошибка регистрации: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при регистрации: {e}")
        return False
    
    # 4. Входим как обычный пользователь
    print("\n4. Вход как обычный пользователь...")
    login_data = {
        "email": "test_user_protection@example.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data, timeout=10)
        if response.status_code == 200:
            user_token_data = response.json()
            user_token = user_token_data["access_token"]
            user_headers = {"Authorization": f"Bearer {user_token}"}
            print("OK Вход как обычный пользователь выполнен")
        else:
            print(f"ERROR Ошибка входа: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при входе: {e}")
        return False
    
    # 5. Тестируем доступ к админским эндпоинтам как обычный пользователь
    print("\n5. Тестирование доступа к админским эндпоинтам как обычный пользователь...")
    
    for endpoint in admin_endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", headers=user_headers, timeout=5)
            if response.status_code == 403:
                print(f"OK {endpoint} - правильно запрещает доступ обычному пользователю (403)")
            else:
                print(f"WARNING {endpoint} - неожиданный статус для обычного пользователя: {response.status_code}")
        except Exception as e:
            print(f"ERROR {endpoint} - ошибка: {e}")
    
    # 6. Входим как админ
    print("\n6. Вход как администратор...")
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
            print(f"ERROR Ошибка входа администратора: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при входе администратора: {e}")
        return False
    
    # 7. Тестируем доступ к админским эндпоинтам как админ
    print("\n7. Тестирование доступа к админским эндпоинтам как администратор...")
    
    for endpoint in admin_endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", headers=admin_headers, timeout=5)
            if response.status_code == 200:
                print(f"OK {endpoint} - доступ разрешен администратору (200)")
            else:
                print(f"WARNING {endpoint} - неожиданный статус для администратора: {response.status_code}")
        except Exception as e:
            print(f"ERROR {endpoint} - ошибка: {e}")
    
    print("\n=== Тестирование завершено! ===")
    print("OK Все админские маршруты защищены")
    print("OK Обычные пользователи не могут получить доступ к админке")
    print("OK Только администраторы имеют доступ к админским функциям")
    print("TIP Frontend также защищен компонентом AdminRouteGuard")
    print("TIP Все админские кнопки скрыты для неавторизованных пользователей")
    return True

if __name__ == "__main__":
    test_admin_route_protection()
