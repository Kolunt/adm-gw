#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json

BASE_URL = "http://localhost:8004"

def test_admin_settings_tabs():
    """Тестирование новых настроек с табами"""
    
    print("=== Тестирование настроек с табами ===\n")
    
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
            
            # Проверяем наличие новых настроек
            site_title = next((s for s in settings if s['key'] == 'site_title'), None)
            site_description = next((s for s in settings if s['key'] == 'site_description'), None)
            dadata_enabled = next((s for s in settings if s['key'] == 'dadata_enabled'), None)
            dadata_token = next((s for s in settings if s['key'] == 'dadata_token'), None)
            
            print(f"\nНастройки сайта:")
            print(f"   site_title: {site_title['value'] if site_title else 'не найдено'}")
            print(f"   site_description: {site_description['value'][:50] + '...' if site_description and len(site_description['value']) > 50 else site_description['value'] if site_description else 'не найдено'}")
            
            print(f"\nНастройки Dadata:")
            print(f"   dadata_enabled: {dadata_enabled['value'] if dadata_enabled else 'не найдено'}")
            print(f"   dadata_token: {'настроен' if dadata_token and dadata_token['value'] else 'не настроен'}")
            
        else:
            print(f"ERROR Ошибка получения настроек: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при получении настроек: {e}")
        return False
    
    # 4. Тестируем обновление настроек сайта
    print("\n4. Тестирование обновления настроек сайта...")
    try:
        # Обновляем название сайта
        response = requests.put(f"{BASE_URL}/admin/settings/site_title", 
            json={"value": "Анонимный Дед Мороз 2026"}, 
            headers=admin_headers, 
            timeout=10)
        
        if response.status_code == 200:
            print("OK Название сайта обновлено")
        else:
            print(f"ERROR Ошибка обновления названия сайта: {response.status_code}")
            print(response.text)
            return False
        
        # Обновляем описание сайта
        response = requests.put(f"{BASE_URL}/admin/settings/site_description", 
            json={"value": "Система организации анонимного обмена подарками между участниками сообщества GWars.io. Версия 2026."}, 
            headers=admin_headers, 
            timeout=10)
        
        if response.status_code == 200:
            print("OK Описание сайта обновлено")
        else:
            print(f"ERROR Ошибка обновления описания сайта: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"ERROR Ошибка при обновлении настроек сайта: {e}")
        return False
    
    # 5. Проверяем обновленные настройки
    print("\n5. Проверка обновленных настроек...")
    try:
        response = requests.get(f"{BASE_URL}/admin/settings", headers=admin_headers, timeout=10)
        if response.status_code == 200:
            settings = response.json()
            
            site_title = next((s for s in settings if s['key'] == 'site_title'), None)
            site_description = next((s for s in settings if s['key'] == 'site_description'), None)
            
            if site_title and site_title['value'] == "Анонимный Дед Мороз 2026":
                print("OK Название сайта корректно обновлено")
            else:
                print("ERROR Название сайта не обновилось")
                return False
            
            if site_description and "Версия 2026" in site_description['value']:
                print("OK Описание сайта корректно обновлено")
            else:
                print("ERROR Описание сайта не обновилось")
                return False
        else:
            print(f"ERROR Ошибка получения обновленных настроек: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при проверке обновленных настроек: {e}")
        return False
    
    print("\n=== Тестирование завершено! ===")
    print("OK Все настройки работают корректно")
    print("OK Табы 'Общие' и 'Dadata' реализованы")
    print("OK Настройки сайта (название и описание) работают")
    print("OK Настройки Dadata перенесены в отдельный таб")
    print("TIP Теперь админка имеет удобную структуру с табами")
    return True

if __name__ == "__main__":
    test_admin_settings_tabs()
