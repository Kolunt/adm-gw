#!/usr/bin/env python3
"""
Скрипт для создания таблиц в базе данных
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from datetime import datetime

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./backend/adm.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
Base = declarative_base()

# Database models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    name = Column(String)
    full_name = Column(String)
    address = Column(String)
    gwars_nickname = Column(String)
    verification_token = Column(String)
    is_verified = Column(Boolean, default=False)
    interests = Column(String)
    phone_number = Column(String)
    telegram_nickname = Column(String)
    role = Column(String, default="user")
    avatar_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    preregistration_start = Column(DateTime)
    registration_start = Column(DateTime)
    registration_end = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

class EventRegistration(Base):
    __tablename__ = "event_registrations"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    is_confirmed = Column(Boolean, default=False)
    registration_date = Column(DateTime, default=datetime.utcnow)
    confirmation_date = Column(DateTime)

class GiftAssignment(Base):
    __tablename__ = "gift_assignments"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)
    giver_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime)
    approved_by = Column(Integer, ForeignKey("users.id"))

class Interest(Base):
    __tablename__ = "interests"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class FAQ(Base):
    __tablename__ = "faq"
    
    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, index=True)
    answer = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SystemSettings(Base):
    __tablename__ = "system_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    value = Column(String)
    updated_at = Column(DateTime, default=datetime.utcnow)

def main():
    print("Создание таблиц в базе данных...")
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    print("Таблицы успешно созданы!")
    
    # Проверяем созданные таблицы
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    print("\nСозданные таблицы:")
    for table in tables:
        print(f"  - {table}")

if __name__ == "__main__":
    main()
