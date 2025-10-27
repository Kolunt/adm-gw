#!/usr/bin/env python3
"""
Скрипт для тестирования системы назначения подарков
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8006"

def login_as_admin():
    """Вход в систему как администратор"""
    login_data = {
        "email": "admin@example.com",
        "password": "admin"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code == 200:
        token = response.json()["access_token"]
        print("Успешный вход как администратор")
        return token
    else:
        print(f"Ошибка входа: {response.status_code} - {response.text}")
        return None

def test_gift_assignments(token):
    """Тестирование системы назначения подарков"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n=== ТЕСТИРОВАНИЕ СИСТЕМЫ НАЗНАЧЕНИЯ ПОДАРКОВ ===")
    
    # 1. Проверяем текущие назначения (должно быть пусто)
    print("\n1. Проверка текущих назначений...")
    response = requests.get(f"{BASE_URL}/admin/events/1/gift-assignments", headers=headers)
    if response.status_code == 200:
        assignments = response.json()
        print(f"   Текущих назначений: {len(assignments)}")
    else:
        print(f"   Ошибка получения назначений: {response.status_code}")
        return
    
    # 2. Генерируем назначения
    print("\n2. Генерация назначений подарков...")
    response = requests.post(f"{BASE_URL}/admin/events/1/gift-assignments/generate", headers=headers)
    if response.status_code == 200:
        assignments = response.json()
        print(f"   Сгенерировано назначений: {len(assignments)}")
        
        # Показываем несколько примеров
        print("\n   Примеры назначений:")
        for i, assignment in enumerate(assignments[:3]):
            print(f"   {i+1}. {assignment['giver_name']} -> {assignment['receiver_name']}")
    else:
        print(f"   Ошибка генерации: {response.status_code} - {response.text}")
        return
    
    # 3. Получаем все назначения
    print("\n3. Получение всех назначений...")
    response = requests.get(f"{BASE_URL}/admin/events/1/gift-assignments", headers=headers)
    if response.status_code == 200:
        assignments = response.json()
        print(f"   Всего назначений: {len(assignments)}")
        
        # Статистика
        approved = sum(1 for a in assignments if a['is_approved'])
        pending = len(assignments) - approved
        print(f"   Утверждено: {approved}")
        print(f"   Ожидает утверждения: {pending}")
    else:
        print(f"   Ошибка получения назначений: {response.status_code}")
        return
    
    # 4. Утверждаем все назначения
    print("\n4. Утверждение всех назначений...")
    response = requests.post(f"{BASE_URL}/admin/events/1/gift-assignments/approve-all", headers=headers)
    if response.status_code == 200:
        result = response.json()
        print(f"   Утверждено назначений: {result.get('approved_count', 0)}")
    else:
        print(f"   Ошибка утверждения: {response.status_code} - {response.text}")
        return
    
    # 5. Проверяем финальное состояние
    print("\n5. Проверка финального состояния...")
    response = requests.get(f"{BASE_URL}/admin/events/1/gift-assignments", headers=headers)
    if response.status_code == 200:
        assignments = response.json()
        approved = sum(1 for a in assignments if a['is_approved'])
        print(f"   Всего назначений: {len(assignments)}")
        print(f"   Утверждено: {approved}")
        
        # Показываем несколько примеров утвержденных назначений
        print("\n   Примеры утвержденных назначений:")
        approved_assignments = [a for a in assignments if a['is_approved']]
        for i, assignment in enumerate(approved_assignments[:3]):
            print(f"   {i+1}. {assignment['giver_name']} -> {assignment['receiver_name']}")
            print(f"      Получатель: {assignment['receiver_address']}")
    else:
        print(f"   Ошибка получения назначений: {response.status_code}")

def test_user_gift_assignments():
    """Тестирование просмотра назначений пользователем"""
    print("\n=== ТЕСТИРОВАНИЕ ПРОСМОТРА НАЗНАЧЕНИЙ ПОЛЬЗОВАТЕЛЕМ ===")
    
    # Входим как обычный пользователь
    login_data = {
        "email": "user1@example.com",
        "password": "password123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code == 200:
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        print("Успешный вход как пользователь user1@example.com")
        
        # Получаем назначения пользователя
        response = requests.get(f"{BASE_URL}/user/gift-assignments", headers=headers)
        if response.status_code == 200:
            assignments = response.json()
            print(f"   Назначений для пользователя: {len(assignments)}")
            
            for assignment in assignments:
                if assignment['assignment_type'] == 'giver':
                    print(f"   Дарить: {assignment['receiver_name']} ({assignment['receiver_address']})")
                elif assignment['assignment_type'] == 'receiver':
                    print(f"   Получать от: {assignment['giver_name']}")
        else:
            print(f"   Ошибка получения назначений: {response.status_code}")
    else:
        print(f"Ошибка входа пользователя: {response.status_code}")

def main():
    print("ТЕСТИРОВАНИЕ СИСТЕМЫ НАЗНАЧЕНИЯ ПОДАРКОВ")
    print("=" * 60)
    
    # Входим как администратор
    token = login_as_admin()
    if not token:
        return
    
    # Тестируем систему назначения подарков
    test_gift_assignments(token)
    
    # Тестируем просмотр назначений пользователем
    test_user_gift_assignments()
    
    print("\n" + "=" * 60)
    print("ТЕСТИРОВАНИЕ ЗАВЕРШЕНО!")

if __name__ == "__main__":
    main()
