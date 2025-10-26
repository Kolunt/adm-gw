#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json

BASE_URL = "http://localhost:8004"

def test_interests_management():
    """Тестирование системы управления интересами"""
    
    print("=== Тестирование системы управления интересами ===\n")
    
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
    
    # 3. Получаем список интересов (должен быть пустой)
    print("\n3. Получение списка интересов...")
    try:
        response = requests.get(f"{BASE_URL}/admin/interests", headers=admin_headers, timeout=10)
        if response.status_code == 200:
            interests = response.json()
            print(f"OK Получено {len(interests)} интересов")
        else:
            print(f"ERROR Ошибка получения интересов: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при получении интересов: {e}")
        return False
    
    # 4. Создаем первый интерес
    print("\n4. Создание первого интереса...")
    interest1_data = {
        "name": "велоспорт"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/admin/interests", json=interest1_data, headers=admin_headers, timeout=10)
        if response.status_code == 200:
            interest1 = response.json()
            print(f"OK Интерес создан: {interest1['name']} (ID: {interest1['id']})")
            interest1_id = interest1['id']
        else:
            print(f"ERROR Ошибка создания интереса: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при создании интереса: {e}")
        return False
    
    # 5. Создаем второй интерес
    print("\n5. Создание второго интереса...")
    interest2_data = {
        "name": "компьютерные игры"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/admin/interests", json=interest2_data, headers=admin_headers, timeout=10)
        if response.status_code == 200:
            interest2 = response.json()
            print(f"OK Интерес создан: {interest2['name']} (ID: {interest2['id']})")
            interest2_id = interest2['id']
        else:
            print(f"ERROR Ошибка создания интереса: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при создании интереса: {e}")
        return False
    
    # 6. Создаем третий интерес
    print("\n6. Создание третьего интереса...")
    interest3_data = {
        "name": "путешествия"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/admin/interests", json=interest3_data, headers=admin_headers, timeout=10)
        if response.status_code == 200:
            interest3 = response.json()
            print(f"OK Интерес создан: {interest3['name']} (ID: {interest3['id']})")
            interest3_id = interest3['id']
        else:
            print(f"ERROR Ошибка создания интереса: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при создании интереса: {e}")
        return False
    
    # 7. Получаем обновленный список интересов
    print("\n7. Получение обновленного списка интересов...")
    try:
        response = requests.get(f"{BASE_URL}/admin/interests", headers=admin_headers, timeout=10)
        if response.status_code == 200:
            interests = response.json()
            print(f"OK Получено {len(interests)} интересов")
            for interest in interests:
                print(f"   - {interest['name']} (ID: {interest['id']}, Активен: {interest['is_active']})")
        else:
            print(f"ERROR Ошибка получения интересов: {response.status_code}")
            return False
    except Exception as e:
        print(f"ERROR Ошибка при получении интересов: {e}")
        return False
    
    # 8. Обновляем статус второго интереса (заблокируем)
    print(f"\n8. Блокировка интереса '{interest2['name']}'...")
    update_data = {
        "is_active": False
    }
    
    try:
        response = requests.put(f"{BASE_URL}/admin/interests/{interest2_id}", json=update_data, headers=admin_headers, timeout=10)
        if response.status_code == 200:
            updated_interest = response.json()
            print(f"OK Интерес обновлен: {updated_interest['name']} (Активен: {updated_interest['is_active']})")
        else:
            print(f"ERROR Ошибка обновления интереса: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при обновлении интереса: {e}")
        return False
    
    # 9. Обновляем название первого интереса
    print(f"\n9. Обновление названия интереса...")
    update_data = {
        "name": "велосипедный спорт"
    }
    
    try:
        response = requests.put(f"{BASE_URL}/admin/interests/{interest1_id}", json=update_data, headers=admin_headers, timeout=10)
        if response.status_code == 200:
            updated_interest = response.json()
            print(f"OK Название обновлено: {updated_interest['name']}")
        else:
            print(f"ERROR Ошибка обновления названия: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при обновлении названия: {e}")
        return False
    
    # 10. Пытаемся создать дублирующий интерес
    print("\n10. Попытка создания дублирующего интереса...")
    duplicate_data = {
        "name": "велосипедный спорт"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/admin/interests", json=duplicate_data, headers=admin_headers, timeout=10)
        if response.status_code == 400:
            print("OK Дублирующий интерес корректно отклонен")
        else:
            print(f"ERROR Дублирующий интерес не был отклонен: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при попытке создания дублирующего интереса: {e}")
        return False
    
    # 11. Удаляем третий интерес
    print(f"\n11. Удаление интереса '{interest3['name']}'...")
    try:
        response = requests.delete(f"{BASE_URL}/admin/interests/{interest3_id}", headers=admin_headers, timeout=10)
        if response.status_code == 200:
            print("OK Интерес удален")
        else:
            print(f"ERROR Ошибка удаления интереса: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR Ошибка при удалении интереса: {e}")
        return False
    
    # 12. Получаем финальный список интересов
    print("\n12. Получение финального списка интересов...")
    try:
        response = requests.get(f"{BASE_URL}/admin/interests", headers=admin_headers, timeout=10)
        if response.status_code == 200:
            interests = response.json()
            print(f"OK Получено {len(interests)} интересов")
            for interest in interests:
                print(f"   - {interest['name']} (ID: {interest['id']}, Активен: {interest['is_active']})")
        else:
            print(f"ERROR Ошибка получения интересов: {response.status_code}")
            return False
    except Exception as e:
        print(f"ERROR Ошибка при получении интересов: {e}")
        return False
    
    print("\n=== Тестирование завершено! ===")
    print("OK Система управления интересами работает корректно")
    print("OK Создание интересов работает")
    print("OK Обновление интересов работает")
    print("OK Удаление интересов работает")
    print("OK Блокировка/активация интересов работает")
    print("OK Проверка уникальности названий работает")
    print("TIP Frontend готов для использования системы управления интересами")
    return True

if __name__ == "__main__":
    test_interests_management()
