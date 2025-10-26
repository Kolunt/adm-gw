#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json

BASE_URL = "http://localhost:8004"

def test_admin_login():
    """Тестирование входа админа"""
    
    print("=== Тестирование входа админа ===\n")
    
    # Попробуем разные варианты входа админа
    admin_variants = [
        {"email": "admin", "password": "admin"},
        {"email": "admin@admin.com", "password": "admin"},
        {"username": "admin", "password": "admin"}
    ]
    
    for i, login_data in enumerate(admin_variants, 1):
        print(f"{i}. Попытка входа: {login_data}")
        
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"   Статус: {response.status_code}")
        
        if response.status_code == 200:
            print("   OK Вход успешен!")
            token_data = response.json()
            print(f"   Токен: {token_data['access_token'][:20]}...")
            return token_data["access_token"]
        else:
            print(f"   ERROR: {response.text}")
    
    print("\nВсе попытки входа админа неудачны")
    return None

if __name__ == "__main__":
    test_admin_login()
