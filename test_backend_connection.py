#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json

BASE_URL = "http://localhost:8004"

def test_backend_connection():
    """Тестирование подключения к backend"""
    
    print("=== Тестирование подключения к backend ===\n")
    
    # 1. Проверка доступности backend
    print("1. Проверка доступности backend...")
    try:
        response = requests.get(f"{BASE_URL}/docs")
        print(f"   Статус: {response.status_code}")
        if response.status_code == 200:
            print("OK Backend доступен")
        else:
            print(f"ERROR Backend недоступен: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("ERROR Не удается подключиться к backend")
        return False
    
    # 2. Проверка CORS заголовков
    print("\n2. Проверка CORS заголовков...")
    try:
        response = requests.options(f"{BASE_URL}/auth/register", 
                                  headers={"Origin": "http://localhost:3000"})
        print(f"   Статус: {response.status_code}")
        cors_headers = {
            "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
            "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
            "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers")
        }
        print(f"   CORS заголовки: {cors_headers}")
        
        if cors_headers["Access-Control-Allow-Origin"] == "*":
            print("OK CORS настроен корректно")
        else:
            print("WARNING CORS может быть настроен неправильно")
    except Exception as e:
        print(f"ERROR Ошибка проверки CORS: {e}")
    
    # 3. Тест регистрации
    print("\n3. Тест регистрации...")
    register_data = {
        "email": "test_cors@example.com",
        "password": "testpass123",
        "confirm_password": "testpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        print(f"   Статус: {response.status_code}")
        if response.status_code == 200:
            print("OK Регистрация работает")
        else:
            print(f"ERROR Ошибка регистрации: {response.text}")
    except Exception as e:
        print(f"ERROR Ошибка при регистрации: {e}")
    
    return True

if __name__ == "__main__":
    test_backend_connection()
