#!/usr/bin/env python3
"""
Скрипт для создания тестовых данных:
- 20 пользователей с полными профилями
- Мероприятие в статусе "регистрация закрыта"
- Регистрация всех пользователей в мероприятии
"""

import sqlite3
import hashlib
import secrets
from datetime import datetime, timedelta

def hash_password(password):
    """Хеширование пароля"""
    return hashlib.sha256(password.encode()).hexdigest()

def create_test_users():
    """Создание 20 тестовых пользователей"""
    conn = sqlite3.connect('backend/adm.db')
    cursor = conn.cursor()
    
    # Список имен для тестовых пользователей
    names = [
        "Александр Петров", "Мария Иванова", "Дмитрий Сидоров", "Елена Козлова", "Сергей Волков",
        "Анна Морозова", "Игорь Лебедев", "Ольга Новикова", "Андрей Соколов", "Татьяна Попова",
        "Михаил Федоров", "Наталья Медведева", "Владимир Орлов", "Светлана Семенова", "Николай Голубев",
        "Ирина Виноградова", "Павел Романов", "Людмила Кузнецова", "Алексей Степанов", "Екатерина Николаева"
    ]
    
    # Список адресов
    addresses = [
        "ул. Ленина, д. 1, кв. 1", "пр. Мира, д. 5, кв. 12", "ул. Пушкина, д. 10, кв. 3",
        "ул. Гагарина, д. 15, кв. 7", "пр. Победы, д. 20, кв. 25", "ул. Советская, д. 8, кв. 14",
        "ул. Центральная, д. 12, кв. 6", "пр. Ленина, д. 30, кв. 18", "ул. Мира, д. 25, кв. 9",
        "ул. Парковая, д. 7, кв. 22", "пр. Гагарина, д. 18, кв. 11", "ул. Школьная, д. 3, кв. 5",
        "ул. Садовая, д. 14, кв. 16", "пр. Строителей, д. 22, кв. 8", "ул. Молодежная, д. 9, кв. 13",
        "ул. Заводская, д. 16, кв. 20", "пр. Комсомольский, д. 11, кв. 4", "ул. Рабочая, д. 6, кв. 17",
        "ул. Новая, д. 19, кв. 10", "пр. Юбилейный, д. 13, кв. 21"
    ]
    
    # Список интересов
    interests_list = [
        "Книги", "Фильмы", "Музыка", "Спорт", "Путешествия", "Кулинария", "Фотография", 
        "Рисование", "Программирование", "Игры", "Танцы", "Театр", "Природа", "Животные"
    ]
    
    created_users = []
    
    for i, name in enumerate(names):
        email = f"user{i+1}@example.com"
        password_hash = hash_password("password123")
        gwars_nickname = f"Player_{i+1}"
        verification_token = secrets.token_urlsafe(20)
        
        # Выбираем случайные интересы (2-4 штуки)
        import random
        user_interests = random.sample(interests_list, random.randint(2, 4))
        interests_str = ", ".join(user_interests)
        
        cursor.execute("""
            INSERT INTO users (email, password_hash, name, full_name, address, 
                             gwars_nickname, verification_token, is_verified, 
                             interests, phone_number, telegram_nickname, role)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            email, password_hash, name, name, addresses[i],
            gwars_nickname, verification_token, True,  # Все пользователи верифицированы
            interests_str, f"+7-900-{100+i:03d}-{1000+i:04d}", f"@user{i+1}", "user"
        ))
        
        user_id = cursor.lastrowid
        created_users.append(user_id)
        print(f"Создан пользователь: {name} ({email}) - ID: {user_id}")
    
    conn.commit()
    conn.close()
    return created_users

def create_closed_event():
    """Создание мероприятия в статусе 'регистрация закрыта'"""
    conn = sqlite3.connect('backend/adm.db')
    cursor = conn.cursor()
    
    # Даты для мероприятия (регистрация уже закрыта)
    now = datetime.now()
    prereg_start = now - timedelta(days=30)  # Предварительная регистрация началась 30 дней назад
    reg_start = now - timedelta(days=15)      # Основная регистрация началась 15 дней назад
    reg_end = now - timedelta(days=1)        # Регистрация закончилась вчера
    
    cursor.execute("""
        INSERT INTO events (name, description, preregistration_start, 
                          registration_start, registration_end, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        "Анонимный Дед Мороз 2024",
        "Ежегодное мероприятие обмена подарками между участниками сообщества",
        prereg_start.isoformat(),
        reg_start.isoformat(), 
        reg_end.isoformat(),
        datetime.now().isoformat()
    ))
    
    event_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    print(f"Создано мероприятие: 'Анонимный Дед Мороз 2024' - ID: {event_id}")
    print(f"Статус: Регистрация закрыта (закончилась {reg_end.strftime('%d.%m.%Y %H:%M')})")
    return event_id

def register_users_in_event(user_ids, event_id):
    """Регистрация всех пользователей в мероприятии"""
    conn = sqlite3.connect('backend/adm.db')
    cursor = conn.cursor()
    
    for user_id in user_ids:
        cursor.execute("""
            INSERT INTO event_registrations (event_id, user_id, is_confirmed, 
                                           registration_date, confirmation_date)
            VALUES (?, ?, ?, ?, ?)
        """, (
            event_id, user_id, True,  # Все пользователи подтверждены
            datetime.now().isoformat(),
            datetime.now().isoformat()
        ))
        print(f"Пользователь ID {user_id} зарегистрирован в мероприятии ID {event_id}")
    
    conn.commit()
    conn.close()

def main():
    print("Создание тестовых данных для системы 'Анонимный Дед Мороз'")
    print("=" * 60)
    
    # Создаем пользователей
    print("\n1. Создание 20 тестовых пользователей...")
    user_ids = create_test_users()
    
    # Создаем мероприятие
    print("\n2. Создание мероприятия в статусе 'регистрация закрыта'...")
    event_id = create_closed_event()
    
    # Регистрируем пользователей
    print("\n3. Регистрация всех пользователей в мероприятии...")
    register_users_in_event(user_ids, event_id)
    
    print("\n" + "=" * 60)
    print("Тестовые данные успешно созданы!")
    print(f"Статистика:")
    print(f"   - Пользователей: {len(user_ids)}")
    print(f"   - Мероприятие ID: {event_id}")
    print(f"   - Статус: Регистрация закрыта")
    print(f"   - Участников: {len(user_ids)}")
    print("\nТеперь можно тестировать систему назначения подарков!")

if __name__ == "__main__":
    main()
