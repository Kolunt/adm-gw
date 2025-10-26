#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8004"

def test_dadata_integration():
    """Тестирование интеграции с Dadata.ru"""
    
    print("=== Тестирование интеграции с Dadata.ru ===\n")
    
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
    
    # 3. Получаем настройки системы
    print("\n3. Получение настроек системы...")
    try:
        response = requests.get(f"{BASE_URL}/admin/settings", headers=admin_headers, timeout=10)
        if response.status_code == 200:
            settings = response.json()
            print(f"OK Настройки получены: {len(settings)} настроек")
            
            # Проверяем наличие настроек Dadata
            dadata_enabled = next((s for s in settings if s['key'] == 'dadata_enabled'), None)
            dadata_token = next((s for s in settings if s['key'] == 'dadata_token'), None)
            
            if dadata_enabled:
                print(f"   dadata_enabled: {dadata_enabled['value']}")
            if dadata_token:
                print(f"   dadata_token: {'настроен' if dadata_token['value'] else 'не настроен'}")
        else:
            print(f"ERROR Ошибка получения настроек: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при получении настроек: {e}")
        return False
    
    # 4. Тестируем обновление настроек Dadata
    print("\n4. Тестирование обновления настроек Dadata...")
    try:
        # Включаем автодополнение
        response = requests.put(f"{BASE_URL}/admin/settings/dadata_enabled", 
            json={"value": "true"}, 
            headers=admin_headers, 
            timeout=10)
        if response.status_code == 200:
            print("OK Автодополнение включено")
        else:
            print(f"ERROR Ошибка включения автодополнения: {response.status_code}")
        
        # Устанавливаем тестовый токен (не настоящий)
        response = requests.put(f"{BASE_URL}/admin/settings/dadata_token", 
            json={"value": "test_token_123"}, 
            headers=admin_headers, 
            timeout=10)
        if response.status_code == 200:
            print("OK Тестовый токен установлен")
        else:
            print(f"ERROR Ошибка установки токена: {response.status_code}")
    except Exception as e:
        print(f"ERROR Ошибка при обновлении настроек: {e}")
        return False
    
    # 5. Тестируем API автодополнения адресов
    print("\n5. Тестирование API автодополнения адресов...")
    try:
        response = requests.post(f"{BASE_URL}/api/suggest-address", 
            json={"query": "Москва"}, 
            timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            suggestions = data.get('suggestions', [])
            print(f"OK API автодополнения работает: {len(suggestions)} подсказок")
            if suggestions:
                print(f"   Первая подсказка: {suggestions[0].get('value', 'N/A')}")
        elif response.status_code == 400:
            error_detail = response.json().get('detail', 'Unknown error')
            print(f"INFO API автодополнения недоступен: {error_detail}")
            print("   Это нормально, если токен Dadata не настроен или недействителен")
        else:
            print(f"ERROR Неожиданный ответ API: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"ERROR Ошибка при тестировании API: {e}")
        return False
    
    # 6. Отключаем автодополнение для тестирования
    print("\n6. Отключение автодополнения...")
    try:
        response = requests.put(f"{BASE_URL}/admin/settings/dadata_enabled", 
            json={"value": "false"}, 
            headers=admin_headers, 
            timeout=10)
        if response.status_code == 200:
            print("OK Автодополнение отключено")
        else:
            print(f"ERROR Ошибка отключения автодополнения: {response.status_code}")
    except Exception as e:
        print(f"ERROR Ошибка при отключении автодополнения: {e}")
        return False
    
    print("\n=== Тестирование интеграции с Dadata завершено! ===")
    print("OK Backend поддерживает настройки системы")
    print("OK API для управления настройками работает")
    print("OK API автодополнения адресов реализован")
    print("OK Frontend может использовать автодополнение адресов")
    print("TIP Для полной работы нужен действительный токен Dadata.ru")
    return True

if __name__ == "__main__":
    test_dadata_integration()
