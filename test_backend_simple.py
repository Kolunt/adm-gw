import requests

def test_backend():
    print("=== Тест backend ===")
    
    try:
        # Тест получения мероприятий
        response = requests.get('http://localhost:8004/events/')
        print(f"Статус получения мероприятий: {response.status_code}")
        
        if response.status_code == 200:
            events = response.json()
            print(f"Найдено мероприятий: {len(events)}")
            return True
        else:
            print(f"Ошибка: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("Ошибка подключения к backend. Проверьте, что сервер запущен на порту 8004")
        return False
    except Exception as e:
        print(f"Ошибка: {e}")
        return False

if __name__ == "__main__":
    success = test_backend()
    if success:
        print("Backend работает!")
    else:
        print("Backend не работает!")
