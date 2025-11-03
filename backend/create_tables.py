#!/usr/bin/env python3
"""
Скрипт для создания таблиц базы данных
Запускается один раз при первой настройке проекта
"""
import os
import sys

# Добавляем текущую директорию в путь, чтобы можно было импортировать main
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import Base, engine, SessionLocal
from sqlalchemy.orm import Session

def create_tables():
    """Создает все таблицы в базе данных"""
    try:
        print("🔄 Создание таблиц базы данных...")
        
        # Создаем все таблицы
        Base.metadata.create_all(bind=engine)
        print("✅ Таблицы успешно созданы")
        
        # Проверяем, что таблицы действительно созданы
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print(f"\n📊 Созданные таблицы ({len(tables)}):")
        for table in tables:
            print(f"   - {table}")
        
        print("\n✅ База данных готова к использованию!")
        
    except Exception as e:
        print(f"❌ Ошибка при создании таблиц: {e}")
        sys.exit(1)

if __name__ == "__main__":
    create_tables()

