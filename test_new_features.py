#!/usr/bin/env python3
"""
Тест новой функциональности регистрации и профиля
"""
import requests
import json

def test_registration():
    """Тест регистрации с подтверждением пароля"""
    print("=== Тест регистрации ===")
    
    data = {
        'email': 'test@example.com',
        'password': 'password123',
        'confirm_password': 'password123'
    }
    
    response = requests.post('http://localhost:8003/auth/register', json=data)
    print(f'Статус регистрации: {response.status_code}')
    
    if response.status_code == 200:
        print('Регистрация успешна!')
        user_data = response.json()
        print(f'ID пользователя: {user_data["id"]}')
        print(f'Email: {user_data["email"]}')
        print(f'Профиль заполнен: {user_data["profile_completed"]}')
        return user_data
    else:
        print(f'Ошибка: {response.text}')
        return None

def test_login():
    """Тест входа"""
    print("\n=== Тест входа ===")
    
    data = {
        'email': 'test@example.com',
        'password': 'password123'
    }
    
    response = requests.post('http://localhost:8003/auth/login', json=data)
    print(f'Статус входа: {response.status_code}')
    
    if response.status_code == 200:
        print('Вход успешен!')
        token_data = response.json()
        print(f'Токен получен: {token_data["access_token"][:20]}...')
        return token_data["access_token"]
    else:
        print(f'Ошибка: {response.text}')
        return None

def test_profile_status(token):
    """Тест статуса профиля"""
    print("\n=== Тест статуса профиля ===")
    
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get('http://localhost:8003/profile/status', headers=headers)
    print(f'Статус профиля: {response.status_code}')
    
    if response.status_code == 200:
        print('Статус профиля получен!')
        status = response.json()
        print(f'Профиль заполнен: {status["profile_completed"]}')
        print(f'Следующий шаг: {status["next_step"]}')
        return status
    else:
        print(f'Ошибка: {response.text}')
        return None

def test_profile_steps(token):
    """Тест пошагового заполнения профиля"""
    print("\n=== Тест заполнения профиля ===")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # Шаг 1: GWars профиль
    print("Шаг 1: GWars профиль")
    step1_data = {'gwars_profile_url': 'https://www.gwars.io/info.php?id=12345'}
    response = requests.post('http://localhost:8003/profile/step1', json=step1_data, headers=headers)
    print(f'Статус шага 1: {response.status_code}')
    if response.status_code == 200:
        print('Шаг 1 завершен!')
    
    # Шаг 2: Личные данные
    print("Шаг 2: Личные данные")
    step2_data = {
        'full_name': 'Иванов Иван Иванович',
        'address': 'г. Москва, ул. Примерная, д. 1, кв. 1'
    }
    response = requests.post('http://localhost:8003/profile/step2', json=step2_data, headers=headers)
    print(f'Статус шага 2: {response.status_code}')
    if response.status_code == 200:
        print('Шаг 2 завершен!')
    
    # Шаг 3: Интересы
    print("Шаг 3: Интересы")
    step3_data = {'interests': 'Люблю читать фантастику, коллекционирую марки, увлекаюсь программированием'}
    response = requests.post('http://localhost:8003/profile/step3', json=step3_data, headers=headers)
    print(f'Статус шага 3: {response.status_code}')
    if response.status_code == 200:
        print('Шаг 3 завершен!')
        print('Профиль полностью заполнен!')

if __name__ == "__main__":
    print("Тестирование новой функциональности регистрации и профиля")
    
    # Тест регистрации
    user = test_registration()
    if not user:
        exit(1)
    
    # Тест входа
    token = test_login()
    if not token:
        exit(1)
    
    # Тест статуса профиля
    status = test_profile_status(token)
    if not status:
        exit(1)
    
    # Тест заполнения профиля
    test_profile_steps(token)
    
    print("\nВсе тесты завершены!")
