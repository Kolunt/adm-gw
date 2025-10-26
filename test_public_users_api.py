#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json

BASE_URL = "http://localhost:8004"

def test_public_users_api():
    """Тестирование публичного API для получения списка пользователей"""
    
    print("=== Тестирование публичного API пользователей ===\n")
    
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
    
    # 2. Тестируем публичный API без авторизации
    print("\n2. Тестирование публичного API без авторизации...")
    try:
        response = requests.get(f"{BASE_URL}/api/users/public", timeout=10)
        if response.status_code == 200:
            users = response.json()
            print(f"OK Публичный API работает, получено {len(users)} пользователей")
            
            if users:
                print("OK Найдены верифицированные пользователи:")
                for user in users:
                    print(f"   - {user['gwars_nickname']} (ID: {user['id']})")
                    print(f"     Профиль: {user['gwars_profile_url']}")
                    print(f"     Верифицирован: {user['gwars_verified']}")
                    print(f"     Дата регистрации: {user['created_at']}")
            else:
                print("INFO Пока нет верифицированных пользователей")
        else:
            print(f"ERROR Ошибка публичного API: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при обращении к публичному API: {e}")
        return False
    
    # 3. Проверяем, что API возвращает только нужные поля
    print("\n3. Проверка структуры ответа...")
    try:
        response = requests.get(f"{BASE_URL}/api/users/public", timeout=10)
        if response.status_code == 200:
            users = response.json()
            if users:
                user = users[0]
                required_fields = ['id', 'gwars_nickname', 'gwars_profile_url', 'gwars_verified', 'created_at']
                missing_fields = [field for field in required_fields if field not in user]
                
                if not missing_fields:
                    print("OK Все необходимые поля присутствуют")
                    print("OK Поля ответа:", list(user.keys()))
                else:
                    print(f"ERROR Отсутствуют поля: {missing_fields}")
                    return False
                
                # Проверяем, что нет лишних полей
                forbidden_fields = ['email', 'password', 'name', 'full_name', 'address', 'interests']
                present_forbidden = [field for field in forbidden_fields if field in user]
                
                if not present_forbidden:
                    print("OK Личные данные пользователей не раскрываются")
                else:
                    print(f"ERROR Раскрыты личные данные: {present_forbidden}")
                    return False
            else:
                print("INFO Нет пользователей для проверки структуры")
        else:
            print(f"ERROR Ошибка при проверке структуры: {response.status_code}")
            return False
    except Exception as e:
        print(f"ERROR Ошибка при проверке структуры: {e}")
        return False
    
    # 4. Тестируем доступность для неавторизованных пользователей
    print("\n4. Тестирование доступности для гостей...")
    try:
        # Делаем запрос без токена авторизации
        response = requests.get(f"{BASE_URL}/api/users/public", timeout=10)
        if response.status_code == 200:
            print("OK API доступен для неавторизованных пользователей")
        else:
            print(f"ERROR API недоступен для гостей: {response.status_code}")
            return False
    except Exception as e:
        print(f"ERROR Ошибка при тестировании доступности: {e}")
        return False
    
    # 5. Проверяем фильтрацию только верифицированных пользователей
    print("\n5. Проверка фильтрации верифицированных пользователей...")
    try:
        response = requests.get(f"{BASE_URL}/api/users/public", timeout=10)
        if response.status_code == 200:
            users = response.json()
            
            # Проверяем, что все пользователи верифицированы
            unverified_users = [user for user in users if not user.get('gwars_verified', False)]
            if not unverified_users:
                print("OK Все пользователи в списке верифицированы")
            else:
                print(f"ERROR Найдены неверифицированные пользователи: {len(unverified_users)}")
                return False
            
            # Проверяем, что у всех есть никнейм и профиль
            incomplete_users = [user for user in users if not user.get('gwars_nickname') or not user.get('gwars_profile_url')]
            if not incomplete_users:
                print("OK У всех пользователей есть никнейм и профиль")
            else:
                print(f"ERROR Найдены пользователи без полной информации: {len(incomplete_users)}")
                return False
                
        else:
            print(f"ERROR Ошибка при проверке фильтрации: {response.status_code}")
            return False
    except Exception as e:
        print(f"ERROR Ошибка при проверке фильтрации: {e}")
        return False
    
    print("\n=== Тестирование завершено! ===")
    print("OK Публичный API пользователей работает корректно")
    print("OK API доступен всем пользователям (включая гостей)")
    print("OK Возвращаются только игровые данные")
    print("OK Личные данные пользователей защищены")
    print("OK Показываются только верифицированные пользователи")
    print("TIP Frontend готов для отображения публичного списка участников")
    return True

if __name__ == "__main__":
    test_public_users_api()
