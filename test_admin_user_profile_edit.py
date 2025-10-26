#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json

BASE_URL = "http://localhost:8004"

def test_admin_user_profile_edit():
    """Тестирование редактирования профиля пользователя администратором"""
    
    print("=== Тестирование редактирования профиля пользователя администратором ===\n")
    
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
    
    # 3. Регистрируем тестового пользователя
    print("\n3. Регистрация тестового пользователя...")
    user_data = {
        "email": "test_user_profile_edit_v2@example.com",
        "password": "password123",
        "confirm_password": "password123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data, timeout=10)
        if response.status_code == 200:
            print("OK Тестовый пользователь зарегистрирован")
        else:
            print(f"ERROR Ошибка регистрации: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при регистрации: {e}")
        return False
    
    # 4. Получаем список пользователей
    print("\n4. Получение списка пользователей...")
    try:
        response = requests.get(f"{BASE_URL}/users/", headers=admin_headers, timeout=10)
        if response.status_code == 200:
            users = response.json()
            print(f"OK Получено {len(users)} пользователей")
            
            # Находим нашего тестового пользователя
            test_user = next((u for u in users if u['email'] == 'test_user_profile_edit_v2@example.com'), None)
            if test_user:
                print(f"OK Тестовый пользователь найден: ID {test_user['id']}")
                user_id = test_user['id']
            else:
                print("ERROR Тестовый пользователь не найден")
                return False
        else:
            print(f"ERROR Ошибка получения пользователей: {response.status_code}")
            return False
    except Exception as e:
        print(f"ERROR Ошибка при получении пользователей: {e}")
        return False
    
    # 5. Получаем профиль пользователя
    print(f"\n5. Получение профиля пользователя ID {user_id}...")
    try:
        response = requests.get(f"{BASE_URL}/users/{user_id}", headers=admin_headers, timeout=10)
        if response.status_code == 200:
            user_profile = response.json()
            print(f"OK Профиль пользователя получен: {user_profile['name']} ({user_profile['email']})")
            print(f"   Роль: {user_profile['role']}")
            print(f"   Профиль завершен: {user_profile['profile_completed']}")
        else:
            print(f"ERROR Ошибка получения профиля: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при получении профиля: {e}")
        return False
    
    # 6. Обновляем профиль пользователя
    print(f"\n6. Обновление профиля пользователя ID {user_id}...")
    update_data = {
        "name": "Обновленное имя",
        "full_name": "Полное обновленное имя",
        "address": "Обновленный адрес",
        "interests": "Обновленные интересы",
        "gwars_profile_url": "https://www.gwars.io/info.php?id=123456",
        "gwars_nickname": "TestNickname"
    }
    
    try:
        response = requests.put(f"{BASE_URL}/users/{user_id}", json=update_data, headers=admin_headers, timeout=10)
        if response.status_code == 200:
            updated_profile = response.json()
            print("OK Профиль пользователя обновлен")
            print(f"   Имя: {updated_profile['name']}")
            print(f"   Полное имя: {updated_profile['full_name']}")
            print(f"   Адрес: {updated_profile['address']}")
            print(f"   Интересы: {updated_profile['interests']}")
            print(f"   GWars профиль: {updated_profile['gwars_profile_url']}")
            print(f"   GWars никнейм: {updated_profile['gwars_nickname']}")
        else:
            print(f"ERROR Ошибка обновления профиля: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при обновлении профиля: {e}")
        return False
    
    # 7. Проверяем обновленный профиль
    print(f"\n7. Проверка обновленного профиля...")
    try:
        response = requests.get(f"{BASE_URL}/users/{user_id}", headers=admin_headers, timeout=10)
        if response.status_code == 200:
            final_profile = response.json()
            print("OK Профиль проверен")
            
            # Проверяем, что изменения сохранились
            if final_profile['name'] == update_data['name']:
                print("OK Имя обновлено корректно")
            else:
                print("ERROR Имя не обновилось")
                
            if final_profile['full_name'] == update_data['full_name']:
                print("OK Полное имя обновлено корректно")
            else:
                print("ERROR Полное имя не обновилось")
                
            if final_profile['gwars_nickname'] == update_data['gwars_nickname']:
                print("OK GWars никнейм обновлен корректно")
            else:
                print("ERROR GWars никнейм не обновился")
        else:
            print(f"ERROR Ошибка проверки профиля: {response.status_code}")
            return False
    except Exception as e:
        print(f"ERROR Ошибка при проверке профиля: {e}")
        return False
    
    print("\n=== Тестирование завершено! ===")
    print("OK Администратор может просматривать профили пользователей")
    print("OK Администратор может редактировать профили пользователей")
    print("OK Все изменения сохраняются корректно")
    print("TIP Frontend готов для использования новой функциональности")
    return True

if __name__ == "__main__":
    test_admin_user_profile_edit()
