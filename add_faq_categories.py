#!/usr/bin/env python3
"""
Скрипт для добавления таблицы категорий FAQ в базу данных
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from backend.main import Base, FAQCategory
import os

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./santa.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def add_faq_categories_table():
    """Добавляет таблицу faq_categories в базу данных"""
    try:
        # Создаем таблицу категорий FAQ
        Base.metadata.create_all(bind=engine, tables=[FAQCategory.__table__])
        print("✅ Таблица faq_categories успешно создана")
        
        # Добавляем колонку category_id в таблицу faq, если её нет
        with engine.connect() as conn:
            # Проверяем, существует ли колонка category_id
            result = conn.execute(text("PRAGMA table_info(faq)"))
            columns = [row[1] for row in result.fetchall()]
            
            if 'category_id' not in columns:
                conn.execute(text("ALTER TABLE faq ADD COLUMN category_id INTEGER REFERENCES faq_categories(id)"))
                print("✅ Колонка category_id добавлена в таблицу faq")
            else:
                print("ℹ️ Колонка category_id уже существует в таблице faq")
        
        # Создаем несколько базовых категорий
        session = SessionLocal()
        try:
            # Проверяем, есть ли уже категории
            existing_categories = session.query(FAQCategory).count()
            if existing_categories == 0:
                # Создаем базовые категории
                categories = [
                    FAQCategory(
                        name="Общие вопросы",
                        description="Общие вопросы о системе и регистрации",
                        order=1,
                        is_active=True
                    ),
                    FAQCategory(
                        name="GWars профиль",
                        description="Вопросы о верификации GWars профиля",
                        order=2,
                        is_active=True
                    ),
                    FAQCategory(
                        name="Мероприятия",
                        description="Вопросы о мероприятиях и участии",
                        order=3,
                        is_active=True
                    ),
                    FAQCategory(
                        name="Подарки",
                        description="Вопросы о системе подарков",
                        order=4,
                        is_active=True
                    )
                ]
                
                for category in categories:
                    session.add(category)
                
                session.commit()
                print("✅ Базовые категории FAQ созданы")
            else:
                print(f"ℹ️ В базе уже есть {existing_categories} категорий")
                
        except Exception as e:
            session.rollback()
            print(f"❌ Ошибка при создании категорий: {e}")
        finally:
            session.close()
            
    except Exception as e:
        print(f"❌ Ошибка при создании таблицы: {e}")

if __name__ == "__main__":
    print("🚀 Начинаем миграцию базы данных для категорий FAQ...")
    add_faq_categories_table()
    print("✅ Миграция завершена!")
