#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8004"

def check_event_times():
    """Проверка времени мероприятия"""
    
    print("=== Проверка времени мероприятия ===\n")
    
    response = requests.get(f"{BASE_URL}/events/current")
    if response.status_code == 200:
        event = response.json()
        print(f"Мероприятие: {event['name']}")
        print(f"Предварительная регистрация: {event['preregistration_start']}")
        print(f"Основная регистрация: {event['registration_start']}")
        print(f"Окончание: {event['registration_end']}")
        
        now = datetime.now()
        prereg_start = datetime.fromisoformat(event['preregistration_start'].replace('Z', '+00:00'))
        reg_start = datetime.fromisoformat(event['registration_start'].replace('Z', '+00:00'))
        reg_end = datetime.fromisoformat(event['registration_end'].replace('Z', '+00:00'))
        
        print(f"\nТекущее время: {now}")
        print(f"Предварительная регистрация началась: {prereg_start}")
        print(f"Основная регистрация начнется: {reg_start}")
        print(f"Регистрация закончится: {reg_end}")
        
        if now < prereg_start:
            print("Статус: Ожидание предварительной регистрации")
        elif now < reg_start:
            print("Статус: Предварительная регистрация")
        elif now < reg_end:
            print("Статус: Основная регистрация")
        else:
            print("Статус: Регистрация закрыта")
            
    else:
        print(f"ERROR Нет активного мероприятия: {response.status_code}")

if __name__ == "__main__":
    check_event_times()
