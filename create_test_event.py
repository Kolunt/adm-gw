#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Тестовый скрипт для создания события
"""
import requests
import json
from datetime import datetime

def create_test_event():
    """Создает тестовое событие"""
    
    # Данные для создания события
    event_data = {
        "name": "Тестовое событие 2025",
        "description": "Описание тестового события",
        "preregistration_start": "2025-01-01T00:00:00",
        "registration_start": "2025-01-15T00:00:00", 
        "registration_end": "2025-02-01T00:00:00"
    }
    
    # Сначала получим токен
    login_data = {
        "email": "admin@example.com",
        "password": "admin"
    }
    
    print("Получение токена...")
    login_response = requests.post("http://127.0.0.1:8006/auth/login", json=login_data)
    
    if login_response.status_code != 200:
        print(f"Ошибка авторизации: {login_response.status_code}")
        print(login_response.text)
        return
    
    token = login_response.json()["access_token"]
    print("Токен получен")
    
    # Создаем событие
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print("Создание события...")
    event_response = requests.post("http://127.0.0.1:8006/events/", json=event_data, headers=headers)
    
    if event_response.status_code == 200:
        print("Событие создано успешно!")
        print(event_response.json())
    else:
        print(f"Ошибка создания события: {event_response.status_code}")
        print(event_response.text)

if __name__ == "__main__":
    print("Создание тестового события")
    print("=" * 30)
    create_test_event()
    print("Готово!")

