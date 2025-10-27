#!/usr/bin/env python3
"""
Скрипт для копирования тестовых данных из adm.db в santa.db
"""

import sqlite3
import hashlib
from datetime import datetime, timedelta

def copy_test_data():
    """Копирование тестовых данных из adm.db в santa.db"""
    
    # Подключаемся к обеим базам
    adm_conn = sqlite3.connect('backend/adm.db')
    santa_conn = sqlite3.connect('backend/santa.db')
    
    adm_cursor = adm_conn.cursor()
    santa_cursor = santa_conn.cursor()
    
    print("Копирование тестовых данных из adm.db в santa.db...")
    
    # 1. Копируем пользователей
    print("\n1. Копирование пользователей...")
    adm_cursor.execute('SELECT * FROM users WHERE email LIKE "user%@example.com"')
    users = adm_cursor.fetchall()
    
    for user in users:
        # Проверяем, есть ли уже такой пользователь
        santa_cursor.execute('SELECT id FROM users WHERE email = ?', (user[2],))
        if not santa_cursor.fetchone():
            santa_cursor.execute('''
                INSERT INTO users (id, email, password_hash, name, full_name, address, 
                                 gwars_nickname, verification_token, is_verified, 
                                 interests, phone_number, telegram_nickname, role, avatar_url, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', user)
            print(f"   Скопирован пользователь: {user[3]}")
    
    # 2. Копируем мероприятие
    print("\n2. Копирование мероприятия...")
    adm_cursor.execute('SELECT * FROM events WHERE id = 1')
    event = adm_cursor.fetchone()
    
    if event:
        # Проверяем, есть ли уже такое мероприятие
        santa_cursor.execute('SELECT id FROM events WHERE name = ?', (event[1],))
        if not santa_cursor.fetchone():
            santa_cursor.execute('''
                INSERT INTO events (id, name, description, preregistration_start, 
                                  registration_start, registration_end, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', event)
            print(f"   Скопировано мероприятие: {event[1]}")
    
    # 3. Копируем регистрации
    print("\n3. Копирование регистраций...")
    adm_cursor.execute('SELECT * FROM event_registrations WHERE event_id = 1')
    registrations = adm_cursor.fetchall()
    
    for reg in registrations:
        # Проверяем, есть ли уже такая регистрация
        santa_cursor.execute('SELECT id FROM event_registrations WHERE event_id = ? AND user_id = ?', 
                           (reg[1], reg[2]))
        if not santa_cursor.fetchone():
            santa_cursor.execute('''
                INSERT INTO event_registrations (id, event_id, user_id, is_confirmed, 
                                               registration_date, confirmation_date)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', reg)
            print(f"   Скопирована регистрация: пользователь {reg[2]} в мероприятие {reg[1]}")
    
    # Сохраняем изменения
    santa_conn.commit()
    
    # Проверяем результат
    print("\n=== ПРОВЕРКА РЕЗУЛЬТАТА ===")
    santa_cursor.execute('SELECT COUNT(*) FROM users WHERE email LIKE "user%@example.com"')
    user_count = santa_cursor.fetchone()[0]
    print(f"Пользователей в santa.db: {user_count}")
    
    santa_cursor.execute('SELECT COUNT(*) FROM event_registrations WHERE event_id = 2')
    reg_count = santa_cursor.fetchone()[0]
    print(f"Регистраций в мероприятии 2: {reg_count}")
    
    santa_cursor.execute('''
        SELECT COUNT(*) FROM event_registrations er 
        JOIN users u ON er.user_id = u.id 
        WHERE er.event_id = 2 AND er.is_confirmed = 1
    ''')
    confirmed_count = santa_cursor.fetchone()[0]
    print(f"Подтвержденных участников: {confirmed_count}")
    
    adm_conn.close()
    santa_conn.close()
    
    print("\nКопирование завершено!")

if __name__ == "__main__":
    copy_test_data()
