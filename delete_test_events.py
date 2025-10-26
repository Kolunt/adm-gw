#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json

BASE_URL = "http://localhost:8004"

def delete_test_events():
    """Удаление тестовых мероприятий"""
    
    print("=== Удаление тестовых мероприятий ===\n")
    
    # Входим как админ
    admin_login_data = {
        "email": "admin@example.com",
        "password": "admin"
    }
    
    admin_response = requests.post(f"{BASE_URL}/auth/login", json=admin_login_data)
    if admin_response.status_code != 200:
        print(f"ERROR Не удалось войти как админ: {admin_response.status_code}")
        return
    
    admin_token = admin_response.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Получаем список мероприятий
    events_response = requests.get(f"{BASE_URL}/events/", headers=admin_headers)
    if events_response.status_code == 200:
        events = events_response.json()
        print(f"Найдено мероприятий: {len(events)}")
        
        for event in events:
            print(f"Удаляем мероприятие: {event['name']} (ID: {event['id']})")
            delete_response = requests.delete(f"{BASE_URL}/events/{event['id']}", headers=admin_headers)
            if delete_response.status_code == 200:
                print(f"  OK Удалено")
            else:
                print(f"  ERROR Ошибка удаления: {delete_response.status_code}")
    else:
        print(f"ERROR Ошибка получения мероприятий: {events_response.status_code}")

if __name__ == "__main__":
    delete_test_events()
