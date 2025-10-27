#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для принудительного пересоздания базы данных
"""
import os
import sqlite3
from pathlib import Path

def reset_database():
    """Удаляет старую базу данных и создает новую"""
    
    # Путь к базе данных
    db_path = "santa.db"
    
    # Удаляем старую базу данных если она существует
    if os.path.exists(db_path):
        print(f"Удаляем старую базу данных: {db_path}")
        os.remove(db_path)
        print("База данных удалена")
    else:
        print("База данных не найдена")
    
    # Проверяем что база действительно удалена
    if not os.path.exists(db_path):
        print("База данных успешно удалена")
    else:
        print("Ошибка: база данных не удалена")
        return False
    
    print("Теперь запустите backend для создания новой базы данных")
    return True

if __name__ == "__main__":
    print("Сброс базы данных Анонимный Дед Мороз")
    print("=" * 50)
    
    if reset_database():
        print("\nГотово! Теперь запустите:")
        print("   .\\start_backend_8006.bat")
    else:
        print("\nОшибка при сбросе базы данных")
