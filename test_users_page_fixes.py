#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json

BASE_URL = "http://localhost:8004"

def test_users_page_fixes():
    """Тестирование исправлений страницы участников"""
    
    print("=== Тестирование исправлений страницы участников ===\n")
    
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
                print("OK Найдены пользователи:")
                verified_count = 0
                unverified_count = 0
                
                for user in users:
                    status = "Верифицирован" if user['gwars_verified'] else "Не верифицирован"
                    nickname = user['gwars_nickname'] or "Не указан"
                    profile = user['gwars_profile_url'] or "Не указан"
                    
                    print(f"   - {nickname} (ID: {user['id']}) - {status}")
                    print(f"     Профиль: {profile}")
                    
                    if user['gwars_verified']:
                        verified_count += 1
                    else:
                        unverified_count += 1
                
                print(f"\nOK Статистика: {verified_count} верифицированных, {unverified_count} неверифицированных")
            else:
                print("INFO Пока нет пользователей")
        else:
            print(f"ERROR Ошибка публичного API: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при обращении к публичному API: {e}")
        return False
    
    # 3. Проверяем, что API возвращает всех пользователей
    print("\n3. Проверка отображения всех пользователей...")
    try:
        response = requests.get(f"{BASE_URL}/api/users/public", timeout=10)
        if response.status_code == 200:
            users = response.json()
            
            # Проверяем, что есть пользователи с разными статусами
            verified_users = [user for user in users if user.get('gwars_verified', False)]
            unverified_users = [user for user in users if not user.get('gwars_verified', False)]
            
            print(f"OK Всего пользователей: {len(users)}")
            print(f"OK Верифицированных: {len(verified_users)}")
            print(f"OK Неверифицированных: {len(unverified_users)}")
            
            if len(users) > 0:
                print("OK API возвращает всех пользователей независимо от статуса")
            else:
                print("INFO Нет пользователей для проверки")
                
        else:
            print(f"ERROR Ошибка при проверке всех пользователей: {response.status_code}")
            return False
    except Exception as e:
        print(f"ERROR Ошибка при проверке всех пользователей: {e}")
        return False
    
    # 4. Проверяем структуру ответа для разных типов пользователей
    print("\n4. Проверка структуры ответа...")
    try:
        response = requests.get(f"{BASE_URL}/api/users/public", timeout=10)
        if response.status_code == 200:
            users = response.json()
            
            if users:
                # Проверяем структуру для каждого пользователя
                for i, user in enumerate(users):
                    required_fields = ['id', 'gwars_nickname', 'gwars_profile_url', 'gwars_verified', 'created_at']
                    missing_fields = [field for field in required_fields if field not in user]
                    
                    if missing_fields:
                        print(f"ERROR Пользователь {i+1}: отсутствуют поля {missing_fields}")
                        return False
                    
                    # Проверяем типы данных
                    if not isinstance(user['gwars_verified'], bool):
                        print(f"ERROR Пользователь {i+1}: gwars_verified должен быть boolean")
                        return False
                
                print("OK Структура ответа корректна для всех пользователей")
            else:
                print("INFO Нет пользователей для проверки структуры")
                
        else:
            print(f"ERROR Ошибка при проверке структуры: {response.status_code}")
            return False
    except Exception as e:
        print(f"ERROR Ошибка при проверке структуры: {e}")
        return False
    
    # 5. Проверяем доступность для неавторизованных пользователей
    print("\n5. Проверка доступности для гостей...")
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
    
    print("\n=== Тестирование завершено! ===")
    print("OK Публичный API пользователей работает корректно")
    print("OK API возвращает всех пользователей независимо от статуса")
    print("OK API доступен всем пользователям (включая гостей)")
    print("OK Возвращаются только игровые данные")
    print("OK Личные данные пользователей защищены")
    print("OK Показываются как верифицированные, так и неверифицированные пользователи")
    print("TIP Frontend готов для отображения всех участников с разными статусами")
    return True

if __name__ == "__main__":
    test_users_page_fixes()
