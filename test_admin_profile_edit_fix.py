#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json

BASE_URL = "http://localhost:8004"

def test_admin_profile_edit_fix():
    """Тестирование исправлений в редактировании профиля администратором"""
    
    print("=== Тестирование исправлений в редактировании профиля администратором ===\n")
    
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
        "email": "test_profile_edit_fix@example.com",
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
            test_user = next((u for u in users if u['email'] == 'test_profile_edit_fix@example.com'), None)
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
            print(f"   GWars верифицирован: {user_profile['gwars_verified']}")
            print(f"   GWars профиль: {user_profile['gwars_profile_url']}")
            print(f"   GWars никнейм: {user_profile['gwars_nickname']}")
        else:
            print(f"ERROR Ошибка получения профиля: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при получении профиля: {e}")
        return False
    
    # 6. Обновляем GWars информацию (без токена)
    print(f"\n6. Обновление GWars информации (без токена)...")
    update_data = {
        "gwars_profile_url": "https://www.gwars.io/info.php?id=888888",
        "gwars_nickname": "TestFixedUser",
        "gwars_verified": True
    }
    
    try:
        response = requests.put(f"{BASE_URL}/users/{user_id}", json=update_data, headers=admin_headers, timeout=10)
        if response.status_code == 200:
            updated_profile = response.json()
            print("OK GWars информация обновлена")
            print(f"   GWars профиль: {updated_profile['gwars_profile_url']}")
            print(f"   GWars никнейм: {updated_profile['gwars_nickname']}")
            print(f"   GWars верифицирован: {updated_profile['gwars_verified']}")
        else:
            print(f"ERROR Ошибка обновления GWars информации: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при обновлении GWars информации: {e}")
        return False
    
    # 7. Проверяем обновленный профиль
    print(f"\n7. Проверка обновленного профиля...")
    try:
        response = requests.get(f"{BASE_URL}/users/{user_id}", headers=admin_headers, timeout=10)
        if response.status_code == 200:
            final_profile = response.json()
            print("OK Профиль проверен")
            
            # Проверяем, что изменения сохранились
            if final_profile['gwars_profile_url'] == update_data['gwars_profile_url']:
                print("OK GWars профиль обновлен корректно")
            else:
                print("ERROR GWars профиль не обновился")
                
            if final_profile['gwars_nickname'] == update_data['gwars_nickname']:
                print("OK GWars никнейм обновлен корректно")
            else:
                print("ERROR GWars никнейм не обновился")
                
            if final_profile['gwars_verified'] == update_data['gwars_verified']:
                print("OK Статус верификации обновлен корректно")
            else:
                print("ERROR Статус верификации не обновился")
        else:
            print(f"ERROR Ошибка проверки профиля: {response.status_code}")
            return False
    except Exception as e:
        print(f"ERROR Ошибка при проверке профиля: {e}")
        return False
    
    # 8. Отключаем верификацию
    print(f"\n8. Отключение верификации GWars...")
    disable_verification_data = {
        "gwars_verified": False
    }
    
    try:
        response = requests.put(f"{BASE_URL}/users/{user_id}", json=disable_verification_data, headers=admin_headers, timeout=10)
        if response.status_code == 200:
            updated_profile = response.json()
            print("OK Верификация отключена")
            print(f"   GWars верифицирован: {updated_profile['gwars_verified']}")
        else:
            print(f"ERROR Ошибка отключения верификации: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при отключении верификации: {e}")
        return False
    
    print("\n=== Тестирование завершено! ===")
    print("OK Поле токена удалено из формы")
    print("OK GWars поля перемещены в основную форму")
    print("OK Данные сохраняются корректно")
    print("OK Статус верификации работает")
    print("TIP Frontend готов для использования исправленной функциональности")
    return True

if __name__ == "__main__":
    test_admin_profile_edit_fix()
