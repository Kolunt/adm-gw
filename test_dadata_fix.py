#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json

BASE_URL = "http://localhost:8004"

def test_dadata_fix():
    """Тестирование исправления настроек Dadata"""
    
    print("=== Тестирование исправления настроек Dadata ===\n")
    
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
            print(f"ERROR Ошибка входа администратора: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при входе администратора: {e}")
        return False
    
    # 3. Пытаемся включить автодополнение
    print("\n3. Включение автодополнения...")
    try:
        update_data = {
            "value": True
        }
        response = requests.put(f"{BASE_URL}/admin/settings/dadata_enabled", json=update_data, headers=admin_headers, timeout=10)
        if response.status_code == 200:
            result = response.json()
            print(f"OK Автодополнение включено: {result['value']} (тип: {type(result['value'])})")
        else:
            print(f"ERROR Ошибка включения автодополнения: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при включении автодополнения: {e}")
        return False
    
    # 4. Проверяем результат
    print("\n4. Проверка результата...")
    try:
        response = requests.get(f"{BASE_URL}/admin/settings", headers=admin_headers, timeout=10)
        if response.status_code == 200:
            settings = response.json()
            dadata_enabled = next((s for s in settings if s['key'] == 'dadata_enabled'), None)
            
            if dadata_enabled:
                print(f"OK dadata_enabled: {dadata_enabled['value']} (тип: {type(dadata_enabled['value'])})")
                if dadata_enabled['value']:
                    print("OK Автодополнение успешно включено!")
                else:
                    print("ERROR Автодополнение не включено")
            else:
                print("ERROR Настройка dadata_enabled не найдена")
                
        else:
            print(f"ERROR Ошибка проверки настроек: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при проверке настроек: {e}")
        return False
    
    return True

if __name__ == "__main__":
    test_dadata_fix()
