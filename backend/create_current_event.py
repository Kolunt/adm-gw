#!/usr/bin/env python3
"""
Скрипт для создания текущего мероприятия в базе данных
Запускается после создания таблиц
"""
import os
import sys
from datetime import datetime, timedelta

# Добавляем текущую директорию в путь
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import SessionLocal, Event

def create_current_event():
    """Создает текущее мероприятие с актуальными датами"""
    db = SessionLocal()
    try:
        # Проверяем, есть ли уже мероприятия
        existing_events = db.query(Event).count()
        
        if existing_events > 0:
            print(f"✅ В базе данных уже есть {existing_events} мероприятие(й)")
            events = db.query(Event).all()
            for event in events:
                print(f"   - {event.name} (ID: {event.id})")
            return
        
        # Создаем новое мероприятие
        now = datetime.utcnow()
        
        event = Event(
            name="Анонимный Дед Мороз 2024",
            description="Ежегодное мероприятие обмена подарками",
            preregistration_start=now - timedelta(days=1),
            registration_start=now,
            registration_end=now + timedelta(days=30)
        )
        
        db.add(event)
        db.commit()
        db.refresh(event)
        
        print("✅ Мероприятие создано успешно!")
        print(f"   Название: {event.name}")
        print(f"   ID: {event.id}")
        print(f"   Регистрация: {event.registration_start.strftime('%Y-%m-%d')} - {event.registration_end.strftime('%Y-%m-%d')}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Ошибка при создании мероприятия: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    print("🔄 Создание текущего мероприятия...")
    create_current_event()
    print("✅ Готово!")

