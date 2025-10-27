#!/usr/bin/env python3
"""
Скрипт для пересоздания базы данных с правильной схемой
"""
import os
import sqlite3
from sqlalchemy import create_engine
from main import Base, engine

def reset_database():
    """Удаляет старую базу данных и создает новую с правильной схемой"""
    
    # Удаляем старую базу данных
    db_path = "santa.db"
    if os.path.exists(db_path):
        os.remove(db_path)
        print("✅ Старая база данных удалена")
    
    # Создаем новую базу данных с правильной схемой
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Новая база данных создана с правильной схемой")
        
        # Создаем дефолтного администратора
        from sqlalchemy.orm import sessionmaker
        from main import User, get_password_hash
        
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Проверяем, есть ли уже администратор
        existing_admin = db.query(User).filter(User.username == "admin").first()
        if not existing_admin:
            admin_user = User(
                username="admin",
                email="admin@example.com",
                hashed_password=get_password_hash("admin123"),
                name="Администратор",
                wishlist="Управление системой Анонимный Дед Мороз",
                role="admin"
            )
            db.add(admin_user)
            db.commit()
            print("✅ Создан дефолтный администратор: admin@example.com / admin123")
        else:
            print("ℹ️ Администратор уже существует")
            
        db.close()
        
    except Exception as e:
        print(f"❌ Ошибка при создании базы данных: {e}")

if __name__ == "__main__":
    reset_database()
