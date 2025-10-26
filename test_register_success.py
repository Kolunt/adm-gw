import requests
import time

email = f'test{int(time.time())}@example.com'
data = {'email': email, 'password': 'password123', 'confirm_password': 'password123'}
response = requests.post('http://localhost:8004/auth/register', json=data)
print(f'Status: {response.status_code}')
if response.status_code == 200:
    print('Success!')
    user_data = response.json()
    print(f'ID: {user_data["id"]}, Email: {user_data["email"]}, Profile: {user_data["profile_completed"]}')
else:
    print(f'Error: {response.text}')
