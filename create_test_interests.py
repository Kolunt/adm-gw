#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json

BASE_URL = "http://127.0.0.1:8004"

def create_test_interests():
    """Создание тестовых интересов"""
    print("=== Создание тестовых интересов ===")
    
    # Регистрация тестового пользователя
    print("1. Регистрация тестового пользователя...")
    register_data = {
        "email": "test_interests_user@example.com",
        "password": "testpass123",
        "confirm_password": "testpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        if response.status_code == 200:
            print("OK Пользователь зарегистрирован")
        else:
            print(f"ERROR Ошибка регистрации: {response.status_code}")
            return
    except Exception as e:
        print(f"ERROR Ошибка регистрации: {e}")
        return
    
    # Вход в систему
    print("\n2. Вход в систему...")
    login_data = {
        "email": "test_interests_user@example.com",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            token = response.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            print("OK Вход выполнен")
        else:
            print(f"ERROR Ошибка входа: {response.status_code}")
            return
    except Exception as e:
        print(f"ERROR Ошибка входа: {e}")
        return
    
    # Создание тестовых интересов
    test_interests = [
        "программирование",
        "спорт",
        "музыка",
        "чтение",
        "путешествия",
        "кулинария",
        "фотография",
        "рисование"
    ]
    
    print(f"\n3. Создание {len(test_interests)} тестовых интересов...")
    created_count = 0
    
    for interest_name in test_interests:
        try:
            interest_data = {"name": interest_name}
            response = requests.post(f"{BASE_URL}/api/interests/create", json=interest_data, headers=headers)
            if response.status_code == 200:
                interest = response.json()
                print(f"OK Создан интерес: {interest['name']} (ID: {interest['id']})")
                created_count += 1
            else:
                print(f"ERROR Ошибка создания интереса '{interest_name}': {response.status_code}")
        except Exception as e:
            print(f"ERROR Ошибка создания интереса '{interest_name}': {e}")
    
    print(f"\n=== Создано интересов: {created_count} из {len(test_interests)} ===")
    
    # Тест поиска
    print("\n4. Тест поиска интересов...")
    try:
        response = requests.get(f"{BASE_URL}/api/interests/search?query=прог")
        if response.status_code == 200:
            results = response.json()
            print(f"OK Поиск 'прог' нашел: {len(results)} результатов")
            for result in results:
                print(f"  - {result['name']}")
        else:
            print(f"ERROR Ошибка поиска: {response.status_code}")
    except Exception as e:
        print(f"ERROR Ошибка поиска: {e}")
    
    # Тест популярных интересов
    print("\n5. Тест популярных интересов...")
    try:
        response = requests.get(f"{BASE_URL}/api/interests/popular")
        if response.status_code == 200:
            interests = response.json()
            print(f"OK Популярные интересы: {len(interests)} штук")
            for interest in interests[:5]:
                print(f"  - {interest['name']}")
        else:
            print(f"ERROR Ошибка получения популярных интересов: {response.status_code}")
    except Exception as e:
        print(f"ERROR Ошибка получения популярных интересов: {e}")

if __name__ == "__main__":
    create_test_interests()
