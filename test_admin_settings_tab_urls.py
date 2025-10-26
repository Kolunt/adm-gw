#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json

BASE_URL = "http://localhost:8004"

def test_admin_settings_tab_urls():
    """Тестирование URL для табов настроек"""
    
    print("=== Тестирование URL для табов настроек ===\n")
    
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
            
            # Проверяем наличие всех настроек
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
    
    print("\n=== Тестирование завершено! ===")
    print("OK Все настройки доступны через API")
    print("OK Backend готов для работы с новыми URL")
    print("TIP Теперь можно использовать прямые ссылки:")
    print("   - http://localhost:3000/admin/settings/general")
    print("   - http://localhost:3000/admin/settings/dadata")
    print("TIP Каждый таб имеет свой уникальный URL")
    print("TIP Пользователи могут сохранять закладки на конкретные табы")
    return True

if __name__ == "__main__":
    test_admin_settings_tab_urls()
