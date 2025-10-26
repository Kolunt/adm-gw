#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8004"

def test_token_verification():
    """Тестирование проверки токена Dadata.ru"""
    
    print("=== Тестирование проверки токена Dadata.ru ===\n")
    
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
    
    # 3. Тестируем проверку неверного токена
    print("\n3. Тестирование проверки неверного токена...")
    try:
        response = requests.post(f"{BASE_URL}/admin/verify-dadata-token", 
            json={"token": "invalid_token_123"}, 
            headers=admin_headers, 
            timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if not data["valid"]:
                print(f"OK Неверный токен корректно отклонен: {data['error']}")
            else:
                print("ERROR Неверный токен был принят как валидный")
                return False
        else:
            print(f"ERROR Неожиданный ответ API: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при проверке неверного токена: {e}")
        return False
    
    # 4. Тестируем проверку пустого токена
    print("\n4. Тестирование проверки пустого токена...")
    try:
        response = requests.post(f"{BASE_URL}/admin/verify-dadata-token", 
            json={"token": ""}, 
            headers=admin_headers, 
            timeout=10)
        
        if response.status_code == 400:
            print("OK Пустой токен корректно отклонен")
        else:
            print(f"ERROR Пустой токен не был отклонен: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при проверке пустого токена: {e}")
        return False
    
    # 5. Тестируем проверку токена без поля token
    print("\n5. Тестирование проверки без поля token...")
    try:
        response = requests.post(f"{BASE_URL}/admin/verify-dadata-token", 
            json={}, 
            headers=admin_headers, 
            timeout=10)
        
        if response.status_code == 400:
            print("OK Запрос без поля token корректно отклонен")
        else:
            print(f"ERROR Запрос без поля token не был отклонен: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при проверке без поля token: {e}")
        return False
    
    # 6. Тестируем обновление настройки с неверным токеном
    print("\n6. Тестирование обновления настройки с неверным токеном...")
    try:
        response = requests.put(f"{BASE_URL}/admin/settings/dadata_token", 
            json={"value": "invalid_token_456"}, 
            headers=admin_headers, 
            timeout=10)
        
        if response.status_code == 400:
            print("OK Обновление с неверным токеном корректно отклонено")
        else:
            print(f"ERROR Обновление с неверным токеном не было отклонено: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при обновлении с неверным токеном: {e}")
        return False
    
    # 7. Тестируем обновление настройки с пустым токеном (должно пройти)
    print("\n7. Тестирование обновления настройки с пустым токеном...")
    try:
        response = requests.put(f"{BASE_URL}/admin/settings/dadata_token", 
            json={"value": ""}, 
            headers=admin_headers, 
            timeout=10)
        
        if response.status_code == 200:
            print("OK Обновление с пустым токеном прошло успешно")
        else:
            print(f"ERROR Обновление с пустым токеном не прошло: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при обновлении с пустым токеном: {e}")
        return False
    
    print("\n=== Тестирование проверки токена завершено! ===")
    print("OK API проверки токена работает корректно")
    print("OK Неверные токены отклоняются")
    print("OK Пустые токены обрабатываются правильно")
    print("OK Обновление настроек с проверкой токена работает")
    print("TIP Для полной работы нужен действительный токен Dadata.ru")
    return True

if __name__ == "__main__":
    test_token_verification()
