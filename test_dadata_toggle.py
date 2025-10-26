#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json

BASE_URL = "http://localhost:8004"

def test_dadata_toggle():
    """Тестирование переключения автодополнения Dadata"""
    
    print("=== Тестирование переключения автодополнения Dadata ===\n")
    
    # 1. Входим как админ
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
            return False
    except Exception as e:
        print(f"ERROR Ошибка при входе администратора: {e}")
        return False
    
    # 2. Проверяем текущее состояние
    print("\n2. Проверка текущего состояния...")
    try:
        response = requests.get(f"{BASE_URL}/admin/settings", headers=admin_headers, timeout=10)
        if response.status_code == 200:
            settings = response.json()
            dadata_enabled = next((s for s in settings if s['key'] == 'dadata_enabled'), None)
            
            if dadata_enabled:
                print(f"OK Текущее состояние: {dadata_enabled['value']} (тип: {type(dadata_enabled['value'])})")
                current_state = dadata_enabled['value']
            else:
                print("ERROR Настройка dadata_enabled не найдена")
                return False
        else:
            print(f"ERROR Ошибка получения настроек: {response.status_code}")
            return False
    except Exception as e:
        print(f"ERROR Ошибка при получении настроек: {e}")
        return False
    
    # 3. Переключаем состояние
    print(f"\n3. Переключение автодополнения на {not current_state}...")
    try:
        update_data = {
            "value": not current_state
        }
        response = requests.put(f"{BASE_URL}/admin/settings/dadata_enabled", json=update_data, headers=admin_headers, timeout=10)
        if response.status_code == 200:
            result = response.json()
            print(f"OK Автодополнение переключено: {result['value']} (тип: {type(result['value'])})")
        else:
            print(f"ERROR Ошибка переключения автодополнения: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при переключении автодополнения: {e}")
        return False
    
    # 4. Проверяем результат
    print("\n4. Проверка результата...")
    try:
        response = requests.get(f"{BASE_URL}/admin/settings", headers=admin_headers, timeout=10)
        if response.status_code == 200:
            settings = response.json()
            dadata_enabled = next((s for s in settings if s['key'] == 'dadata_enabled'), None)
            
            if dadata_enabled:
                print(f"OK Новое состояние: {dadata_enabled['value']} (тип: {type(dadata_enabled['value'])})")
                if dadata_enabled['value'] == (not current_state):
                    print("OK Переключение работает корректно!")
                else:
                    print("ERROR Переключение не сработало")
            else:
                print("ERROR Настройка dadata_enabled не найдена")
                
        else:
            print(f"ERROR Ошибка проверки настроек: {response.status_code}")
            return False
    except Exception as e:
        print(f"ERROR Ошибка при проверке настроек: {e}")
        return False
    
    return True

if __name__ == "__main__":
    test_dadata_toggle()
