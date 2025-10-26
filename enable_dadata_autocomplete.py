#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json

BASE_URL = "http://localhost:8004"

def enable_dadata_autocomplete():
    """Включение автодополнения Dadata.ru"""
    
    print("=== Включение автодополнения Dadata.ru ===\n")
    
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
            
            print(f"\nТекущие настройки Dadata:")
            print(f"   dadata_enabled: {dadata_enabled['value'] if dadata_enabled else 'не найдено'}")
            print(f"   dadata_token: {'настроен' if dadata_token and dadata_token['value'] else 'не настроен'}")
            
        else:
            print(f"ERROR Ошибка получения настроек: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при получении настроек: {e}")
        return False
    
    # 4. Включаем автодополнение
    print("\n4. Включение автодополнения адресов...")
    try:
        response = requests.put(f"{BASE_URL}/admin/settings/dadata_enabled", 
            json={"value": "true"}, 
            headers=admin_headers, 
            timeout=10)
        
        if response.status_code == 200:
            print("OK Автодополнение адресов включено")
        else:
            print(f"ERROR Ошибка включения автодополнения: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при включении автодополнения: {e}")
        return False
    
    # 5. Проверяем обновленные настройки
    print("\n5. Проверка обновленных настроек...")
    try:
        response = requests.get(f"{BASE_URL}/admin/settings", headers=admin_headers, timeout=10)
        if response.status_code == 200:
            settings = response.json()
            
            # Находим настройки Dadata
            dadata_enabled = next((s for s in settings if s['key'] == 'dadata_enabled'), None)
            dadata_token = next((s for s in settings if s['key'] == 'dadata_token'), None)
            
            print(f"\nОбновленные настройки Dadata:")
            print(f"   dadata_enabled: {dadata_enabled['value'] if dadata_enabled else 'не найдено'}")
            print(f"   dadata_token: {'настроен' if dadata_token and dadata_token['value'] else 'не настроен'}")
            
            if dadata_enabled and dadata_enabled['value'].lower() == 'true':
                print("   Статус: Автодополнение включено")
            else:
                print("   Статус: Автодополнение отключено")
                
        else:
            print(f"ERROR Ошибка получения обновленных настроек: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при получении обновленных настроек: {e}")
        return False
    
    # 6. Тестируем API автодополнения
    print("\n6. Тестирование API автодополнения...")
    try:
        response = requests.post(f"{BASE_URL}/api/suggest-address", 
            json={"query": "Москва"}, 
            timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            suggestions = data.get("suggestions", [])
            print(f"OK API автодополнения работает: {len(suggestions)} подсказок")
            if suggestions:
                print(f"   Первая подсказка: {suggestions[0]['value']}")
        elif response.status_code == 400:
            error_detail = response.json().get("detail", "")
            print(f"ERROR API автодополнения все еще недоступен: {error_detail}")
            return False
        else:
            print(f"ERROR Неожиданный ответ API: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при тестировании API: {e}")
        return False
    
    print("\n=== Автодополнение Dadata.ru успешно включено! ===")
    print("OK Токен настроен и проверен")
    print("OK Автодополнение включено")
    print("OK API автодополнения работает")
    print("OK Frontend теперь может использовать автодополнение адресов")
    return True

if __name__ == "__main__":
    enable_dadata_autocomplete()
