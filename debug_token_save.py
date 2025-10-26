#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json

BASE_URL = "http://localhost:8004"

def debug_token_save_issue():
    """Отладка проблемы с сохранением токена"""
    
    print("=== Отладка проблемы с сохранением токена ===\n")
    
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
            print(f"   dadata_token: {'настроен (' + str(len(dadata_token['value'])) + ' символов)' if dadata_token and dadata_token['value'] else 'не настроен'}")
            if dadata_token and dadata_token['value']:
                print(f"   Первые 10 символов токена: {dadata_token['value'][:10]}...")
            
        else:
            print(f"ERROR Ошибка получения настроек: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при получении настроек: {e}")
        return False
    
    # 4. Тестируем сохранение токена
    print("\n4. Тестирование сохранения токена...")
    test_token = "test_token_debug_12345"
    try:
        response = requests.put(f"{BASE_URL}/admin/settings/dadata_token", 
            json={"value": test_token}, 
            headers=admin_headers, 
            timeout=10)
        
        if response.status_code == 200:
            print("OK Токен сохранен успешно")
        else:
            print(f"ERROR Ошибка сохранения токена: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при сохранении токена: {e}")
        return False
    
    # 5. Проверяем сохранение
    print("\n5. Проверка сохранения токена...")
    try:
        response = requests.get(f"{BASE_URL}/admin/settings", headers=admin_headers, timeout=10)
        if response.status_code == 200:
            settings = response.json()
            
            # Находим настройки Dadata
            dadata_token = next((s for s in settings if s['key'] == 'dadata_token'), None)
            
            if dadata_token and dadata_token['value'] == test_token:
                print("OK Токен корректно сохранен и загружен")
                print(f"   Сохраненный токен: {dadata_token['value']}")
            else:
                print("ERROR Токен не сохранился или загрузился неправильно")
                print(f"   Ожидаемый токен: {test_token}")
                print(f"   Полученный токен: {dadata_token['value'] if dadata_token else 'None'}")
                return False
        else:
            print(f"ERROR Ошибка получения настроек после сохранения: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при проверке сохранения: {e}")
        return False
    
    # 6. Тестируем обновление страницы (симуляция)
    print("\n6. Симуляция обновления страницы...")
    try:
        # Делаем новый запрос как будто обновили страницу
        response = requests.get(f"{BASE_URL}/admin/settings", headers=admin_headers, timeout=10)
        if response.status_code == 200:
            settings = response.json()
            
            # Находим настройки Dadata
            dadata_token = next((s for s in settings if s['key'] == 'dadata_token'), None)
            
            if dadata_token and dadata_token['value'] == test_token:
                print("OK Токен сохраняется после 'обновления страницы'")
                print(f"   Токен после обновления: {dadata_token['value']}")
            else:
                print("ERROR Токен исчез после 'обновления страницы'")
                print(f"   Ожидаемый токен: {test_token}")
                print(f"   Полученный токен: {dadata_token['value'] if dadata_token else 'None'}")
                return False
        else:
            print(f"ERROR Ошибка получения настроек после обновления: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при симуляции обновления: {e}")
        return False
    
    print("\n=== Отладка завершена! ===")
    print("OK Токен корректно сохраняется в базе данных")
    print("OK Токен корректно загружается из базы данных")
    print("OK Проблема может быть в frontend компоненте")
    print("TIP Проверьте AdminSystemSettings.js - возможно проблема в fetchSettings")
    return True

if __name__ == "__main__":
    debug_token_save_issue()
