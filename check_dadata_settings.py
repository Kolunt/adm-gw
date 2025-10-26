#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json

BASE_URL = "http://localhost:8004"

def check_dadata_settings():
    """Проверка настроек Dadata"""
    
    print("=== Проверка настроек Dadata ===\n")
    
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
    
    # 3. Получаем текущие настройки
    print("\n3. Получение текущих настроек...")
    try:
        response = requests.get(f"{BASE_URL}/admin/settings", headers=admin_headers, timeout=10)
        if response.status_code == 200:
            settings = response.json()
            print(f"OK Настройки получены: {len(settings)} настроек")
            
            # Ищем настройки Dadata
            dadata_enabled = next((s for s in settings if s['key'] == 'dadata_enabled'), None)
            dadata_token = next((s for s in settings if s['key'] == 'dadata_token'), None)
            
            print(f"\nТекущие настройки Dadata:")
            print(f"   dadata_enabled: {dadata_enabled['value'] if dadata_enabled else 'не найдено'}")
            print(f"   dadata_token: {'настроен' if dadata_token and dadata_token['value'] else 'не настроен'}")
            
            if dadata_enabled:
                print(f"   Тип dadata_enabled: {type(dadata_enabled['value'])}")
                print(f"   Значение dadata_enabled: {repr(dadata_enabled['value'])}")
            
            return dadata_enabled, dadata_token
            
        else:
            print(f"ERROR Ошибка получения настроек: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при получении настроек: {e}")
        return False

def enable_dadata_autocomplete():
    """Включение автодополнения Dadata"""
    
    print("\n=== Включение автодополнения Dadata ===\n")
    
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
    
    # 2. Включаем автодополнение
    print("\n2. Включение автодополнения...")
    try:
        update_data = {
            "value": True
        }
        response = requests.put(f"{BASE_URL}/admin/settings/dadata_enabled", json=update_data, headers=admin_headers, timeout=10)
        if response.status_code == 200:
            print("OK Автодополнение включено")
        else:
            print(f"ERROR Ошибка включения автодополнения: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при включении автодополнения: {e}")
        return False
    
    # 3. Проверяем результат
    print("\n3. Проверка результата...")
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
            return False
    except Exception as e:
        print(f"ERROR Ошибка при проверке настроек: {e}")
        return False
    
    return True

if __name__ == "__main__":
    # Проверяем текущие настройки
    result = check_dadata_settings()
    
    if result:
        dadata_enabled, dadata_token = result
        
        # Если автодополнение отключено, пытаемся включить
        if dadata_enabled and not dadata_enabled['value']:
            print("\nАвтодополнение отключено. Пытаемся включить...")
            enable_dadata_autocomplete()
        elif dadata_enabled and dadata_enabled['value']:
            print("\nАвтодополнение уже включено!")
        else:
            print("\nНастройка dadata_enabled не найдена!")
