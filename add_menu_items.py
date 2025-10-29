#!/usr/bin/env python3
"""
Скрипт для добавления таблицы меню в базу данных
"""

from sqlalchemy import create_engine, text, Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./santa.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)  # Название пункта меню
    path = Column(String, nullable=True)  # Путь (для ссылок)
    icon = Column(String, nullable=True)  # Иконка (название иконки из antd)
    parent_id = Column(Integer, ForeignKey("menu_items.id"), nullable=True)  # Родительский элемент
    order = Column(Integer, default=0)  # Порядок отображения
    is_active = Column(Boolean, default=True)  # Активен ли пункт
    is_admin_only = Column(Boolean, default=False)  # Только для администраторов
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

def add_menu_items_table():
    """Добавляет таблицу menu_items в базу данных"""
    try:
        # Создаем таблицу меню
        Base.metadata.create_all(bind=engine, tables=[MenuItem.__table__])
        print("Таблица menu_items успешно создана")
        
        # Создаем базовую структуру меню
        session = SessionLocal()
        try:
            # Проверяем, есть ли уже элементы меню
            existing_items = session.query(MenuItem).count()
            if existing_items == 0:
                # Создаем базовую структуру меню
                menu_items = [
                    # Основные разделы
                    MenuItem(
                        title="Главная",
                        path="/",
                        icon="HomeOutlined",
                        order=1,
                        is_active=True,
                        is_admin_only=False
                    ),
                    MenuItem(
                        title="Мероприятия",
                        path="/events",
                        icon="CalendarOutlined",
                        order=2,
                        is_active=True,
                        is_admin_only=False
                    ),
                    MenuItem(
                        title="Участники",
                        path="/users",
                        icon="TeamOutlined",
                        order=3,
                        is_active=True,
                        is_admin_only=False
                    ),
                    MenuItem(
                        title="FAQ",
                        path="/faq",
                        icon="QuestionCircleOutlined",
                        order=4,
                        is_active=True,
                        is_admin_only=False
                    ),
                    MenuItem(
                        title="О нас",
                        path="/about",
                        icon="InfoCircleOutlined",
                        order=5,
                        is_active=True,
                        is_admin_only=False
                    ),
                    MenuItem(
                        title="Контакты",
                        path="/contacts",
                        icon="ContactsOutlined",
                        order=6,
                        is_active=True,
                        is_admin_only=False
                    ),
                    # Админские разделы
                    MenuItem(
                        title="Администрирование",
                        path="/admin",
                        icon="SettingOutlined",
                        order=7,
                        is_active=True,
                        is_admin_only=True
                    )
                ]
                
                for item in menu_items:
                    session.add(item)
                
                session.commit()
                print("Базовая структура меню создана")
            else:
                print(f"В базе уже есть {existing_items} элементов меню")
                
        except Exception as e:
            session.rollback()
            print(f"Ошибка при создании меню: {e}")
        finally:
            session.close()
            
    except Exception as e:
        print(f"Ошибка при создании таблицы: {e}")

if __name__ == "__main__":
    print("Начинаем миграцию базы данных для меню...")
    add_menu_items_table()
    print("Миграция завершена!")
