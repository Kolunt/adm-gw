#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json

BASE_URL = "http://localhost:8004"

def test_token_display_fix():
    """Тестирование исправления отображения токена"""
    
    print("=== Тестирование исправления отображения токена ===\n")
    
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
                print(f"   Последние 10 символов токена: ...{dadata_token['value'][-10:]}")
            
        else:
            print(f"ERROR Ошибка получения настроек: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при получении настроек: {e}")
        return False
    
    # 4. Проверяем, что токен есть в базе данных
    print("\n4. Проверка наличия токена в базе данных...")
    if dadata_token and dadata_token['value']:
        print("OK Токен найден в базе данных")
        print(f"   Длина токена: {len(dadata_token['value'])} символов")
        print(f"   Токен начинается с: {dadata_token['value'][:10]}...")
        print(f"   Токен заканчивается на: ...{dadata_token['value'][-10:]}")
        
        # Проверяем, что токен валидный (не пустой и не только пробелы)
        if dadata_token['value'].strip():
            print("OK Токен не пустой и содержит данные")
        else:
            print("ERROR Токен пустой или содержит только пробелы")
            return False
    else:
        print("ERROR Токен не найден в базе данных")
        return False
    
    print("\n=== Тестирование завершено! ===")
    print("OK Токен корректно сохранен в базе данных")
    print("OK Токен корректно загружается из базы данных")
    print("TIP Теперь frontend должен отображать токен в поле ввода")
    print("TIP Проверьте в браузере - поле токена должно показывать сохраненное значение")
    return True

if __name__ == "__main__":
    test_token_display_fix()
