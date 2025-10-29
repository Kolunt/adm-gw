#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Тестовый скрипт для создания события с текущими датами
"""
import requests
import json
from datetime import datetime, timedelta

def create_current_event():
    """Создает событие с текущими датами"""
    
    # Текущая дата
    now = datetime.utcnow()
    
    # Данные для создания события
    event_data = {
        "name": "Анонимный Дед Мороз 2024",
        "description": "Ежегодное мероприятие обмена подарками",
        "preregistration_start": (now - timedelta(days=1)).isoformat(),
        "registration_start": now.isoformat(), 
        "registration_end": (now + timedelta(days=30)).isoformat()
    }
    
    # Сначала получим токен
    login_data = {
        "email": "admin@example.com",
        "password": "admin123"
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
    print(f"Данные события: {event_data}")
    
    event_response = requests.post("http://127.0.0.1:8006/events/", json=event_data, headers=headers)
    
    if event_response.status_code == 200:
        print("Событие создано успешно!")
        print(event_response.json())
    else:
        print(f"Ошибка создания события: {event_response.status_code}")
        print(event_response.text)

if __name__ == "__main__":
    print("Создание текущего события")
    print("=" * 30)
    create_current_event()
    print("Готово!")

