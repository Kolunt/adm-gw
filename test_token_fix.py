#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
import time

BASE_URL = "http://localhost:8004"

def test_token_fix():
    """Тестирование исправления проверки токена"""
    
    print("=== Тестирование исправления проверки токена ===\n")
    
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
    
    # 3. Получаем текущие настройки
    print("\n3. Получение текущих настроек...")
    try:
        response = requests.get(f"{BASE_URL}/admin/settings", headers=admin_headers, timeout=10)
        if response.status_code == 200:
            settings = response.json()
            print(f"OK Настройки получены: {len(settings)} настроек")
            
            # Находим настройки Dadata
            dadata_enabled = next((s for s in settings if s['key'] == 'dadata_enabled'), None)
            dadata_token = next((s for s in settings if s['key'] == 'dadata_token'), None)
            
            print(f"   dadata_enabled: {dadata_enabled['value'] if dadata_enabled else 'не найдено'}")
            print(f"   dadata_token: {'настроен' if dadata_token and dadata_token['value'] else 'не настроен'}")
        else:
            print(f"ERROR Ошибка получения настроек: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при получении настроек: {e}")
        return False
    
    # 4. Тестируем проверку токена с пустым значением
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
    
    # 5. Тестируем проверку неверного токена
    print("\n5. Тестирование проверки неверного токена...")
    try:
        response = requests.post(f"{BASE_URL}/admin/verify-dadata-token", 
            json={"token": "invalid_token_test_123"}, 
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
    
    # 6. Тестируем обновление настройки с неверным токеном
    print("\n6. Тестирование обновления настройки с неверным токеном...")
    try:
        response = requests.put(f"{BASE_URL}/admin/settings/dadata_token", 
            json={"value": "invalid_token_update_test_456"}, 
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
    
    print("\n=== Тестирование исправления завершено! ===")
    print("OK Backend API работает корректно")
    print("OK Проверка токена работает правильно")
    print("OK Валидация токенов работает")
    print("OK Frontend должен корректно работать с токенами")
    print("TIP Теперь в админке кнопка 'Проверить' должна работать корректно")
    return True

if __name__ == "__main__":
    test_token_fix()
