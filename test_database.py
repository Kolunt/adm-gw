#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Тестовый скрипт для проверки базы данных
"""
import sys
import os
sys.path.append('backend')

from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./santa.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Модель User
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String, index=True)
    wishlist = Column(String)
    role = Column(String, default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Профиль пользователя
    gwars_profile_url = Column(String)
    gwars_nickname = Column(String)
    full_name = Column(String)
    address = Column(String)
    interests = Column(String)
    profile_completed = Column(Boolean, default=False)
    
    # Верификация GWars.io
    gwars_verification_token = Column(String)
    gwars_verified = Column(Boolean, default=False)
    
    # Аватарка пользователя
    avatar_seed = Column(String)
    
    # Дополнительные поля профиля (необязательные)
    phone_number = Column(String)
    telegram_username = Column(String)

def test_database():
    """Тестирует создание базы данных и admin пользователя"""
    
    print("Создание таблиц...")
    Base.metadata.create_all(bind=engine)
    print("Таблицы созданы")
    
    # Создаем admin пользователя
    db = SessionLocal()
    try:
        print("Создание admin пользователя...")
        admin_user = User(
            username="admin",
            email="admin@example.com",
            hashed_password="admin",  # Простой пароль для теста
            name="Администратор",
            wishlist="Управление системой",
            role="admin"
        )
        db.add(admin_user)
        db.commit()
        print("Admin пользователь создан")
        
        # Проверяем что пользователь создался
        user = db.query(User).filter(User.username == "admin").first()
        if user:
            print(f"Пользователь найден: {user.username} ({user.email})")
        else:
            print("Ошибка: пользователь не найден")
            
    except Exception as e:
        print(f"Ошибка: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("Тест базы данных")
    print("=" * 30)
    test_database()
    print("Готово!")

