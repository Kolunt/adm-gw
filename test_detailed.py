import requests

try:
    email = 'newtest@example.com'
    data = {'email': email, 'password': 'password123', 'confirm_password': 'password123'}
    response = requests.post('http://localhost:8003/auth/register', json=data)
    print(f'Status: {response.status_code}')
    print(f'Headers: {response.headers}')
    print(f'Text: {response.text}')
    if response.status_code == 200:
        print('Success!')
        print(response.json())
except Exception as e:
    print(f'Exception: {e}')
