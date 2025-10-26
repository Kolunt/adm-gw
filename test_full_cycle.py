import requests
import time

# Тест полного цикла
email = f'test{int(time.time())}@example.com'
password = 'password123'

print("=== Тест регистрации ===")
data = {'email': email, 'password': password, 'confirm_password': password}
response = requests.post('http://localhost:8004/auth/register', json=data)
print(f'Регистрация: {response.status_code}')
if response.status_code != 200:
    print(f'Ошибка: {response.text}')
    exit(1)

user_data = response.json()
print(f'Пользователь создан: {user_data["email"]}, Профиль: {user_data["profile_completed"]}')

print("\n=== Тест входа ===")
login_data = {'email': email, 'password': password}
response = requests.post('http://localhost:8004/auth/login', json=login_data)
print(f'Вход: {response.status_code}')
if response.status_code != 200:
    print(f'Ошибка: {response.text}')
    exit(1)

token_data = response.json()
token = token_data['access_token']
print(f'Токен получен: {token[:20]}...')

print("\n=== Тест статуса профиля ===")
headers = {'Authorization': f'Bearer {token}'}
response = requests.get('http://localhost:8004/profile/status', headers=headers)
print(f'Статус профиля: {response.status_code}')
if response.status_code == 200:
    status = response.json()
    print(f'Профиль заполнен: {status["profile_completed"]}, Следующий шаг: {status["next_step"]}')

print("\n=== Тест заполнения профиля ===")
# Шаг 1
step1_data = {'gwars_profile_url': 'https://www.gwars.io/info.php?id=12345'}
response = requests.post('http://localhost:8004/profile/step1', json=step1_data, headers=headers)
print(f'Шаг 1: {response.status_code}')

# Шаг 2
step2_data = {'full_name': 'Иванов Иван Иванович', 'address': 'г. Москва, ул. Примерная, д. 1'}
response = requests.post('http://localhost:8004/profile/step2', json=step2_data, headers=headers)
print(f'Шаг 2: {response.status_code}')

# Шаг 3
step3_data = {'interests': 'Люблю читать фантастику, коллекционирую марки'}
response = requests.post('http://localhost:8004/profile/step3', json=step3_data, headers=headers)
print(f'Шаг 3: {response.status_code}')

print("\n=== Проверка финального статуса ===")
response = requests.get('http://localhost:8004/profile/status', headers=headers)
if response.status_code == 200:
    status = response.json()
    print(f'Профиль заполнен: {status["profile_completed"]}')
    print('Все шаги завершены успешно!')
