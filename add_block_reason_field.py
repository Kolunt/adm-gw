#!/usr/bin/env python3
"""
Скрипт для добавления поля block_reason в таблицу users
"""

import sqlite3
import os

def add_block_reason_field():
    """Добавляет поле block_reason в таблицу users"""
    
    # Путь к базе данных
    db_path = "backend/santa.db"
    
    if not os.path.exists(db_path):
        print(f"База данных {db_path} не найдена!")
        return False
    
    try:
        # Подключаемся к базе данных
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Проверяем, существует ли уже поле block_reason
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'block_reason' in columns:
            print("Поле block_reason уже существует в таблице users")
            return True
        
        # Добавляем поле block_reason
        cursor.execute("ALTER TABLE users ADD COLUMN block_reason TEXT")
        
        # Сохраняем изменения
        conn.commit()
        
        print("Поле block_reason успешно добавлено в таблицу users")
        return True
        
    except Exception as e:
        print(f"Ошибка при добавлении поля block_reason: {e}")
        return False
        
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    add_block_reason_field()
