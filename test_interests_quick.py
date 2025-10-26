#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
import time

BASE_URL = "http://127.0.0.1:8004"

def test_interests_quick():
    """Быстрый тест системы интересов"""
    print("=== Быстрый тест системы интересов ===")
    
    # Проверяем доступность backend
    try:
        response = requests.get(f"{BASE_URL}/docs", timeout=5)
        if response.status_code == 200:
            print("OK Backend доступен")
        else:
            print(f"ERROR Backend недоступен: {response.status_code}")
            return
    except Exception as e:
        print(f"ERROR Backend недоступен: {e}")
        return
    
    # Тест поиска интересов (публичный эндпоинт)
    print("\n1. Тест поиска интересов...")
    try:
        response = requests.get(f"{BASE_URL}/api/interests/search?query=тест")
        if response.status_code == 200:
            results = response.json()
            print(f"OK Поиск работает. Найдено: {len(results)} результатов")
        else:
            print(f"ERROR Ошибка поиска: {response.status_code}")
    except Exception as e:
        print(f"ERROR Ошибка поиска: {e}")
    
    # Тест получения популярных интересов
    print("\n2. Тест популярных интересов...")
    try:
        response = requests.get(f"{BASE_URL}/api/interests/popular")
        if response.status_code == 200:
            interests = response.json()
            print(f"OK Популярные интересы получены: {len(interests)} штук")
        else:
            print(f"ERROR Ошибка получения популярных интересов: {response.status_code}")
    except Exception as e:
        print(f"ERROR Ошибка получения популярных интересов: {e}")
    
    print("\n=== Тест завершен ===")

if __name__ == "__main__":
    test_interests_quick()
