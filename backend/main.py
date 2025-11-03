from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import Response, JSONResponse
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey, func, text
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel, field_validator
from datetime import datetime
import os
import uuid
import shutil
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from telegram_bot import TelegramBot, create_telegram_bot
import requests
import re
import random
from starlette.requests import Request
from secrets import token_urlsafe, token_hex
import hashlib

# Environment detection
IS_PYTHONANYWHERE = (
    'PYTHONANYWHERE_DOMAIN' in os.environ or 
    'pythonanywhere.com' in os.environ.get('HTTP_HOST', '') or
    'pythonanywhere.com' in os.environ.get('SERVER_NAME', '')
)

# Database setup
if IS_PYTHONANYWHERE:
    # Production на PythonAnywhere
    DB_PATH = os.path.join(os.path.expanduser('~'), 'gwadm', 'backend', 'santa.db')
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"
    # Создаем директорию если не существует
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
else:
    # Локальная разработка
    SQLALCHEMY_DATABASE_URL = "sqlite:///./santa.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# File upload settings
if IS_PYTHONANYWHERE:
    # Production на PythonAnywhere
    UPLOAD_DIR = os.path.join(os.path.expanduser('~'), 'gwadm', 'backend', 'uploads')
    ICON_DIR = os.path.join(UPLOAD_DIR, 'icons')
else:
    # Локальная разработка
    UPLOAD_DIR = "uploads"
    ICON_DIR = os.path.join(UPLOAD_DIR, "icons")

os.makedirs(ICON_DIR, exist_ok=True)

# Allowed file types for icons
ALLOWED_ICON_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon"]
MAX_ICON_SIZE = 5 * 1024 * 1024  # 5MB

# JWT settings
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 часов вместо 30 минут

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Database models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String, index=True)
    wishlist = Column(String)
    role = Column(String, default="user")  # user, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Профиль пользователя
    gwars_profile_url = Column(String)  # Ссылка на профиль в gwars.io
    gwars_nickname = Column(String)  # Никнейм из GWars профиля
    gwars_user_id = Column(Integer, unique=True, index=True, nullable=True)  # ID пользователя из GWars
    gwars_verification_token = Column(String)  # Токен для верификации GWars
    gwars_verified = Column(Boolean, default=False)  # Верифицирован ли GWars профиль
    full_name = Column(String)  # ФИО
    address = Column(String)  # Адрес для отправки подарков
    interests = Column(String)  # Интересы пользователя
    profile_completed = Column(Boolean, default=False)  # Заполнен ли профиль
    
    # Аватарка пользователя
    avatar_seed = Column(String)  # Seed для генерации аватарки DiceBear
    avatar_type = Column(String, default='avataaars')  # Тип аватарки из библиотеки
    
    # Дополнительные поля профиля (необязательные)
    phone_number = Column(String)  # Номер телефона
    telegram_username = Column(String)  # Никнейм в Telegram
    
    # Тестовые пользователи
    is_test = Column(Boolean, default=False)  # Флаг тестового пользователя
    
    # Блокировка пользователя
    block_reason = Column(String)  # Причина блокировки пользователя

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    unique_id = Column(Integer, unique=True, index=True)  # Уникальный ID для URL (не переиспользуется)
    name = Column(String, index=True)
    description = Column(String)
    preregistration_start = Column(DateTime)  # Дата начала предварительной регистрации
    registration_start = Column(DateTime)     # Дата начала регистрации
    registration_end = Column(DateTime)       # Дата закрытия регистрации
    event_start = Column(DateTime, nullable=True)  # Новое поле: фактическое время события
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, index=True)  # ID администратора, создавшего мероприятие

class EventRegistration(Base):
    __tablename__ = "event_registrations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)  # ID пользователя
    event_id = Column(Integer, index=True)  # ID мероприятия
    registration_type = Column(String, default="preregistration")  # preregistration, registration
    is_confirmed = Column(Boolean, default=False)  # Подтверждено ли участие
    confirmed_address = Column(String)  # Подтвержденный адрес для подарка
    confirmed_at = Column(DateTime)  # Дата подтверждения
    created_at = Column(DateTime, default=datetime.utcnow)

class SystemSettings(Base):
    __tablename__ = "system_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)  # Ключ настройки
    value = Column(String)  # Значение настройки
    description = Column(String)  # Описание настройки
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Таблица сезонных слов для генерации токенов
class SeasonWord(Base):
    __tablename__ = "season_words"

    id = Column(Integer, primary_key=True, index=True)
    original = Column(String)
    normalized = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Interest(Base):
    __tablename__ = "interests"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=True)
    is_blocked = Column(Boolean, default=False)  # Заблокирован ли интерес администратором
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Кто создал интерес
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class FAQCategory(Base):
    __tablename__ = "faq_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True, index=True)
    description = Column(String, nullable=True)
    order = Column(Integer, default=0)  # Порядок отображения
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class FAQ(Base):
    __tablename__ = "faq"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, nullable=False, index=True)
    answer = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey("faq_categories.id"), nullable=True)  # Категория FAQ
    is_active = Column(Boolean, default=True)
    order = Column(Integer, default=0)  # Порядок отображения
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Кто создал FAQ
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)




class TelegramBot(Base):
    __tablename__ = "telegram_bot"

    id = Column(Integer, primary_key=True, index=True)
    bot_token = Column(String, nullable=False)  # Токен бота
    bot_username = Column(String)  # Username бота
    is_active = Column(Boolean, default=True)  # Активен ли бот
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class TelegramUser(Base):
    __tablename__ = "telegram_users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Связь с пользователем
    telegram_id = Column(String, unique=True, nullable=False)  # Telegram ID пользователя
    telegram_username = Column(String)  # Telegram username
    is_active = Column(Boolean, default=True)  # Активны ли уведомления
    subscribed_at = Column(DateTime, default=datetime.utcnow)
    last_notification = Column(DateTime)  # Последнее уведомление


class SiteIcon(Base):
    __tablename__ = "site_icon"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)  # Имя файла иконки
    original_filename = Column(String, nullable=False)  # Оригинальное имя файла
    file_size = Column(Integer)  # Размер файла в байтах
    mime_type = Column(String)  # MIME тип файла
    is_active = Column(Boolean, default=True)  # Активна ли иконка
    uploaded_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Кто загрузил
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class GiftAssignment(Base):
    __tablename__ = "gift_assignments"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)  # Связь с мероприятием
    giver_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)  # Кто дарит
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)  # Кому дарит
    is_approved = Column(Boolean, default=False)  # Утверждено ли назначение
    created_at = Column(DateTime, default=datetime.utcnow)  # Дата создания назначения
    approved_at = Column(DateTime)  # Дата утверждения
    approved_by = Column(Integer, ForeignKey("users.id"))  # Кто утвердил


# Password and JWT functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def authenticate_user(email: str, password: str, db: Session):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

# Create tables
Base.metadata.create_all(bind=engine)

# Мягкие миграции для недостающих колонок в users (с явным коммитом транзакции)
try:
    with engine.begin() as conn:  # begin() гарантирует commit/rollback
        cols = conn.execute(text("PRAGMA table_info(users)")).fetchall()
        col_names = {row[1] for row in cols}
        # Примечание: SQLite не поддерживает DROP COLUMN напрямую, колонка username будет игнорироваться
        if 'username' in col_names:
            print("Примечание: Колонка 'username' существует, но будет игнорироваться в коде")
        if 'gwars_verification_token' not in col_names:
            conn.execute(text("ALTER TABLE users ADD COLUMN gwars_verification_token TEXT"))
            print("Добавлен столбец users.gwars_verification_token")
        if 'profile_completed' not in col_names:
            conn.execute(text("ALTER TABLE users ADD COLUMN profile_completed BOOLEAN DEFAULT 0"))
            print("Добавлен столбец users.profile_completed")
        if 'gwars_verified' not in col_names:
            conn.execute(text("ALTER TABLE users ADD COLUMN gwars_verified BOOLEAN DEFAULT 0"))
            print("Добавлен столбец users.gwars_verified")
        # Создаем служебную таблицу verification_tokens при отсутствии
        vt_exists = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='verification_tokens'"))\
            .fetchone()
        if not vt_exists:
            conn.execute(text(
                """
                CREATE TABLE verification_tokens (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    token TEXT NOT NULL UNIQUE,
                    is_active INTEGER DEFAULT 1,
                    created_at DATETIME
                )
                """
            ))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_verification_tokens_user_id ON verification_tokens(user_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_verification_tokens_token ON verification_tokens(token)"))
            print("Создана таблица verification_tokens")
except Exception as e:
    print(f"Миграция users.* пропущена или не удалась: {e}")

# Лёгкая миграция для добавления столбца event_start, если его нет
try:
    with engine.begin() as conn:
        res = conn.execute(text("PRAGMA table_info(events)")).fetchall()
        columns = {row[1] for row in res}  # name находится по индексу 1
        if 'event_start' not in columns:
            conn.execute(text("ALTER TABLE events ADD COLUMN event_start DATETIME"))
            print("Добавлен столбец events.event_start")
except Exception as mig_err:
    print(f"Миграция event_start пропущена или не удалась: {mig_err}")

# Create default admin user
def create_default_admin():
    db = SessionLocal()
    try:
        # Check if admin already exists
        admin_user = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin_user:
            admin_user = User(
                email="admin@example.com",
                hashed_password=get_password_hash("admin123"),
                name="Администратор",
                wishlist="Управление системой Анонимный Дед Мороз",
                role="admin"
            )
            db.add(admin_user)
            db.commit()
            print("Создан дефолтный администратор: admin@example.com / admin123")
        else:
            print("Администратор уже существует")
    except Exception as e:
        print(f"Ошибка при создании администратора: {e}")
    finally:
        db.close()

def create_default_settings():
    """Создание настроек системы по умолчанию"""
    db = SessionLocal()
    try:
        # Общие настройки сайта
        site_title_setting = db.query(SystemSettings).filter(SystemSettings.key == "site_title").first()
        if not site_title_setting:
            site_title_setting = SystemSettings(
                key="site_title",
                value="Анонимный Дед Мороз",
                description="Название сайта, отображаемое в заголовке страницы"
            )
            db.add(site_title_setting)
        
        site_description_setting = db.query(SystemSettings).filter(SystemSettings.key == "site_description").first()
        if not site_description_setting:
            site_description_setting = SystemSettings(
                key="site_description",
                value="Система организации анонимного обмена подарками между участниками сообщества GWars.io",
                description="Описание сайта для поисковых систем и социальных сетей"
            )
            db.add(site_description_setting)
        
        # Настройки Dadata
        dadata_token_setting = db.query(SystemSettings).filter(SystemSettings.key == "dadata_token").first()
        if not dadata_token_setting:
            dadata_token_setting = SystemSettings(
                key="dadata_token",
                value="",
                description="API токен для сервиса Dadata.ru (для автодополнения адресов)"
            )
            db.add(dadata_token_setting)
        
        dadata_enabled_setting = db.query(SystemSettings).filter(SystemSettings.key == "dadata_enabled").first()
        if not dadata_enabled_setting:
            dadata_enabled_setting = SystemSettings(
                key="dadata_enabled",
                value="false",
                description="Включить автодополнение адресов через Dadata.ru"
            )
            db.add(dadata_enabled_setting)
        
        # Количество слов для генерации токена
        token_words_count = db.query(SystemSettings).filter(SystemSettings.key == "token_words_count").first()
        if not token_words_count:
            token_words_count = SystemSettings(
                key="token_words_count",
                value="3",
                description="Количество слов, используемых при генерации верификационного токена"
            )
            db.add(token_words_count)

        # Настройки приветственного сообщения
        welcome_title_setting = db.query(SystemSettings).filter(SystemSettings.key == "welcome_title").first()
        if not welcome_title_setting:
            welcome_title_setting = SystemSettings(
                key="welcome_title",
                value="🎅 Анонимный Дед Мороз",
                description="Заголовок приветственного сообщения на главной странице"
            )
            db.add(welcome_title_setting)
        
        welcome_subtitle_setting = db.query(SystemSettings).filter(SystemSettings.key == "welcome_subtitle").first()
        if not welcome_subtitle_setting:
            welcome_subtitle_setting = SystemSettings(
                key="welcome_subtitle",
                value="Добро пожаловать в систему обмена подарками!",
                description="Подзаголовок приветственного сообщения на главной странице"
            )
            db.add(welcome_subtitle_setting)
        
        # Настройка приветственного сообщения для пользователей
        welcome_message_setting = db.query(SystemSettings).filter(SystemSettings.key == "welcome_message").first()
        if not welcome_message_setting:
            welcome_message_setting = SystemSettings(
                key="welcome_message",
                value="Привет, Тестовый пользователь 1!",
                description="Персонализированное приветственное сообщение для пользователей"
            )
            db.add(welcome_message_setting)
        
        # Инициализация настроек кнопок мероприятий
        button_settings = [
            ("button_preregistration", "Хочу!", "Текст кнопки для предварительной регистрации"),
            ("button_registration", "Регистрация", "Текст кнопки для основной регистрации"),
            ("button_confirm_participation", "Подтвердить участие", "Текст кнопки для подтверждения участия"),
            ("button_soon", "Уже скоро :)", "Текст кнопки для предварительно зарегистрированных пользователей"),
            ("button_participating", "Вы участвуете в мероприятии", "Текст кнопки для подтвержденных участников")
        ]
        
        for key, default_value, description in button_settings:
            setting = db.query(SystemSettings).filter(SystemSettings.key == key).first()
            if not setting:
                new_setting = SystemSettings(
                    key=key,
                    value=default_value,
                    description=description
                )
                db.add(new_setting)
        
        # Инициализация настроек SMTP
        smtp_settings = [
            ("smtp_enabled", "false", "Включить отправку писем через SMTP"),
            ("smtp_host", "", "Адрес SMTP сервера"),
            ("smtp_port", "587", "Порт SMTP сервера"),
            ("smtp_username", "", "Имя пользователя для SMTP"),
            ("smtp_password", "", "Пароль для SMTP"),
            ("smtp_from_email", "", "Email адрес отправителя"),
            ("smtp_from_name", "Анонимный Дед Мороз", "Имя отправителя"),
            ("smtp_use_tls", "true", "Использовать TLS для SMTP")
        ]
        
        for key, default_value, description in smtp_settings:
            setting = db.query(SystemSettings).filter(SystemSettings.key == key).first()
            if not setting:
                new_setting = SystemSettings(
                    key=key,
                    value=default_value,
                    description=description
                )
                db.add(new_setting)
        
        db.commit()
        print("Настройки системы инициализированы")
    except Exception as e:
        print(f"Ошибка при инициализации настроек: {e}")
        db.rollback()
    finally:
        db.close()

# Pydantic models
class UserCreate(BaseModel):
    email: str
    password: str
    confirm_password: str
    
    @field_validator('email')
    @classmethod
    def validate_email_length(cls, v):
        if len(v) < 6:
            raise ValueError('Email должен содержать минимум 6 символов')
        return v
    
    @field_validator('password')
    @classmethod
    def validate_password_length(cls, v):
        if len(v) < 6:
            raise ValueError('Пароль должен содержать минимум 6 символов')
        return v

class UserLogin(BaseModel):
    email: str
    password: str
    
    @field_validator('email')
    @classmethod
    def validate_email_length(cls, v):
        if len(v) < 6:
            raise ValueError('Email должен содержать минимум 6 символов')
        return v
    
    @field_validator('password')
    @classmethod
    def validate_password_length(cls, v):
        if len(v) < 6:
            raise ValueError('Пароль должен содержать минимум 6 символов')
        return v

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    wishlist: str
    role: str
    is_active: bool
    created_at: datetime
    # Профиль пользователя
    gwars_profile_url: str | None = None
    gwars_nickname: str | None = None
    gwars_verification_token: str | None = None
    gwars_verified: bool = False
    full_name: str | None = None
    address: str | None = None
    interests: str | None = None
    profile_completed: bool = False
    
    # Аватарка пользователя
    avatar_seed: str | None = None
    avatar_type: str | None = None
    
    # Дополнительные поля профиля (необязательные)
    phone_number: str | None = None
    telegram_username: str | None = None
    
    # Блокировка пользователя
    block_reason: str | None = None
    
    class Config:
        from_attributes = True

class BlockUserRequest(BaseModel):
    reason: str  # Причина блокировки

class Token(BaseModel):
    access_token: str
    token_type: str

# Модели для пошагового заполнения профиля
class ProfileStep1(BaseModel):
    gwars_profile_url: str

class ProfileStep2(BaseModel):
    full_name: str
    address: str

class ProfileStep3(BaseModel):
    interests: str

class ProfileStep2_5(BaseModel):
    phone_number: str | None = None
    telegram_username: str | None = None

class ProfileUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    gwars_profile_url: str | None = None
    full_name: str | None = None
    address: str | None = None
    interests: str | None = None
    gwars_nickname: str | None = None
    gwars_verified: bool | None = None
    gwars_verification_token: str | None = None
    # Дополнительные поля профиля (необязательные)
    phone_number: str | None = None
    telegram_username: str | None = None
    avatar_seed: str | None = None
    avatar_type: str | None = None

class EventCreate(BaseModel):
    name: str
    description: str = ""
    preregistration_start: datetime
    registration_start: datetime
    registration_end: datetime
    event_start: datetime

class EventUpdate(BaseModel):
    name: str = None
    description: str = None
    preregistration_start: datetime = None
    registration_start: datetime = None
    registration_end: datetime = None
    event_start: datetime | None = None
    is_active: bool = None

class EventResponse(BaseModel):
    id: int
    unique_id: int
    name: str
    description: str
    preregistration_start: datetime
    registration_start: datetime
    registration_end: datetime
    event_start: datetime | None = None
    is_active: bool
    created_at: datetime
    created_by: int

class EventRegistrationCreate(BaseModel):
    registration_type: str = "preregistration"  # preregistration, registration

class EventRegistrationConfirm(BaseModel):
    confirmed_address: str

class EventRegistrationResponse(BaseModel):
    id: int
    user_id: int
    event_id: int
    registration_type: str
    is_confirmed: bool
    confirmed_address: str | None = None
    confirmed_at: datetime | None = None
    created_at: datetime

class SystemSettingResponse(BaseModel):
    id: int
    key: str
    value: str
    description: str | None = None
    updated_at: datetime

class SystemSettingUpdate(BaseModel):
    value: str | bool

class InterestCreate(BaseModel):
    name: str
    created_by_user_id: int | None = None

class InterestUpdate(BaseModel):
    name: str | None = None
    is_active: bool | None = None
    is_blocked: bool | None = None

class InterestResponse(BaseModel):
    id: int
    name: str
    is_active: bool
    is_blocked: bool
    created_by_user_id: int | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FAQCategoryCreate(BaseModel):
    name: str
    description: str | None = None
    order: int = 0


class FAQCategoryUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    order: int | None = None
    is_active: bool | None = None


class FAQCategoryResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FAQCreate(BaseModel):
    question: str
    answer: str
    category_id: int | None = None
    order: int = 0
    created_by_user_id: int | None = None


class FAQUpdate(BaseModel):
    question: str | None = None
    answer: str | None = None
    category_id: int | None = None
    is_active: bool | None = None
    order: int | None = None


class FAQResponse(BaseModel):
    id: int
    question: str
    answer: str
    category_id: int | None = None
    category: FAQCategoryResponse | None = None
    is_active: bool
    order: int
    created_by_user_id: int | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True



    class Config:
        from_attributes = True


class TelegramBotCreate(BaseModel):
    bot_token: str


class TelegramBotUpdate(BaseModel):
    bot_token: str | None = None
    is_active: bool | None = None


class TelegramBotResponse(BaseModel):
    id: int
    bot_token: str
    bot_username: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TelegramUserCreate(BaseModel):
    telegram_id: str
    telegram_username: str | None = None


class TelegramUserResponse(BaseModel):
    id: int
    user_id: int
    telegram_id: str
    telegram_username: str | None = None
    is_active: bool
    subscribed_at: datetime
    last_notification: datetime | None = None

    class Config:
        from_attributes = True


class TelegramNotificationRequest(BaseModel):
    message: str
    event_id: int | None = None


class SiteIconResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_size: int | None = None
    mime_type: str | None = None
    is_active: bool
    uploaded_by_user_id: int | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class GiftAssignmentResponse(BaseModel):
    id: int
    event_id: int
    giver_id: int
    receiver_id: int
    is_approved: bool
    created_at: datetime
    approved_at: datetime | None = None
    approved_by: int | None = None
    # Дополнительная информация о пользователях
    giver_name: str | None = None
    giver_email: str | None = None
    receiver_name: str | None = None
    receiver_email: str | None = None
    receiver_address: str | None = None

    class Config:
        from_attributes = True

class GiftAssignmentCreate(BaseModel):
    event_id: int
    giver_id: int
    receiver_id: int

class GiftAssignmentUpdate(BaseModel):
    giver_id: int | None = None
    receiver_id: int | None = None
    is_approved: bool | None = None

class GiftAssignmentApproval(BaseModel):
    is_approved: bool


# FastAPI app
app = FastAPI(title="Анонимный Дед Мороз", version="0.1.24")

# Автоматическая инициализация при первом запуске
@app.on_event("startup")
async def startup_event():
    """Инициализация базы данных и настроек при запуске приложения"""
    try:
        # Создаем таблицы, если их еще нет
        from sqlalchemy import inspect
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        
        if not existing_tables:
            print("🔄 База данных пуста, создаем таблицы...")
            Base.metadata.create_all(bind=engine)
            print("✅ Таблицы созданы")
        
        # Создаем настройки по умолчанию
        create_default_settings()
        
        # Создаем дефолтного администратора
        create_default_admin()
        
        print("✅ Инициализация завершена")
    except Exception as e:
        print(f"⚠️ Ошибка при инициализации: {e}")
        # Не прерываем запуск, приложение должно работать даже если инициализация не удалась

# CORS middleware - Автоматическая конфигурация для локальной и production среды
if IS_PYTHONANYWHERE:
    # Production на PythonAnywhere
    default_origins = [
        "https://gwadm.pythonanywhere.com",
        "http://localhost:3000",  # Для локальной разработки фронтенда
        "http://127.0.0.1:3000"
    ]
else:
    # Локальная разработка
    default_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://gwadm.pythonanywhere.com"  # Для тестирования с production
    ]

# Получаем список разрешенных origins из переменной окружения или используем дефолтные
cors_origins_env = os.getenv("CORS_ORIGINS", "")
if cors_origins_env:
    allowed_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
else:
    allowed_origins = default_origins
# Убираем пробелы и пустые строки
allowed_origins = [origin.strip() for origin in allowed_origins if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Requested-With"],
)

ALLOWED_ORIGINS = set(allowed_origins)

@app.middleware("http")
async def ensure_cors_headers(request: Request, call_next):
    try:
        response = await call_next(request)
    except Exception as e:
        # В случае необработанных исключений вернём 500 с CORS заголовками
        response = Response(status_code=500, content=b"")
    origin = request.headers.get("origin")
    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Vary"] = "Origin"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Headers"] = request.headers.get("access-control-request-headers", "*")
        response.headers["Access-Control-Allow-Methods"] = request.headers.get("access-control-request-method", "*")
    return response

# Универсальный обработчик preflight-запросов
@app.options("/{rest_of_path:path}")
async def preflight_handler(request: Request):
    origin = request.headers.get("origin")
    headers = {}
    if origin in ALLOWED_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Vary"] = "Origin"
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Access-Control-Allow-Headers"] = request.headers.get("access-control-request-headers", "*")
        headers["Access-Control-Allow-Methods"] = request.headers.get("access-control-request-method", "*")
    return Response(status_code=200, headers=headers)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def mask_email(email: str) -> str:
    """Маскирует email: показывает только первую букву учетной записи, последнюю букву домена и полностью доменную зону.
    
    Примеры:
    - test@test.de -> t*@*t.de
    - admin@example.com -> a*@*e.com
    """
    if not email or '@' not in email:
        return email
    
    try:
        local_part, domain = email.rsplit('@', 1)
        
        # Маскируем локальную часть (до @): оставляем первую букву, остальное заменяем на одну звездочку
        if len(local_part) > 1:
            masked_local = local_part[0] + '*'
        else:
            masked_local = local_part[0] if local_part else '*'
        
        # Разделяем домен на основную часть и зону
        if '.' in domain:
            domain_parts = domain.rsplit('.', 1)
            domain_name = domain_parts[0]
            domain_zone = '.' + domain_parts[1]
            
            # Маскируем домен: оставляем последнюю букву перед точкой, остальное заменяем на одну звездочку
            if len(domain_name) > 1:
                masked_domain = '*' + domain_name[-1]
            else:
                masked_domain = domain_name
            
            return f"{masked_local}@{masked_domain}{domain_zone}"
        else:
            # Если нет точки в домене (маловероятно, но на всякий случай)
            if len(domain) > 1:
                masked_domain = '*' + domain[-1]
            else:
                masked_domain = domain
            return f"{masked_local}@{masked_domain}"
    except Exception:
        # В случае ошибки возвращаем исходный email
        return email

# JWT dependency
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_user_optional(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Получение текущего пользователя, но без ошибки если токен недействителен"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
    except JWTError:
        return None
    user = db.query(User).filter(User.email == email).first()
    return user

def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

# Alias for compatibility
get_current_admin_user = get_current_admin

# API endpoints
# Главная страница обрабатывается catch-all роутом, если фронтенд развернут

@app.post("/auth/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Проверяем совпадение паролей
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Пароли не совпадают")
    
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Generate name from email prefix
    name_from_email = user.email.split('@')[0]
    
    db_user = User(
        email=user.email,
        hashed_password=get_password_hash(user.password),
        name=name_from_email,  # Use email prefix as name
        wishlist="",
        role="user",
        profile_completed=False,  # Профиль не заполнен
        gwars_profile_url=None,
        gwars_nickname=None,
        full_name=None,
        address=None,
        interests=None,
        gwars_verification_token=None,
        gwars_verified=False,
        avatar_seed=f"{name_from_email}_{user.email}_{datetime.utcnow().timestamp()}"  # Уникальный seed для аватарки
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/auth/login", response_model=Token)
async def login_user(user: UserLogin, db: Session = Depends(get_db)):
    user_data = authenticate_user(user.email, user.password, db)
    if not user_data:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_data.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/profile/status")
async def get_profile_status(current_user: User = Depends(get_current_user)):
    """Возвращает статус заполнения профиля"""
    is_completed = check_profile_completion(current_user)
    
    # Обновляем статус в базе данных и синхронизируем токен
    db = SessionLocal()
    active_token = None
    try:
        try:
            db.execute(text("UPDATE users SET profile_completed = :pc WHERE id = :uid"), {"pc": is_completed, "uid": current_user.id})
        except Exception as e:
            db.rollback()
            print(f"[profile/status] update profile_completed failed: {e}")
        try:
            row = db.execute(text("SELECT token FROM verification_tokens WHERE user_id = :uid AND is_active = 1 ORDER BY id DESC LIMIT 1"), {"uid": current_user.id}).fetchone()
            active_token = row[0] if row else None
            if active_token and active_token != current_user.gwars_verification_token:
                db.execute(text("UPDATE users SET gwars_verification_token = :tok WHERE id = :uid"), {"tok": active_token, "uid": current_user.id})
        except Exception as e:
            db.rollback()
            print(f"[profile/status] fetch/sync verification token failed: {e}")
        finally:
            try:
                db.commit()
            except Exception:
                db.rollback()
    finally:
        db.close()
    
    return {
        "profile_completed": is_completed,
        "steps": {
            "gwars_verified": current_user.gwars_verified,
            "personal_info": bool(current_user.full_name and current_user.address),
            "interests": bool(current_user.interests)
        },
        "missing_fields": {
            "gwars_profile_url": current_user.gwars_profile_url is None,
            "gwars_nickname": current_user.gwars_nickname is None,
            "gwars_verified": not current_user.gwars_verified,
            "full_name": current_user.full_name is None,
            "address": current_user.address is None,
            "interests": current_user.interests is None
        },
        "gwars_verification_token": active_token or current_user.gwars_verification_token
    }

def validate_gwars_url(url: str) -> bool:
    """Проверяет, что URL ведет на gwars.io и имеет правильный формат"""
    import re
    pattern = r'^https?://(www\.)?gwars\.io/info\.php\?id=\d+$'
    return bool(re.match(pattern, url))

def parse_gwars_profile(profile_url: str) -> dict:
    """Парсит GWars профиль и извлекает информацию о персонаже"""
    try:
        # Получаем страницу профиля
        response = requests.get(profile_url, timeout=10)
        response.raise_for_status()
        
        content = response.text
        
        # Проверяем, существует ли персонаж на странице
        # Страница без персонажа содержит текст об ошибке
        character_not_found_indicators = [
            'персонаж не найден',
            'персонаж не найден',
            'ошибка, персонаж',
            'character not found',
            'персонажа нет',
            'не существует'
        ]
        
        content_lower = content.lower()
        character_not_found = any(indicator in content_lower for indicator in character_not_found_indicators)
        
        # Импортируем re для регулярных выражений
        import re
        
        # Также проверяем наличие характерных элементов для существующего персонажа
        # Если нет основных элементов профиля (никнейм, уровень и т.д.), вероятно персонажа нет
        has_profile_elements = any([
            'alt="Male"' in content or 'alt="Female"' in content,  # Аватар персонажа
            '[1064 / 1064]' in content or bool(re.search(r'\[\d+ / \d+\]', content)),  # Уровень персонажа
            '**' in content and len(re.findall(r'\*\*([^*]+)\*\*', content)) > 0,  # Никнейм в формате **никнейм**
        ])
        
        if character_not_found or not has_profile_elements:
            # Дополнительная проверка: ищем явное сообщение об ошибке в структуре страницы
            error_patterns = [
                r'ошибка[,\s]*персонаж[^<]*не[^<]*найден',
                r'персонаж[^<]*не[^<]*найден',
                r'character[^<]*not[^<]*found',
            ]
            
            found_error_message = False
            for pattern in error_patterns:
                if re.search(pattern, content, re.IGNORECASE):
                    found_error_message = True
                    break
            
            if found_error_message or (character_not_found and not has_profile_elements):
                return {
                    "success": False,
                    "error": "Персонаж не найден на указанной странице. Пожалуйста, введите ссылку на существующего персонажа.",
                    "profile_exists": False,
                    "character_not_found": True
                }
        
        # Извлекаем никнейм персонажа из реальной структуры GWars
        
        # Специальный парсер для GWars профилей
        # Ищем никнейм в строке с аватаром и уровнем
        avatar_line_pattern = r'<img[^>]*alt="Male"[^>]*>\s*\*\*([^*]+)\*\*\[1064 / 1064\]'
        avatar_match = re.search(avatar_line_pattern, content, re.IGNORECASE)
        if avatar_match:
            nickname = avatar_match.group(1).strip()
        else:
            # Альтернативный паттерн для поиска никнейма
            nickname_patterns = [
                # Паттерн для поиска никнейма в заголовке таблицы с аватаром (основной)
                r'\*\*([^*]+)\*\*\[1064 / 1064\]',  # **никнейм**[1064 / 1064]
                # Паттерн для поиска никнейма в тегах <b> с уровнем
                r'<b>([^<]+)</b>\[1064 / 1064\]',  # <b>никнейм</b>[1064 / 1064]
                # Паттерн для поиска никнейма в тегах <b>
                r'<b>([^<]+)</b>',
                # Паттерн для поиска в тегах <strong>
                r'<strong>([^<]+)</strong>',
                # Паттерн для поиска в title страницы
                r'<title[^>]*>([^<]+)</title>',
            ]
            
            nickname = None
            for pattern in nickname_patterns:
                matches = re.findall(pattern, content, re.IGNORECASE)
                if matches:
                    for match in matches:
                        match = match.strip()
                        # Проверяем, что это не служебный текст
                        if (len(match) > 2 and 
                            not any(word in match.lower() for word in ['gwars', 'profile', 'info', 'character', 'level', 'money', 'experience', '1064', 'syndicate', 'ваша', 'недвижимость', 'информация', 'персонаж', 'уровень', 'деньги', 'опыт', 'синдикат', 'найти', 'игрока', 'поиск', 'игрок', 'банк', 'ganja', 'islands', 'выход', 'игры', 'вооружение', 'вход', 'регистрация']) and
                            not match.isdigit() and
                            not match.startswith('$') and
                            not match.startswith('%') and
                            not match.startswith('[') and
                            not match.endswith(']') and
                            not match.startswith('©') and
                            not match.startswith('|')):
                            nickname = match
                            break
                    if nickname:
                        break
            
            # Если не нашли через паттерны, попробуем найти в title
            if not nickname:
                title_match = re.search(r'<title[^>]*>([^<]+)</title>', content, re.IGNORECASE)
                if title_match:
                    title = title_match.group(1)
                    # Извлекаем никнейм из title (обычно первый элемент до разделителя)
                    nickname_match = re.search(r'^([^|]+)', title)
                    if nickname_match:
                        nickname = nickname_match.group(1).strip()
        
        if not nickname:
            return {
                "success": False,
                "error": "Не удалось найти никнейм персонажа на странице профиля",
                "profile_exists": True
            }
        
        return {
            "success": True,
            "nickname": nickname,
            "profile_exists": True
        }
        
    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "error": f"Не удалось загрузить профиль: {str(e)}",
            "profile_exists": False
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Ошибка парсинга профиля: {str(e)}",
            "profile_exists": False
        }

@app.post("/profile/check-gwars-url")
async def check_gwars_url_unique(
    url_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Проверяет уникальность ссылки на GWars профиль"""
    profile_url = url_data.get("profile_url")
    
    if not profile_url:
        raise HTTPException(status_code=400, detail="Необходимо указать ссылку на профиль")
    
    # Проверяем уникальность ссылки на игровой профиль
    # Исключаем текущего пользователя из проверки
    existing_user = db.query(User).filter(
        User.gwars_profile_url == profile_url,
        User.id != current_user.id
    ).first()
    
    if existing_user:
        masked_email = mask_email(existing_user.email)
        return {
            "unique": False,
            "message": f"Игровой персонаж с такой ссылкой уже зарегистрирован в системе. Пользователь: {masked_email}"
        }
    
    return {
        "unique": True,
        "message": "Ссылка на игровой профиль уникальна"
    }

@app.post("/profile/parse-gwars")
async def parse_gwars_profile_endpoint(
    gwars_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Парсит GWars профиль и извлекает информацию о персонаже"""
    profile_url = gwars_data.get("profile_url")
    
    if not profile_url:
        raise HTTPException(status_code=400, detail="Необходимо указать ссылку на профиль")
    
    # Проверяем URL
    if not validate_gwars_url(profile_url):
        raise HTTPException(status_code=400, detail="Ссылка должна вести на gwars.io")
    
    # Проверяем уникальность ссылки на игровой профиль
    # Исключаем текущего пользователя из проверки
    existing_user = db.query(User).filter(
        User.gwars_profile_url == profile_url,
        User.id != current_user.id
    ).first()
    
    if existing_user:
        masked_email = mask_email(existing_user.email)
        raise HTTPException(
            status_code=400,
            detail=f"Игровой персонаж с такой ссылкой уже зарегистрирован в системе. Пользователь: {masked_email}"
        )
    
    # Парсим профиль
    result = parse_gwars_profile(profile_url)
    
    if result["success"]:
        # Сохраняем информацию о профиле
        current_user.gwars_profile_url = profile_url
        current_user.gwars_nickname = result["nickname"]
        db.commit()
        
        return {
            "success": True,
            "nickname": result["nickname"],
            "message": f"Профиль найден! Никнейм: {result['nickname']}"
        }
    else:
        return {
            "success": False,
            "error": result["error"]
        }

@app.post("/profile/verify-gwars")
async def verify_gwars_profile(
    gwars_data: dict,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Проверяет GWars профиль и токен"""
    origin = request.headers.get("origin")
    cors_headers = {}
    if origin in ALLOWED_ORIGINS:
        cors_headers = {
            "Access-Control-Allow-Origin": origin,
            "Vary": "Origin",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Headers": request.headers.get("access-control-request-headers", "*"),
            "Access-Control-Allow-Methods": request.headers.get("access-control-request-method", "*")
        }

    try:
        profile_url = gwars_data.get("profile_url")
        nickname = gwars_data.get("nickname")
        skip_verification = gwars_data.get("skip_verification", False)
        
        if not profile_url:
            return JSONResponse(status_code=400, content={"detail": "Необходимо указать ссылку на профиль"}, headers=cors_headers)
        
        if not validate_gwars_url(profile_url):
            return JSONResponse(status_code=400, content={"detail": "Ссылка должна вести на gwars.io"}, headers=cors_headers)
        
        # Проверяем уникальность ссылки на игровой профиль
        # Исключаем текущего пользователя из проверки
        existing_user = db.query(User).filter(
            User.gwars_profile_url == profile_url,
            User.id != current_user.id
        ).first()
        
        if existing_user:
            masked_email = mask_email(existing_user.email)
            return JSONResponse(
                status_code=400,
                content={"detail": f"Игровой персонаж с такой ссылкой уже зарегистрирован в системе. Пользователь: {masked_email}"},
                headers=cors_headers
            )
        
        current_user.gwars_profile_url = profile_url
        if nickname:
            current_user.gwars_nickname = nickname
        # Синхронизируем изменения пользователя в текущей транзакции
        try:
            db.flush()
        except Exception as e:
            db.rollback()
            return JSONResponse(status_code=500, content={"detail": f"DB flush error: {str(e)}"}, headers=cors_headers)
        
        # генерируем новый уникальный токен всегда после подтверждения персонажа (skip_verification=true)
        if skip_verification:
            new_token = generate_unique_verification_token(db, current_user)
            return JSONResponse(status_code=200, content={
                "verified": False,
                "message": "Токен сгенерирован",
                "token": new_token
            }, headers=cors_headers)
        
        # обычная проверка — используем текущий активный токен у пользователя
        token_to_check = current_user.gwars_verification_token
        if not token_to_check:
            # если по какой-то причине нет токена — генерируем и просим разместить
            new_token = generate_unique_verification_token(db, current_user)
            return JSONResponse(status_code=200, content={
                "verified": False,
                "message": "Токен сгенерирован. Разместите его в профиле и повторите проверку.",
                "token": new_token
            }, headers=cors_headers)

        is_verified, error_message = verify_gwars_token_in_profile(profile_url, token_to_check)
        if is_verified:
            current_user.gwars_verified = True
            db.commit()
            return JSONResponse(status_code=200, content={
                "verified": True,
                "message": "GWars профиль успешно верифицирован!"
            }, headers=cors_headers)
        else:
            return JSONResponse(status_code=200, content={
                "verified": False,
                "message": error_message or f"Токен не найден в информации персонажа. Убедитесь, что вы разместили: 'Я Анонимный Дед Мороз: {token_to_check}'",
                "token": token_to_check
            }, headers=cors_headers)
    except Exception as e:
        # Не роняем фронтенд: сообщаем о проблеме, но без 500
        return JSONResponse(status_code=200, content={
            "verified": False,
            "message": f"Ошибка проверки: {str(e)}"
        }, headers=cors_headers)

def check_profile_completion(user: User) -> bool:
    """Проверяет, заполнен ли профиль пользователя"""
    return (
        user.gwars_profile_url is not None and
        user.gwars_nickname is not None and
        user.gwars_verified is True and
        user.full_name is not None and
        user.address is not None and
        user.interests is not None
    )

def verify_gwars_token_in_profile(profile_url: str, token: str) -> tuple[bool, str]:
    """
    Проверяет наличие токена в информации персонажа GWars
    Возвращает: (is_verified: bool, error_message: str)
    """
    try:
        # Получаем страницу профиля
        response = requests.get(profile_url, timeout=10)
        response.raise_for_status()
        
        # Получаем оригинальный текст страницы (с регистром) и в нижнем регистре для поиска
        content_original = response.text
        content_lower = content_original.lower()
        
        # Точная проверка: ищем точное совпадение текста "Я Анонимный Дед Мороз: {token}"
        # Проверяем в оригинальном тексте (с учетом регистра)
        expected_text_exact = f"Я Анонимный Дед Мороз: {token}"
        
        # Сначала проверяем точное совпадение (с учетом регистра)
        if expected_text_exact in content_original:
            return True, ""
        
        # Используем регулярное выражение для поиска точного совпадения токена
        # Проверяем точное совпадение токена после "Я Анонимный Дед Мороз:"
        import re
        # Паттерн для поиска: "Я/я Анонимный/анонимный Дед/дед Мороз/мороз: ТОЧНО_ТОКЕН" (регистр не важен для текста, но токен должен точно совпадать)
        # Экранируем токен для использования в регулярном выражении
        escaped_token = re.escape(token)
        # Проверяем точное совпадение токена с учетом регистра
        pattern_exact = re.compile(
            r'я\s+анонимный\s+дед\s+мороз\s*:\s*' + escaped_token,
            re.IGNORECASE | re.MULTILINE
        )
        
        # Ищем точное совпадение токена
        match_exact = pattern_exact.search(content_original)
        if match_exact:
            # Проверяем, что найденный токен точно совпадает (с учетом регистра)
            found_text = match_exact.group(0)
            # Извлекаем токен из найденного текста
            token_match = re.search(r':\s*([^\s]+)', found_text)
            if token_match:
                found_token = token_match.group(1)
                # Точное сравнение токена (с учетом регистра)
                if found_token == token:
                    return True, ""
                else:
                    # Токен найден, но регистр не совпадает
                    return False, f"Токен найден, но регистр не совпадает. Найден: '{found_token}', ожидался: '{token}'. Убедитесь, что вы разместили точно: 'Я Анонимный Дед Мороз: {token}'"
        
        # Проверяем в нижнем регистре для случая, если пользователь написал в другом регистре текста
        pattern_lower = re.compile(
            r'я\s+анонимный\s+дед\s+мороз\s*:\s*' + re.escape(token.lower()),
            re.IGNORECASE | re.MULTILINE
        )
        
        match_lower = pattern_lower.search(content_original)
        if match_lower:
            # Токен найден в нижнем регистре, проверяем точное совпадение
            found_text = match_lower.group(0)
            token_match = re.search(r':\s*([^\s]+)', found_text)
            if token_match:
                found_token = token_match.group(1)
                if found_token.lower() == token.lower():
                    return True, ""
        
        # Если точное совпадение не найдено, начинаем диагностику
        # Проверяем точное совпадение токена отдельно (без текста)
        # Это нужно для проверки, что токен точно соответствует ожидаемому
        exact_token_match = re.search(r'\b' + re.escape(token) + r'\b', content_original, re.IGNORECASE)
        exact_token_match_lower = re.search(r'\b' + re.escape(token.lower()) + r'\b', content_lower)
        
        # Проверяем, есть ли упоминание "анонимный дед мороз"
        has_mention = "анонимный дед мороз" in content_lower
        
        if has_mention:
            # Пытаемся найти токен рядом с упоминанием
            # Ищем паттерн "анонимный дед мороз:" или "анонимный дед мороз " с токеном после
            # Токен должен быть точно 20 символов в нижнем регистре (a-z)
            pattern = re.compile(r'анонимный\s+дед\s+мороз\s*[:\s]+([a-z]{20})\b', re.IGNORECASE)
            match = pattern.search(content_original)
            if match:
                found_token = match.group(1)
                # Проверяем точное совпадение токена (без учета регистра, так как токен всегда в нижнем регистре)
                if found_token.lower() == token.lower():
                    # Токен совпадает точно, но формат текста может быть неправильным
                    return False, f"Токен найден, но текст не соответствует требуемому формату. Убедитесь, что вы разместили точно: 'Я Анонимный Дед Мороз: {token}' (с большой буквы 'Я', без лишних пробелов)"
                else:
                    return False, f"Найден другой токен в профиле: '{found_token}'. Ожидаемый токен: '{token}'. Убедитесь, что вы разместили правильный токен: 'Я Анонимный Дед Мороз: {token}'"
            else:
                # Проверяем, есть ли точный токен в тексте рядом с упоминанием
                if exact_token_match_lower:
                    return False, f"Токен найден в тексте, но не рядом с упоминанием 'Анонимный Дед Мороз'. Убедитесь, что вы разместили точно: 'Я Анонимный Дед Мороз: {token}' (без лишних пробелов и символов)"
                else:
                    return False, f"Токен не найден рядом с упоминанием 'Анонимный Дед Мороз'. Убедитесь, что вы разместили точно: 'Я Анонимный Дед Мороз: {token}' (без лишних пробелов и символов)"
        
        if exact_token_match or exact_token_match_lower:
            return False, f"Токен найден в тексте, но не в требуемом формате. Убедитесь, что вы разместили точно: 'Я Анонимный Дед Мороз: {token}' (с большой буквы 'Я', без лишних пробелов)"
        
        return False, f"Токен не найден в информации персонажа. Убедитесь, что вы разместили точно: 'Я Анонимный Дед Мороз: {token}' в информации вашего персонажа на GWars.io"
        
    except requests.exceptions.Timeout:
        return False, "Превышено время ожидания при проверке профиля. Попробуйте позже."
    except requests.exceptions.RequestException as e:
        return False, f"Не удалось получить страницу профиля. Проверьте ссылку: {str(e)}"
    except Exception as e:
        print(f"Error verifying GWars token: {e}")
        return False, f"Произошла ошибка при проверке токена: {str(e)}"

# Функции для работы с назначениями подарков
def generate_gift_assignments(event_id: int, db: Session):
    """Генерирует случайные назначения подарков для мероприятия"""
    # Получаем всех подтвержденных участников мероприятия
    participants = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id,
        EventRegistration.is_confirmed == True
    ).all()
    
    if len(participants) < 2:
        raise HTTPException(status_code=400, detail="Недостаточно участников для назначения подарков")
    
    # Получаем ID участников
    participant_ids = [reg.user_id for reg in participants]
    
    # Проверяем, есть ли уже назначения для этого мероприятия
    existing_assignments = db.query(GiftAssignment).filter(
        GiftAssignment.event_id == event_id
    ).all()
    
    if existing_assignments:
        raise HTTPException(status_code=400, detail="Назначения для этого мероприятия уже существуют")
    
    # Создаем случайные назначения
    import random
    random.shuffle(participant_ids)
    
    assignments = []
    for i in range(len(participant_ids)):
        giver_id = participant_ids[i]
        receiver_id = participant_ids[(i + 1) % len(participant_ids)]  # Циклическое назначение
        
        assignment = GiftAssignment(
            event_id=event_id,
            giver_id=giver_id,
            receiver_id=receiver_id,
            is_approved=False
        )
        assignments.append(assignment)
    
    # Сохраняем в базу данных
    for assignment in assignments:
        db.add(assignment)
    
    db.commit()
    return assignments

def get_gift_assignments_with_details(event_id: int, db: Session):
    """Получает назначения подарков с подробной информацией о пользователях"""
    assignments = db.query(GiftAssignment).filter(
        GiftAssignment.event_id == event_id
    ).all()
    
    result = []
    for assignment in assignments:
        # Получаем информацию о дарителе
        giver = db.query(User).filter(User.id == assignment.giver_id).first()
        # Получаем информацию о получателе
        receiver = db.query(User).filter(User.id == assignment.receiver_id).first()
        
        assignment_data = {
            "id": assignment.id,
            "event_id": assignment.event_id,
            "giver_id": assignment.giver_id,
            "receiver_id": assignment.receiver_id,
            "is_approved": assignment.is_approved,
            "created_at": assignment.created_at,
            "approved_at": assignment.approved_at,
            "approved_by": assignment.approved_by,
            "giver_name": giver.full_name or giver.name if giver else None,
            "giver_email": giver.email if giver else None,
            "receiver_name": receiver.full_name or receiver.name if receiver else None,
            "receiver_email": receiver.email if receiver else None,
            "receiver_address": receiver.address if receiver else None
        }
        result.append(assignment_data)
    
    return result

@app.get("/users/", response_model=list[UserResponse])
async def get_users(
    authorization: str | None = Header(None, alias="Authorization"),
    db: Session = Depends(get_db)
):
    """Получение списка пользователей (доступно всем, включая неавторизованных)"""
    current_user = None
    
    # Пытаемся получить текущего пользователя, если токен передан
    if authorization and authorization.startswith("Bearer "):
        try:
            token = authorization.replace("Bearer ", "").strip()
            if token:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                email: str = payload.get("sub")
                if email:
                    current_user = db.query(User).filter(User.email == email).first()
        except (JWTError, Exception):
            # Игнорируем ошибки авторизации - неавторизованные пользователи тоже могут видеть список
            pass
    
    # Администраторы видят всех пользователей, остальные - только активных
    if current_user and current_user.role == "admin":
        users = db.query(User).all()
    else:
        users = db.query(User).filter(User.is_active == True).all()
    return users

@app.get("/users/{user_id}/public", response_model=UserResponse)
async def get_user_public(user_id: int, db: Session = Depends(get_db)):
    """Публичный просмотр профиля пользователя (доступно всем, включая гостей)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Получение профиля пользователя по ID (только для администраторов)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: ProfileUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Обновление профиля пользователя администратором"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Обновляем поля пользователя
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user

# API endpoints для пошагового заполнения профиля
@app.post("/profile/step1")
async def update_profile_step1(
    step1_data: ProfileStep1,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Шаг 1: Обновление ссылки на профиль GWars"""
    profile_url = step1_data.gwars_profile_url
    
    # Проверяем уникальность ссылки на игровой профиль
    # Исключаем текущего пользователя из проверки
    existing_user = db.query(User).filter(
        User.gwars_profile_url == profile_url,
        User.id != current_user.id
    ).first()
    
    if existing_user:
        masked_email = mask_email(existing_user.email)
        raise HTTPException(
            status_code=400,
            detail=f"Игровой персонаж с такой ссылкой уже зарегистрирован в системе. Пользователь: {masked_email}"
        )
    
    current_user.gwars_profile_url = profile_url
    db.commit()
    return {"message": "Шаг 1 профиля обновлен", "step": 1}

@app.post("/profile/step2")
async def update_profile_step2(
    step2_data: ProfileStep2,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Шаг 2: Обновление ФИО и адреса"""
    current_user.full_name = step2_data.full_name
    current_user.address = step2_data.address
    db.commit()
    return {"message": "Шаг 2 профиля обновлен", "step": 2}

@app.post("/profile/step2_5")
async def update_profile_step2_5(
    step2_5_data: ProfileStep2_5,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Шаг 2.5: Обновление дополнительных полей (необязательных)"""
    if step2_5_data.phone_number is not None:
        current_user.phone_number = step2_5_data.phone_number
    if step2_5_data.telegram_username is not None:
        current_user.telegram_username = step2_5_data.telegram_username
    db.commit()
    return {"message": "Шаг 2.5 завершен", "step": 2.5}

@app.post("/profile/step3")
async def update_profile_step3(
    step3_data: ProfileStep3,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Шаг 3: Обновление интересов и завершение профиля"""
    current_user.interests = step3_data.interests
    current_user.profile_completed = True
    db.commit()
    return {"message": "Профиль полностью заполнен", "step": 3, "completed": True}

# Функция для генерации уникального ID мероприятия
def get_next_unique_event_id(db: Session) -> int:
    """Получает следующий уникальный ID для мероприятия"""
    max_unique_id = db.query(Event.unique_id).order_by(Event.unique_id.desc()).first()
    if max_unique_id is None:
        return 1
    return max_unique_id[0] + 1

# API endpoints для управления мероприятиями
@app.post("/events/", response_model=EventResponse)
async def create_event(
    event: EventCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Создание нового мероприятия (только для администраторов)"""
    # Проверяем логику дат
    if event.preregistration_start >= event.registration_start:
        raise HTTPException(status_code=400, detail="Дата предварительной регистрации должна быть раньше даты регистрации")
    
    if event.registration_start >= event.registration_end:
        raise HTTPException(status_code=400, detail="Дата начала регистрации должна быть раньше даты закрытия регистрации")
    
    # Генерируем уникальный ID
    unique_id = get_next_unique_event_id(db)
    
    db_event = Event(
        unique_id=unique_id,
        name=event.name,
        description=event.description,
        preregistration_start=event.preregistration_start,
        registration_start=event.registration_start,
        registration_end=event.registration_end,
        event_start=event.event_start,
        created_by=current_admin.id
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@app.get("/events/", response_model=list[EventResponse])
async def get_events(db: Session = Depends(get_db)):
    """Получение списка всех мероприятий"""
    events = db.query(Event).order_by(Event.created_at.desc()).all()
    return events

@app.get("/events/current", response_model=EventResponse | None)
async def get_current_event(db: Session = Depends(get_db)):
    """Получение ближайшего активного мероприятия"""
    now = datetime.utcnow()
    
    # Ищем активные мероприятия, которые еще не завершились
    active_events = db.query(Event).filter(
        Event.is_active == True,
        Event.registration_end > now
    ).order_by(Event.preregistration_start.asc()).all()
    
    if not active_events:
        return None
    
    # Возвращаем ближайшее мероприятие
    return active_events[0]

@app.get("/events/{event_id}", response_model=EventResponse)
async def get_event(event_id: int, db: Session = Depends(get_db)):
    """Получение конкретного мероприятия по ID"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@app.get("/events/unique/{unique_id}", response_model=EventResponse)
async def get_event_by_unique_id(unique_id: int, db: Session = Depends(get_db)):
    """Получение конкретного мероприятия по уникальному ID"""
    event = db.query(Event).filter(Event.unique_id == unique_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@app.get("/events/{event_id}/participants")
async def get_event_participants(event_id: int, db: Session = Depends(get_db)):
    """Получение списка участников мероприятия"""
    # Проверяем, что мероприятие существует
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Мероприятие не найдено")
    
    # Получаем всех участников мероприятия через EventRegistration
    registrations = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id
    ).all()
    
    # Формируем список участников с никнеймом, ссылкой на профиль и статусом
    participants_list = []
    for registration in registrations:
        # Получаем пользователя
        user = db.query(User).filter(User.id == registration.user_id).first()
        if user:
            # Используем сохраненный никнейм из GWars профиля
            nickname = user.gwars_nickname or "Неизвестно"
            
            # Определяем статус участника
            status = "confirmed" if registration.is_confirmed else "preregistered"
            status_text = "Подтвержден" if registration.is_confirmed else "Предварительная регистрация"
            
            participants_list.append({
                "id": user.id,
                "nickname": nickname,
                "gwars_nickname": user.gwars_nickname,
                "gwars_profile_url": user.gwars_profile_url,
                "avatar_seed": user.avatar_seed,
                "status": status,
                "status_text": status_text,
                "registration_type": registration.registration_type
            })
    
    return participants_list

@app.get("/events/unique/{unique_id}/participants")
async def get_event_participants_by_unique_id(unique_id: int, db: Session = Depends(get_db)):
    """Получение списка участников мероприятия по уникальному ID"""
    # Находим мероприятие по уникальному ID
    event = db.query(Event).filter(Event.unique_id == unique_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Мероприятие не найдено")
    
    # Получаем всех участников мероприятия через EventRegistration
    registrations = db.query(EventRegistration).filter(
        EventRegistration.event_id == event.id  # Используем внутренний ID
    ).all()
    
    # Формируем список участников с никнеймом, ссылкой на профиль и статусом
    participants_list = []
    for registration in registrations:
        # Получаем пользователя
        user = db.query(User).filter(User.id == registration.user_id).first()
        if user:
            # Используем сохраненный никнейм из GWars профиля
            nickname = user.gwars_nickname or "Неизвестно"
            
            # Определяем статус участника
            status = "confirmed" if registration.is_confirmed else "preregistered"
            status_text = "Подтвержден" if registration.is_confirmed else "Предварительная регистрация"
            
            participants_list.append({
                "id": user.id,
                "nickname": nickname,
                "gwars_nickname": user.gwars_nickname,
                "gwars_profile_url": user.gwars_profile_url,
                "avatar_seed": user.avatar_seed,
                "status": status,
                "status_text": status_text,
                "registration_type": registration.registration_type
            })
    
    return participants_list

@app.get("/events/{event_id}/user-registration")
async def get_user_registration(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получение регистрации текущего пользователя на мероприятие"""
    # Проверяем существование мероприятия
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Мероприятие не найдено")
    
    # Ищем регистрацию пользователя на мероприятие
    registration = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id,
        EventRegistration.user_id == current_user.id
    ).first()
    
    if not registration:
        # Пользователь не зарегистрирован - это нормально, возвращаем null
        return None
    
    return {
        "id": registration.id,
        "event_id": registration.event_id,
        "user_id": registration.user_id,
        "is_preregistration": registration.registration_type == "preregistration",
        "is_confirmed": registration.is_confirmed,
        "registration_type": registration.registration_type,
        "created_at": registration.created_at.isoformat()
    }

@app.put("/events/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: int,
    event_update: EventUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Обновление мероприятия (только для администраторов)"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Обновляем только переданные поля
    if event_update.name is not None:
        event.name = event_update.name
    if event_update.description is not None:
        event.description = event_update.description
    if event_update.preregistration_start is not None:
        event.preregistration_start = event_update.preregistration_start
    if event_update.registration_start is not None:
        event.registration_start = event_update.registration_start
    if event_update.registration_end is not None:
        event.registration_end = event_update.registration_end
    if event_update.is_active is not None:
        event.is_active = event_update.is_active
    
    db.commit()
    db.refresh(event)
    return event

@app.delete("/events/{event_id}")
async def delete_event(
    event_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Удаление мероприятия (только для администраторов)"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}

# API endpoints для регистрации на мероприятия
@app.post("/events/{event_id}/register", response_model=EventRegistrationResponse)
async def register_for_event(
    event_id: int,
    registration_data: EventRegistrationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Регистрация пользователя на мероприятие"""
    # Проверяем, что пользователь авторизован и профиль заполнен
    if not current_user.profile_completed:
        raise HTTPException(status_code=400, detail="Профиль должен быть полностью заполнен")
    
    # Проверяем существование мероприятия
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Мероприятие не найдено")
    
    if not event.is_active:
        raise HTTPException(status_code=400, detail="Мероприятие неактивно")
    
    # Проверяем, что пользователь еще не зарегистрирован
    existing_registration = db.query(EventRegistration).filter(
        EventRegistration.user_id == current_user.id,
        EventRegistration.event_id == event_id
    ).first()
    
    if existing_registration:
        raise HTTPException(status_code=400, detail="Вы уже зарегистрированы на это мероприятие")
    
    now = datetime.utcnow()
    registration_type = registration_data.registration_type
    
    # Проверяем даты в зависимости от типа регистрации
    if registration_type == "preregistration":
        if now < event.preregistration_start:
            raise HTTPException(status_code=400, detail="Предварительная регистрация еще не началась")
        if now >= event.registration_start:
            raise HTTPException(status_code=400, detail="Предварительная регистрация уже закончилась")
    elif registration_type == "registration":
        if now < event.registration_start:
            raise HTTPException(status_code=400, detail="Регистрация еще не началась")
        if now >= event.registration_end:
            raise HTTPException(status_code=400, detail="Регистрация уже закончилась")
    else:
        raise HTTPException(status_code=400, detail="Неверный тип регистрации")
    
    # Создаем регистрацию
    registration = EventRegistration(
        user_id=current_user.id,
        event_id=event_id,
        registration_type=registration_type,
        is_confirmed=(registration_type == "registration")  # Если прямая регистрация, сразу подтверждаем
    )
    
    if registration_type == "registration":
        registration.confirmed_address = current_user.address
        registration.confirmed_at = now
    
    db.add(registration)
    db.commit()
    db.refresh(registration)
    return registration

@app.post("/events/unique/{unique_id}/register", response_model=EventRegistrationResponse)
async def register_for_event_by_unique_id(
    unique_id: int,
    registration_data: EventRegistrationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Регистрация пользователя на мероприятие по уникальному ID"""
    # Проверяем, что пользователь авторизован и профиль заполнен
    if not current_user.profile_completed:
        raise HTTPException(status_code=400, detail="Профиль должен быть полностью заполнен")
    
    # Находим мероприятие по уникальному ID
    event = db.query(Event).filter(Event.unique_id == unique_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Мероприятие не найдено")
    
    if not event.is_active:
        raise HTTPException(status_code=400, detail="Мероприятие неактивно")
    
    # Проверяем, что пользователь еще не зарегистрирован
    existing_registration = db.query(EventRegistration).filter(
        EventRegistration.user_id == current_user.id,
        EventRegistration.event_id == event.id
    ).first()
    
    if existing_registration:
        raise HTTPException(status_code=400, detail="Вы уже зарегистрированы на это мероприятие")
    
    now = datetime.utcnow()
    registration_type = registration_data.registration_type
    
    # Проверяем даты в зависимости от типа регистрации
    if registration_type == "preregistration":
        if now < event.preregistration_start:
            raise HTTPException(status_code=400, detail="Предварительная регистрация еще не началась")
        if now >= event.registration_start:
            raise HTTPException(status_code=400, detail="Предварительная регистрация уже закончилась")
    elif registration_type == "registration":
        if now < event.registration_start:
            raise HTTPException(status_code=400, detail="Регистрация еще не началась")
        if now >= event.registration_end:
            raise HTTPException(status_code=400, detail="Регистрация уже закончилась")
    else:
        raise HTTPException(status_code=400, detail="Неверный тип регистрации")
    
    # Создаем регистрацию
    registration = EventRegistration(
        user_id=current_user.id,
        event_id=event.id,  # Используем внутренний ID для связи
        registration_type=registration_type,
        is_confirmed=(registration_type == "registration")  # Если прямая регистрация, сразу подтверждаем
    )
    
    if registration_type == "registration":
        registration.confirmed_address = current_user.address
        registration.confirmed_at = now
    
    db.add(registration)
    db.commit()
    db.refresh(registration)
    return registration

@app.get("/events/{event_id}/registrations", response_model=list[EventRegistrationResponse])
async def get_event_registrations(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получение регистраций на мероприятие (только для администраторов)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Доступ запрещен")
    
    registrations = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id
    ).all()
    return registrations

@app.get("/user/registrations", response_model=list[EventRegistrationResponse])
async def get_user_registrations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получение регистраций текущего пользователя"""
    registrations = db.query(EventRegistration).filter(
        EventRegistration.user_id == current_user.id
    ).all()
    return registrations

@app.post("/events/{event_id}/confirm", response_model=EventRegistrationResponse)
async def confirm_registration(
    event_id: int,
    confirm_data: EventRegistrationConfirm,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Подтверждение участия в мероприятии"""
    # Находим регистрацию
    registration = db.query(EventRegistration).filter(
        EventRegistration.user_id == current_user.id,
        EventRegistration.event_id == event_id
    ).first()
    
    if not registration:
        raise HTTPException(status_code=404, detail="Регистрация не найдена")
    
    if registration.is_confirmed:
        raise HTTPException(status_code=400, detail="Участие уже подтверждено")
    
    # Проверяем, что сейчас период основной регистрации
    event = db.query(Event).filter(Event.id == event_id).first()
    now = datetime.utcnow()
    
    if now < event.registration_start or now >= event.registration_end:
        raise HTTPException(status_code=400, detail="Сейчас не период подтверждения участия")
    
    # Подтверждаем участие
    registration.is_confirmed = True
    registration.confirmed_address = confirm_data.confirmed_address
    registration.confirmed_at = now
    
    db.commit()
    db.refresh(registration)
    return registration

@app.post("/admin/promote/{user_id}")
async def promote_user_to_admin(
    user_id: int, 
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Нельзя изменить свою собственную роль")
    
    user.role = "admin"
    db.commit()
    return {"message": "User promoted to admin successfully"}

@app.post("/admin/demote/{user_id}")
async def demote_admin_to_user(
    user_id: int, 
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Нельзя изменить свою собственную роль")
    
    user.role = "user"
    db.commit()
    return {"message": "Admin demoted to user successfully"}

@app.post("/admin/users/{user_id}/block")
async def block_user(
    user_id: int,
    block_request: BlockUserRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Блокировка пользователя администратором"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Нельзя заблокировать самого себя")
    
    user.is_active = False
    user.block_reason = block_request.reason
    db.commit()
    db.refresh(user)
    return {"message": "User blocked successfully", "user": user}

@app.post("/admin/users/{user_id}/unblock")
async def unblock_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Разблокировка пользователя администратором"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = True
    user.block_reason = None  # Очищаем причину блокировки
    db.commit()
    db.refresh(user)
    return {"message": "User unblocked successfully", "user": user}

@app.delete("/admin/users/{user_id}")
async def delete_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Удаление конкретного пользователя администратором"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Нельзя удалить самого себя")
    
    # Удаляем связанные данные (регистрации на мероприятия, подарки и т.д.)
    db.query(EventRegistration).filter(EventRegistration.user_id == user.id).delete()
    db.query(GiftAssignment).filter(GiftAssignment.giver_id == user.id).delete()
    db.query(GiftAssignment).filter(GiftAssignment.receiver_id == user.id).delete()
    
    # Удаляем связанные токены верификации (используем raw SQL, так как нет модели)
    db.execute(text("DELETE FROM verification_tokens WHERE user_id = :uid"), {"uid": user.id})
    
    # Удаляем самого пользователя
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@app.delete("/admin/users/test/delete-all")
async def delete_all_test_users(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Удаление всех тестовых пользователей"""
    # Находим всех тестовых пользователей
    test_users = db.query(User).filter(User.is_test == True).all()
    
    if not test_users:
        return {"message": "Тестовые пользователи не найдены", "deleted_count": 0}
    
    # Удаляем всех тестовых пользователей
    deleted_count = 0
    for user in test_users:
        # Удаляем связанные данные (регистрации на мероприятия, подарки и т.д.)
        db.query(EventRegistration).filter(EventRegistration.user_id == user.id).delete()
        db.query(GiftAssignment).filter(GiftAssignment.giver_id == user.id).delete()
        db.query(GiftAssignment).filter(GiftAssignment.receiver_id == user.id).delete()
        
        # Удаляем связанные токены верификации (используем raw SQL, так как нет модели)
        db.execute(text("DELETE FROM verification_tokens WHERE user_id = :uid"), {"uid": user.id})
        
        # Удаляем самого пользователя
        db.delete(user)
        deleted_count += 1
    
    db.commit()
    return {"message": f"Удалено {deleted_count} тестовых пользователей", "deleted_count": deleted_count}

@app.put("/auth/profile")
async def update_user_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Обновить профиль текущего пользователя"""
    # Обновляем поля профиля
    if profile_data.name is not None:
        current_user.name = profile_data.name
    if profile_data.email is not None:
        current_user.email = profile_data.email
    if profile_data.gwars_profile_url is not None:
        # Проверяем уникальность ссылки на игровой профиль
        existing_user = db.query(User).filter(
            User.gwars_profile_url == profile_data.gwars_profile_url,
            User.id != current_user.id
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail=f"Игровой персонаж с такой ссылкой уже зарегистрирован в системе. Пользователь: {mask_email(existing_user.email)}"
            )
        
        current_user.gwars_profile_url = profile_data.gwars_profile_url
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name
    if profile_data.address is not None:
        current_user.address = profile_data.address
    if profile_data.interests is not None:
        current_user.interests = profile_data.interests
    if profile_data.phone_number is not None:
        current_user.phone_number = profile_data.phone_number
    if profile_data.telegram_username is not None:
        current_user.telegram_username = profile_data.telegram_username
    if profile_data.avatar_type is not None:
        print(f"Updating avatar_type: {current_user.avatar_type} -> {profile_data.avatar_type}")
        current_user.avatar_type = profile_data.avatar_type
    if profile_data.avatar_seed is not None:
        # Если avatar_seed передан явно, используем его
        print(f"Updating avatar_seed: {current_user.avatar_seed} -> {profile_data.avatar_seed}")
        current_user.avatar_seed = profile_data.avatar_seed
    elif profile_data.avatar_type is not None and not current_user.avatar_seed:
        # Если avatar_type установлен, но avatar_seed не был передан, используем email или id как seed
        fallback_seed = current_user.email or str(current_user.id)
        print(f"Using fallback seed: {fallback_seed}")
        current_user.avatar_seed = fallback_seed
    
    db.commit()
    db.refresh(current_user)
    print(f"Final user data: avatar_type={current_user.avatar_type}, avatar_seed={current_user.avatar_seed}")
    return current_user


@app.post("/auth/generate-verification-token")
async def generate_verification_token(
    profile_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Генерация уникального токена верификации"""
    import secrets
    import string
    
    profile_url = profile_data.get("profile_url")
    if not profile_url:
        raise HTTPException(status_code=400, detail="URL профиля не указан")
    
    # Проверяем уникальность ссылки на игровой профиль
    existing_user = db.query(User).filter(
        User.gwars_profile_url == profile_url,
        User.id != current_user.id
    ).first()
    
    if existing_user:
        masked_email = mask_email(existing_user.email)
        raise HTTPException(
            status_code=400,
            detail=f"Игровой персонаж с такой ссылкой уже зарегистрирован в системе. Пользователь: {masked_email}"
        )
    
    # Генерируем уникальный токен из 20 символов
    alphabet = string.ascii_letters + string.digits
    token = ''.join(secrets.choice(alphabet) for _ in range(20))
    
    # Сохраняем токен в профиле пользователя (можно добавить отдельную таблицу для токенов)
    current_user.gwars_verification_token = token
    current_user.gwars_profile_url = profile_url
    db.commit()
    
    return {
        "success": True,
        "token": token
    }


@app.post("/auth/verify-gwars-token")
async def verify_gwars_token(
    verification_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Проверка токена верификации на GWars.io профиле"""
    import requests
    import re
    
    profile_url = verification_data.get("profile_url")
    verification_token = verification_data.get("verification_token")
    
    if not profile_url or not verification_token:
        raise HTTPException(status_code=400, detail="URL профиля или токен не указан")
    
    try:
        # Получаем страницу профиля
        response = requests.get(profile_url, timeout=10)
        response.raise_for_status()
        
        # Ищем токен в тексте страницы
        if verification_token in response.text:
            # Проверяем уникальность ссылки на игровой профиль
            existing_user = db.query(User).filter(
                User.gwars_profile_url == profile_url,
                User.id != current_user.id
            ).first()
            
            if existing_user:
                raise HTTPException(
                    status_code=400,
                    detail=f"Игровой персонаж с такой ссылкой уже зарегистрирован в системе. Пользователь: {mask_email(existing_user.email)}"
                )
            
            # Токен найден - профиль верифицирован
            current_user.gwars_verified = True
            current_user.gwars_profile_url = profile_url
            db.commit()
            
            return {
                "success": True,
                "message": "Профиль успешно верифицирован"
            }
        else:
            return {
                "success": False,
                "error": "Токен не найден в профиле. Убедитесь, что вы разместили сообщение в поле 'Информация'"
            }
            
    except requests.RequestException as e:
        return {"success": False, "error": f"Ошибка при загрузке профиля: {str(e)}"}
    except Exception as e:
        return {"success": False, "error": f"Ошибка при проверке: {str(e)}"}


# API endpoints для настроек системы
@app.get("/admin/settings", response_model=list[SystemSettingResponse])
async def get_system_settings(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Получение всех настроек системы (только для администраторов)"""
    settings = db.query(SystemSettings).all()
    
    # Создаем список ответов с правильными типами
    response_settings = []
    for setting in settings:
        response_setting = SystemSettingResponse(
            id=setting.id,
            key=setting.key,
            value=setting.value,
            description=setting.description,
            updated_at=setting.updated_at
        )
        
        # Конвертируем булевые значения из строк
        if response_setting.key in ['dadata_enabled']:
            if response_setting.value.lower() == 'true':
                response_setting.value = 'true'  # Оставляем как строку
            elif response_setting.value.lower() == 'false':
                response_setting.value = 'false'  # Оставляем как строку
        
        response_settings.append(response_setting)
    
    return response_settings

# Функция для проверки токена Dadata
def verify_dadata_token(token: str) -> dict:
    """Проверяет валидность токена Dadata.ru"""
    if not token:
        return {"valid": False, "error": "Токен не указан"}
    
    try:
        import requests
        
        # Простой тестовый запрос к Dadata API
        url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address"
        headers = {
            "Authorization": f"Token {token}",
            "Content-Type": "application/json"
        }
        data = {
            "query": "Москва",
            "count": 1
        }
        
        response = requests.post(url, json=data, headers=headers, timeout=5)
        
        if response.status_code == 200:
            return {"valid": True, "message": "Токен действителен"}
        elif response.status_code == 401:
            return {"valid": False, "error": "Неверный токен"}
        elif response.status_code == 403:
            return {"valid": False, "error": "Токен заблокирован или превышен лимит"}
        else:
            return {"valid": False, "error": f"Ошибка API: {response.status_code}"}
            
    except requests.exceptions.RequestException as e:
        return {"valid": False, "error": f"Ошибка подключения: {str(e)}"}
    except Exception as e:
        return {"valid": False, "error": f"Неожиданная ошибка: {str(e)}"}

@app.post("/auth/cross-server-login")
async def cross_server_login(
    params: dict,
    db: Session = Depends(get_db)
):
    """
    Кросс-серверный логин через GWars.io
    
    Проверяет подписи sign, sign2, sign3, sign4 и авторизует пользователя.
    Если пользователь не найден - создает нового.
    """
    # Пароль для подписи (должен совпадать с настройками на GWars.io)
    CROSS_SERVER_PASSWORD = "deadmoroz"
    
    # Извлекаем параметры
    sign = params.get("sign")
    name = params.get("name")
    user_id = params.get("user_id")  # ID пользователя из GWars
    level = params.get("level")
    synd = params.get("synd")
    sign2 = params.get("sign2")
    has_passport = params.get("has_passport", "0")
    has_mobile = params.get("has_mobile", "0")
    old_passport = params.get("old_passport", "0")
    sign3 = params.get("sign3")
    usersex = params.get("usersex")
    sign4 = params.get("sign4")
    
    # Проверяем наличие обязательных параметров
    if not all([sign, name, user_id, sign2, sign3, sign4]):
        raise HTTPException(status_code=400, detail="Отсутствуют обязательные параметры")
    
    try:
        # Преобразуем типы
        user_id_int = int(user_id)
        level_int = int(level) if level else 0
        synd_int = int(float(synd)) if synd else 0
        
        # Проверка подписи sign (md5(pass + user_name + user_user_id))
        expected_sign = hashlib.md5(f"{CROSS_SERVER_PASSWORD}{name}{user_id_int}".encode()).hexdigest()
        if sign != expected_sign:
            raise HTTPException(status_code=403, detail="Неверная подпись sign")
        
        # Проверка подписи sign2 (md5(pass + user_fighter_level + round(user_main_synd) + user_id))
        expected_sign2 = hashlib.md5(f"{CROSS_SERVER_PASSWORD}{level_int}{synd_int}{user_id_int}".encode()).hexdigest()
        if sign2 != expected_sign2:
            raise HTTPException(status_code=403, detail="Неверная подпись sign2")
        
        # Проверка подписи sign3 (substr(md5(pass + user_name + user_id + has_passport + has_mobile + old_passport), 0, 10))
        expected_sign3 = hashlib.md5(f"{CROSS_SERVER_PASSWORD}{name}{user_id_int}{has_passport}{has_mobile}{old_passport}".encode()).hexdigest()[:10]
        if sign3 != expected_sign3:
            raise HTTPException(status_code=403, detail="Неверная подпись sign3")
        
        # Проверка подписи sign4 (substr(md5(strftime("%Y-%m-%d") + sign3 + pass), 0, 10))
        from datetime import date
        today_str = date.today().strftime("%Y-%m-%d")
        expected_sign4 = hashlib.md5(f"{today_str}{sign3}{CROSS_SERVER_PASSWORD}".encode()).hexdigest()[:10]
        if sign4 != expected_sign4:
            raise HTTPException(status_code=403, detail="Неверная подпись sign4 или истек срок действия")
        
        # Все подписи верны, ищем или создаем пользователя
        # Ищем по gwars_user_id
        db_user = db.query(User).filter(User.gwars_user_id == user_id_int).first()
        
        # Если пользователь не найден, создаем нового
        if not db_user:
            # Генерируем email на основе gwars_user_id и имени
            email = f"gwars_{user_id_int}_{name.lower().replace(' ', '_')}@gwars.local"
            
            # Проверяем, нет ли пользователя с таким email
            existing_user = db.query(User).filter(User.email == email).first()
            if existing_user:
                # Обновляем существующего пользователя
                existing_user.gwars_user_id = user_id_int
                existing_user.gwars_nickname = name
                existing_user.gwars_verified = True
                db.commit()
                db.refresh(existing_user)
                db_user = existing_user
            else:
                # Создаем нового пользователя
                name_from_email = name.lower().replace(' ', '_')
                db_user = User(
                    email=email,
                    hashed_password=get_password_hash(token_urlsafe(32)),  # Случайный пароль
                    name=name_from_email,
                    wishlist="",
                    role="user",
                    profile_completed=False,
                    gwars_profile_url=f"https://www.gwars.io/info.php?id={user_id_int}",
                    gwars_nickname=name,
                    gwars_user_id=user_id_int,
                    gwars_verified=True,
                    avatar_seed=f"{name_from_email}_{email}_{datetime.utcnow().timestamp()}"
                )
                db.add(db_user)
                db.commit()
                db.refresh(db_user)
        else:
            # Обновляем данные пользователя из GWars
            db_user.gwars_nickname = name
            db_user.gwars_verified = True
            if not db_user.gwars_profile_url:
                db_user.gwars_profile_url = f"https://www.gwars.io/info.php?id={user_id_int}"
            db.commit()
            db.refresh(db_user)
        
        # Создаем JWT токен для пользователя
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": db_user.email}, expires_delta=access_token_expires
        )
        
        return {
            "success": True,
            "message": "Успешный вход через GWars",
            "access_token": access_token,
            "token_type": "bearer"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Неверный формат параметров: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")

@app.put("/admin/settings/{setting_key}", response_model=SystemSettingResponse)
async def update_system_setting(
    setting_key: str,
    setting_update: SystemSettingUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Обновление настройки системы (только для администраторов)"""
    setting = db.query(SystemSettings).filter(SystemSettings.key == setting_key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Настройка не найдена")
    
    # Если обновляется токен Dadata, проверяем его
    if setting_key == "dadata_token" and setting_update.value:
        token_check = verify_dadata_token(setting_update.value)
        if not token_check["valid"]:
            raise HTTPException(
                status_code=400, 
                detail=f"Токен Dadata недействителен: {token_check['error']}"
            )
    
    # Конвертируем булевые значения в строки для сохранения в БД
    value_to_save = setting_update.value
    if setting_key in ['dadata_enabled'] and isinstance(value_to_save, bool):
        value_to_save = str(value_to_save).lower()
    
    setting.value = value_to_save
    setting.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(setting)
    
    # Создаем копию для ответа с правильными типами
    response_setting = SystemSettingResponse(
        id=setting.id,
        key=setting.key,
        value=setting.value,
        description=setting.description,
        updated_at=setting.updated_at
    )
    
    # Конвертируем обратно для ответа
    if response_setting.key in ['dadata_enabled']:
        if response_setting.value.lower() == 'true':
            response_setting.value = True
        elif response_setting.value.lower() == 'false':
            response_setting.value = False
    
    return response_setting

# API endpoint для проверки токена Dadata
@app.post("/admin/verify-dadata-token")
async def verify_dadata_token_endpoint(
    request_data: dict,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Проверка токена Dadata.ru (только для администраторов)"""
    token = request_data.get("token", "")
    if not token:
        raise HTTPException(status_code=400, detail="Токен не указан")
    
    token_check = verify_dadata_token(token)
    
    if token_check["valid"]:
        return {
            "valid": True,
            "message": "Токен действителен и готов к использованию"
        }
    else:
        return {
            "valid": False,
            "error": token_check["error"]
        }

# API endpoint для проверки SMTP подключения
@app.post("/admin/verify-smtp")
async def verify_smtp_endpoint(
    request_data: dict,
    current_admin: User = Depends(get_current_admin)
):
    """Проверка SMTP подключения (только для администраторов)"""
    import smtplib
    from email.mime.text import MIMEText
    
    smtp_host = request_data.get("smtp_host", "").strip()
    smtp_port = request_data.get("smtp_port", "").strip()
    smtp_username = request_data.get("smtp_username", "").strip()
    smtp_password = request_data.get("smtp_password", "").strip()
    smtp_use_tls = request_data.get("smtp_use_tls", False)
    smtp_from_email = request_data.get("smtp_from_email", "").strip()
    
    # Валидация обязательных полей
    if not smtp_host:
        return {"valid": False, "error": "Адрес SMTP сервера обязателен"}
    if not smtp_port:
        return {"valid": False, "error": "Порт SMTP сервера обязателен"}
    if not smtp_username:
        return {"valid": False, "error": "Имя пользователя SMTP обязательно"}
    if not smtp_password:
        return {"valid": False, "error": "Пароль SMTP обязателен"}
    if not smtp_from_email:
        return {"valid": False, "error": "Email отправителя обязателен"}
    
    try:
        # Преобразуем порт в число
        port = int(smtp_port)
        if port < 1 or port > 65535:
            return {"valid": False, "error": "Порт должен быть числом от 1 до 65535"}
    except ValueError:
        return {"valid": False, "error": "Порт должен быть числом"}
    
    # Проверяем формат email
    email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    if not email_pattern.match(smtp_username):
        return {"valid": False, "error": "Некорректный формат email для имени пользователя"}
    if not email_pattern.match(smtp_from_email):
        return {"valid": False, "error": "Некорректный формат email отправителя"}
    
    # Пытаемся подключиться к SMTP серверу
    try:
        if smtp_use_tls:
            # Для TLS используем SMTP с явным STARTTLS
            server = smtplib.SMTP(smtp_host, port, timeout=10)
            server.starttls()
        else:
            # Для SSL используем SMTP_SSL
            server = smtplib.SMTP_SSL(smtp_host, port, timeout=10)
        
        # Пытаемся авторизоваться
        server.login(smtp_username, smtp_password)
        
        # Закрываем соединение
        server.quit()
        
        return {
            "valid": True,
            "message": "SMTP подключение успешно проверено"
        }
    except smtplib.SMTPAuthenticationError:
        return {
            "valid": False,
            "error": "Ошибка аутентификации: неверный логин или пароль"
        }
    except smtplib.SMTPConnectError as e:
        return {
            "valid": False,
            "error": f"Не удалось подключиться к SMTP серверу: {str(e)}"
        }
    except smtplib.SMTPException as e:
        return {
            "valid": False,
            "error": f"Ошибка SMTP: {str(e)}"
        }
    except Exception as e:
        return {
            "valid": False,
            "error": f"Ошибка подключения: {str(e)}"
        }

# API endpoints для управления интересами (только для администраторов)
@app.get("/admin/interests", response_model=list[InterestResponse])
async def get_interests(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Получение списка всех интересов (только для администраторов)"""
    interests = db.query(Interest).order_by(Interest.created_at.desc()).all()
    return interests

@app.post("/admin/interests", response_model=InterestResponse)
async def create_interest(
    interest_data: InterestCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Создание нового интереса (только для администраторов)"""
    # Приводим название к нижнему регистру
    interest_name = interest_data.name.lower().strip()
    
    # Проверяем, не существует ли уже такой интерес
    existing_interest = db.query(Interest).filter(Interest.name == interest_name).first()
    if existing_interest:
        raise HTTPException(status_code=400, detail="Интерес с таким названием уже существует")
    
    interest = Interest(
        name=interest_name,
        is_active=True,
        is_blocked=False,
        created_by_user_id=current_admin.id
    )
    db.add(interest)
    db.commit()
    db.refresh(interest)
    return interest

@app.put("/admin/interests/{interest_id}", response_model=InterestResponse)
async def update_interest(
    interest_id: int,
    interest_data: InterestUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Обновление интереса (только для администраторов)"""
    interest = db.query(Interest).filter(Interest.id == interest_id).first()
    if not interest:
        raise HTTPException(status_code=404, detail="Интерес не найден")
    
    # Если обновляется название, приводим к нижнему регистру
    if interest_data.name is not None:
        interest_name = interest_data.name.lower().strip()
        # Проверяем, не существует ли уже такой интерес (кроме текущего)
        existing_interest = db.query(Interest).filter(
            Interest.name == interest_name,
            Interest.id != interest_id
        ).first()
        if existing_interest:
            raise HTTPException(status_code=400, detail="Интерес с таким названием уже существует")
        interest.name = interest_name
    
    if interest_data.is_blocked is not None:
        interest.is_blocked = interest_data.is_blocked
        # Если интерес разблокируется, он автоматически становится активным
        if not interest_data.is_blocked:
            interest.is_active = True
    
    interest.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(interest)
    return interest

@app.delete("/admin/interests/{interest_id}")
async def delete_interest(
    interest_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Удаление интереса (только для администраторов)"""
    interest = db.query(Interest).filter(Interest.id == interest_id).first()
    if not interest:
        raise HTTPException(status_code=404, detail="Интерес не найден")
    
    db.delete(interest)
    db.commit()
    return {"message": "Интерес успешно удален"}

# API эндпоинты для работы с интересами пользователей
@app.get("/api/interests")
async def get_all_interests(
    db: Session = Depends(get_db)
):
    """Получение всех активных интересов (доступен всем)"""
    interests = db.query(Interest).filter(
        Interest.is_active == True,
        Interest.is_blocked == False
    ).order_by(Interest.name).all()
    
    return [{"id": interest.id, "name": interest.name} for interest in interests]

@app.get("/api/interests/search")
async def search_interests(
    query: str,
    db: Session = Depends(get_db)
):
    """Поиск интересов по названию (доступен всем)"""
    if len(query.strip()) < 2:
        return []
    
    interests = db.query(Interest).filter(
        Interest.is_active == True,
        Interest.is_blocked == False,
        Interest.name.ilike(f"%{query.strip()}%")
    ).limit(10).all()
    
    return [{"id": interest.id, "name": interest.name} for interest in interests]

@app.post("/api/interests/create", response_model=InterestResponse)
async def create_user_interest(
    interest_data: InterestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Создание нового интереса пользователем"""
    # Приводим название к нижнему регистру
    interest_name = interest_data.name.lower().strip()
    
    # Проверяем, не заблокирован ли такой интерес
    blocked_interest = db.query(Interest).filter(
        Interest.name == interest_name,
        Interest.is_blocked == True
    ).first()
    if blocked_interest:
        raise HTTPException(status_code=403, detail="Этот интерес заблокирован администратором")
    
    # Проверяем, не существует ли уже такой интерес
    existing_interest = db.query(Interest).filter(Interest.name == interest_name).first()
    if existing_interest:
        # Если интерес существует, возвращаем его
        return existing_interest
    
    # Создаем новый интерес
    interest = Interest(
        name=interest_name,
        is_active=True,
        is_blocked=False,
        created_by_user_id=current_user.id
    )
    db.add(interest)
    db.commit()
    db.refresh(interest)
    return interest

@app.get("/api/interests/popular")
async def get_popular_interests(
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Получение популярных активных интересов (доступен всем)"""
    interests = db.query(Interest).filter(
        Interest.is_active == True
    ).order_by(Interest.created_at.desc()).limit(limit).all()
    
    return [{"id": interest.id, "name": interest.name} for interest in interests]

# Публичный API для получения списка пользователей (доступен всем)
@app.get("/api/settings/public")
async def get_public_settings(db: Session = Depends(get_db)):
    """Получение публичных настроек системы (доступно всем)"""
    public_keys = [
        'welcome_title', 'welcome_subtitle', 'welcome_message', 'site_title', 'site_description',
        'button_preregistration', 'button_registration', 'button_confirm_participation',
        'button_soon', 'button_participating'
    ]
    settings = db.query(SystemSettings).filter(SystemSettings.key.in_(public_keys)).all()
    
    # Преобразуем список в словарь для удобства использования
    settings_dict = {}
    for setting in settings:
        settings_dict[setting.key] = setting.value
    
    return settings_dict

@app.get("/users/")
async def get_public_users(db: Session = Depends(get_db)):
    """Получение публичного списка пользователей с игровой информацией"""
    users = db.query(User).all()
    
    public_users = []
    for user in users:
        public_users.append({
            "id": user.id,
            "gwars_nickname": user.gwars_nickname,
            "gwars_profile_url": user.gwars_profile_url,
            "gwars_verified": user.gwars_verified,
            "avatar_seed": user.avatar_seed,
            "created_at": user.created_at
        })
    
    return public_users

# API endpoint для автодополнения адресов через Dadata
@app.post("/api/suggest-address")
async def suggest_address(
    request_data: dict,
    db: Session = Depends(get_db)
):
    """Автодополнение адресов через Dadata.ru"""
    query = request_data.get("query", "")
    if not query:
        # Тихий фолбэк: нет запроса — нет подсказок
        return {"suggestions": []}
    
    # Проверяем, включено ли автодополнение
    dadata_enabled = db.query(SystemSettings).filter(SystemSettings.key == "dadata_enabled").first()
    if not dadata_enabled or str(dadata_enabled.value).lower() != "true":
        # Тихий фолбэк: подсказки выключены — возвращаем пусто
        return {"suggestions": []}
    
    # Получаем токен
    dadata_token = db.query(SystemSettings).filter(SystemSettings.key == "dadata_token").first()
    if not dadata_token or not dadata_token.value:
        # Тихий фолбэк: нет токена — возвращаем пусто
        return {"suggestions": []}
    
    try:
        import requests
        
        # API Dadata для подсказок адресов
        url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address"
        headers = {
            "Authorization": f"Token {dadata_token.value}",
            "Content-Type": "application/json"
        }
        data = {
            "query": query,
            "count": 10
        }
        
        response = requests.post(url, json=data, headers=headers, timeout=5)
        response.raise_for_status()
        
        suggestions = response.json().get("suggestions", [])
        
        # Форматируем ответ
        result = []
        for suggestion in suggestions:
            result.append({
                "value": suggestion.get("value", ""),
                "unrestricted_value": suggestion.get("unrestricted_value", ""),
                "data": suggestion.get("data", {})
            })
        
        return {"suggestions": result}
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при обращении к Dadata: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка автодополнения: {str(e)}")

# FAQ Categories API endpoints

@app.get("/api/faq/categories", response_model=list[FAQCategoryResponse])
async def get_faq_categories(
    db: Session = Depends(get_db)
):
    """Получение всех активных категорий FAQ (доступно всем)"""
    categories = db.query(FAQCategory).filter(
        FAQCategory.is_active == True
    ).order_by(FAQCategory.order.asc(), FAQCategory.created_at.asc()).all()
    
    return categories

@app.get("/admin/faq/categories", response_model=list[FAQCategoryResponse])
async def get_all_faq_categories(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Получение всех категорий FAQ для администратора"""
    categories = db.query(FAQCategory).order_by(FAQCategory.order.asc(), FAQCategory.created_at.asc()).all()
    return categories

@app.post("/admin/faq/categories", response_model=FAQCategoryResponse)
async def create_faq_category(
    category_data: FAQCategoryCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Создание новой категории FAQ (только для администраторов)"""
    # Проверяем, что категория с таким именем не существует
    existing_category = db.query(FAQCategory).filter(FAQCategory.name == category_data.name).first()
    if existing_category:
        raise HTTPException(status_code=400, detail="Категория с таким именем уже существует")
    
    category = FAQCategory(
        name=category_data.name,
        description=category_data.description,
        order=category_data.order,
        is_active=True
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@app.put("/admin/faq/categories/{category_id}", response_model=FAQCategoryResponse)
async def update_faq_category(
    category_id: int,
    category_data: FAQCategoryUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Обновление категории FAQ (только для администраторов)"""
    category = db.query(FAQCategory).filter(FAQCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Категория FAQ не найдена")
    
    # Проверяем, что новое имя не конфликтует с существующими
    if category_data.name and category_data.name != category.name:
        existing_category = db.query(FAQCategory).filter(
            FAQCategory.name == category_data.name,
            FAQCategory.id != category_id
        ).first()
        if existing_category:
            raise HTTPException(status_code=400, detail="Категория с таким именем уже существует")
    
    if category_data.name is not None:
        category.name = category_data.name
    if category_data.description is not None:
        category.description = category_data.description
    if category_data.order is not None:
        category.order = category_data.order
    if category_data.is_active is not None:
        category.is_active = category_data.is_active
    
    category.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(category)
    return category

@app.delete("/admin/faq/categories/{category_id}")
async def delete_faq_category(
    category_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Удаление категории FAQ (только для администраторов)"""
    category = db.query(FAQCategory).filter(FAQCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Категория FAQ не найдена")
    
    # Проверяем, есть ли FAQ в этой категории
    faq_in_category = db.query(FAQ).filter(FAQ.category_id == category_id).first()
    if faq_in_category:
        raise HTTPException(status_code=400, detail="Нельзя удалить категорию, в которой есть FAQ. Сначала переместите или удалите все FAQ из этой категории.")
    
    db.delete(category)
    db.commit()
    return {"message": "Категория FAQ успешно удалена"}

# FAQ API endpoints

@app.get("/api/faq", response_model=list[FAQResponse])
async def get_faq(
    category_id: int | None = None,
    db: Session = Depends(get_db)
):
    """Получение всех активных FAQ (доступно всем)"""
    query = db.query(FAQ).filter(FAQ.is_active == True)
    
    if category_id:
        query = query.filter(FAQ.category_id == category_id)
    
    # Сортировка: сначала по order (меньше = выше), потом по question (алфавит)
    faq_items = query.order_by(FAQ.order.asc(), FAQ.question.asc()).all()
    
    # Загружаем информацию о категориях
    for faq in faq_items:
        if faq.category_id:
            faq.category = db.query(FAQCategory).filter(FAQCategory.id == faq.category_id).first()
    
    return faq_items

@app.get("/admin/faq", response_model=list[FAQResponse])
async def get_all_faq(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Получение всех FAQ для администратора"""
    # Сортировка: сначала по order (меньше = выше), потом по question (алфавит)
    faq_items = db.query(FAQ).order_by(FAQ.order.asc(), FAQ.question.asc()).all()
    
    # Загружаем информацию о категориях
    for faq in faq_items:
        if faq.category_id:
            faq.category = db.query(FAQCategory).filter(FAQCategory.id == faq.category_id).first()
    
    return faq_items

@app.post("/admin/faq", response_model=FAQResponse)
async def create_faq(
    faq_data: FAQCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Создание нового FAQ (только для администраторов)"""
    # Проверяем, что категория существует, если указана
    if faq_data.category_id:
        category = db.query(FAQCategory).filter(FAQCategory.id == faq_data.category_id).first()
        if not category:
            raise HTTPException(status_code=400, detail="Указанная категория не найдена")
    
    faq = FAQ(
        question=faq_data.question,
        answer=faq_data.answer,
        category_id=faq_data.category_id,
        order=faq_data.order,
        is_active=True,
        created_by_user_id=faq_data.created_by_user_id
    )
    db.add(faq)
    db.commit()
    db.refresh(faq)
    
    # Загружаем информацию о категории
    if faq.category_id:
        faq.category = db.query(FAQCategory).filter(FAQCategory.id == faq.category_id).first()
    
    return faq

@app.put("/admin/faq/{faq_id}", response_model=FAQResponse)
async def update_faq(
    faq_id: int,
    faq_data: FAQUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Обновление FAQ (только для администраторов)"""
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ не найден")
    
    # Проверяем, что категория существует, если указана
    if faq_data.category_id is not None:
        if faq_data.category_id:
            category = db.query(FAQCategory).filter(FAQCategory.id == faq_data.category_id).first()
            if not category:
                raise HTTPException(status_code=400, detail="Указанная категория не найдена")
    
    if faq_data.question is not None:
        faq.question = faq_data.question
    if faq_data.answer is not None:
        faq.answer = faq_data.answer
    if faq_data.category_id is not None:
        faq.category_id = faq_data.category_id
    if faq_data.is_active is not None:
        faq.is_active = faq_data.is_active
    if faq_data.order is not None:
        faq.order = faq_data.order
    
    faq.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(faq)
    
    # Загружаем информацию о категории
    if faq.category_id:
        faq.category = db.query(FAQCategory).filter(FAQCategory.id == faq.category_id).first()
    
    return faq

@app.delete("/admin/faq/{faq_id}")
async def delete_faq(
    faq_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Удаление FAQ (только для администраторов)"""
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ не найден")
    
    db.delete(faq)
    db.commit()
    return {"message": "FAQ удален"}



@app.get("/api/test")
async def test_endpoint():
    """Тестовый эндпоинт для проверки работы сервера"""
    return {"message": "Server is working", "status": "ok"}

@app.get("/api/faq/test")
async def test_faq(db: Session = Depends(get_db)):
    """Тестовый эндпоинт для проверки FAQ"""
    try:
        count = db.query(FAQ).count()
        return {"message": f"FAQ table has {count} items", "status": "ok"}
    except Exception as e:
        return {"message": f"Error: {str(e)}", "status": "error"}



# Telegram Bot API endpoints

@app.get("/admin/telegram/bot", response_model=TelegramBotResponse | None)
async def get_telegram_bot(current_user: User = Depends(get_current_admin_user)):
    """Получить настройки Telegram бота"""
    db = SessionLocal()
    try:
        bot = db.query(TelegramBot).first()
        if bot:
            return bot
        return None
    finally:
        db.close()


# Админ-эндпоинты для управления сезонными словами
@app.get("/admin/season-words")
async def list_season_words(current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    words = db.query(SeasonWord).order_by(SeasonWord.created_at.desc()).all()
    return [
        {"id": w.id, "original": w.original, "normalized": w.normalized, "created_at": w.created_at}
        for w in words
    ]

class WordsPayload(BaseModel):
    words: list[str]

@app.post("/admin/season-words")
async def add_season_words(payload: WordsPayload, current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    added = []
    for raw in payload.words:
        norm = re.sub(r"[^0-9A-Za-zА-Яа-я]+", "", (raw or ""), flags=re.UNICODE).lower()
        if not norm:
            continue
        # Пропускаем дубликаты нормализованных слов
        exists = db.query(SeasonWord).filter(SeasonWord.normalized == norm).first()
        if exists:
            continue
        w = SeasonWord(original=raw, normalized=norm)
        db.add(w)
        added.append(norm)
    db.commit()
    return {"added": added}

class CsvPayload(BaseModel):
    csv: str

@app.post("/admin/season-words/import")
async def import_season_words(payload: CsvPayload, current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    content = payload.csv or ""
    # Разделители: запятая, точка с запятой, перевод строки
    parts = re.split(r"[\n,;]+", content)
    words = [p.strip() for p in parts if p.strip()]
    return await add_season_words(WordsPayload(words=words), current_admin=current_admin, db=db)

@app.delete("/admin/season-words/{word_id}")
async def delete_season_word(word_id: int, current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    w = db.query(SeasonWord).filter(SeasonWord.id == word_id).first()
    if not w:
        raise HTTPException(status_code=404, detail="Word not found")
    db.delete(w)
    db.commit()
    return {"deleted": word_id}

@app.post("/admin/telegram/bot", response_model=TelegramBotResponse)
async def create_or_update_telegram_bot(
    bot_data: TelegramBotCreate,
    current_user: User = Depends(get_current_admin_user)
):
    """Создать или обновить настройки Telegram бота"""
    db = SessionLocal()
    try:
        # Проверяем валидность токена
        telegram_bot = create_telegram_bot(bot_data.bot_token)
        if not telegram_bot:
            raise HTTPException(status_code=400, detail="Неверный токен Telegram бота")
        
        # Получаем информацию о боте
        bot_info = telegram_bot.get_bot_info()
        if not bot_info:
            raise HTTPException(status_code=400, detail="Не удалось получить информацию о боте")
        
        # Проверяем, есть ли уже бот в базе
        existing_bot = db.query(TelegramBot).first()
        
        if existing_bot:
            # Обновляем существующего бота
            existing_bot.bot_token = bot_data.bot_token
            existing_bot.bot_username = bot_info.get("username")
            existing_bot.is_active = True
            existing_bot.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(existing_bot)
            return existing_bot
        else:
            # Создаем нового бота
            new_bot = TelegramBot(
                bot_token=bot_data.bot_token,
                bot_username=bot_info.get("username"),
                is_active=True
            )
            db.add(new_bot)
            db.commit()
            db.refresh(new_bot)
            return new_bot
            
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка сохранения настроек бота: {str(e)}")
    finally:
        db.close()


@app.put("/admin/telegram/bot/{bot_id}", response_model=TelegramBotResponse)
async def update_telegram_bot(
    bot_id: int,
    bot_data: TelegramBotUpdate,
    current_user: User = Depends(get_current_admin_user)
):
    """Обновить настройки Telegram бота"""
    db = SessionLocal()
    try:
        bot = db.query(TelegramBot).filter(TelegramBot.id == bot_id).first()
        if not bot:
            raise HTTPException(status_code=404, detail="Telegram бот не найден")
        
        # Если обновляется токен, проверяем его валидность
        if bot_data.bot_token:
            telegram_bot = create_telegram_bot(bot_data.bot_token)
            if not telegram_bot:
                raise HTTPException(status_code=400, detail="Неверный токен Telegram бота")
            
            bot_info = telegram_bot.get_bot_info()
            if not bot_info:
                raise HTTPException(status_code=400, detail="Не удалось получить информацию о боте")
            
            bot.bot_token = bot_data.bot_token
            bot.bot_username = bot_info.get("username")
        
        if bot_data.is_active is not None:
            bot.is_active = bot_data.is_active
        
        bot.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(bot)
        return bot
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка обновления настроек бота: {str(e)}")
    finally:
        db.close()


@app.get("/admin/telegram/users", response_model=list[TelegramUserResponse])
async def get_telegram_users(current_user: User = Depends(get_current_admin_user)):
    """Получить список пользователей, подписанных на Telegram уведомления"""
    db = SessionLocal()
    try:
        telegram_users = db.query(TelegramUser).all()
        return telegram_users
    finally:
        db.close()


@app.post("/api/telegram/subscribe")
async def subscribe_to_telegram(
    telegram_data: TelegramUserCreate,
    current_user: User = Depends(get_current_user)
):
    """Подписаться на Telegram уведомления"""
    db = SessionLocal()
    try:
        # Проверяем, не подписан ли уже пользователь
        existing_subscription = db.query(TelegramUser).filter(
            TelegramUser.user_id == current_user.id
        ).first()
        
        if existing_subscription:
            # Обновляем существующую подписку
            existing_subscription.telegram_id = telegram_data.telegram_id
            existing_subscription.telegram_username = telegram_data.telegram_username
            existing_subscription.is_active = True
            existing_subscription.subscribed_at = datetime.utcnow()
        else:
            # Создаем новую подписку
            new_subscription = TelegramUser(
                user_id=current_user.id,
                telegram_id=telegram_data.telegram_id,
                telegram_username=telegram_data.telegram_username,
                is_active=True
            )
            db.add(new_subscription)
        
        db.commit()
        return {"message": "Подписка на Telegram уведомления активирована"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка подписки: {str(e)}")
    finally:
        db.close()


@app.delete("/api/telegram/unsubscribe")
async def unsubscribe_from_telegram(current_user: User = Depends(get_current_user)):
    """Отписаться от Telegram уведомлений"""
    db = SessionLocal()
    try:
        subscription = db.query(TelegramUser).filter(
            TelegramUser.user_id == current_user.id
        ).first()
        
        if subscription:
            subscription.is_active = False
            db.commit()
            return {"message": "Подписка на Telegram уведомления отключена"}
        else:
            raise HTTPException(status_code=404, detail="Подписка не найдена")
            
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка отписки: {str(e)}")
    finally:
        db.close()


@app.post("/admin/telegram/send-notification")
async def send_telegram_notification(
    notification: TelegramNotificationRequest,
    current_user: User = Depends(get_current_admin_user)
):
    """Отправить уведомление всем подписанным пользователям"""
    db = SessionLocal()
    try:
        # Получаем настройки бота
        bot_settings = db.query(TelegramBot).first()
        if not bot_settings or not bot_settings.is_active:
            raise HTTPException(status_code=400, detail="Telegram бот не настроен или неактивен")
        
        # Создаем экземпляр бота
        telegram_bot = TelegramBot(bot_settings.bot_token)
        
        # Получаем список подписанных пользователей
        telegram_users = db.query(TelegramUser).filter(
            TelegramUser.is_active == True
        ).all()
        
        if not telegram_users:
            return {"message": "Нет активных подписчиков", "sent": 0}
        
        # Отправляем уведомления
        results = telegram_bot.send_notification_to_all(
            [{"telegram_id": user.telegram_id, "user_id": user.user_id} for user in telegram_users],
            notification.message
        )
        
        # Обновляем время последнего уведомления
        for user in telegram_users:
            user.last_notification = datetime.utcnow()
        
        db.commit()
        
        return {
            "message": f"Уведомления отправлены",
            "sent": results["success"],
            "failed": results["failed"],
            "errors": results["errors"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка отправки уведомлений: {str(e)}")
    finally:
        db.close()


@app.post("/admin/telegram/send-event-notification/{event_id}")
async def send_event_notification(
    event_id: int,
    notification_type: str,
    current_user: User = Depends(get_current_admin_user)
):
    """Отправить уведомление о мероприятии"""
    db = SessionLocal()
    try:
        # Получаем мероприятие
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Мероприятие не найдено")
        
        # Получаем настройки бота
        bot_settings = db.query(TelegramBot).first()
        if not bot_settings or not bot_settings.is_active:
            raise HTTPException(status_code=400, detail="Telegram бот не настроен или неактивен")
        
        # Создаем экземпляр бота
        telegram_bot = TelegramBot(bot_settings.bot_token)
        
        # Получаем список подписанных пользователей
        telegram_users = db.query(TelegramUser).filter(
            TelegramUser.is_active == True
        ).all()
        
        if not telegram_users:
            return {"message": "Нет активных подписчиков", "sent": 0}
        
        # Отправляем уведомления о мероприятии
        results = telegram_bot.send_event_notification(
            [{"telegram_id": user.telegram_id, "user_id": user.user_id} for user in telegram_users],
            {
                "name": event.name,
                "description": event.description,
                "preregistration_start": event.preregistration_start.isoformat() if event.preregistration_start else None,
                "registration_start": event.registration_start.isoformat() if event.registration_start else None,
                "registration_end": event.registration_end.isoformat() if event.registration_end else None,
            },
            notification_type
        )
        
        # Обновляем время последнего уведомления
        for user in telegram_users:
            user.last_notification = datetime.utcnow()
        
        db.commit()
        
        return {
            "message": f"Уведомления о мероприятии отправлены",
            "sent": results["success"],
            "failed": results["failed"],
            "errors": results["errors"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка отправки уведомлений: {str(e)}")
    finally:
        db.close()


# Site Icon API endpoints

@app.get("/admin/site-icon", response_model=SiteIconResponse | None)
async def get_site_icon(current_user: User = Depends(get_current_admin_user)):
    """Получить текущую иконку сайта"""
    db = SessionLocal()
    try:
        icon = db.query(SiteIcon).filter(SiteIcon.is_active == True).first()
        if icon:
            return icon
        return None
    finally:
        db.close()


@app.post("/admin/site-icon/upload", response_model=SiteIconResponse)
async def upload_site_icon(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin_user)
):
    """Загрузить новую иконку сайта"""
    db = SessionLocal()
    try:
        # Проверяем тип файла
        if file.content_type not in ALLOWED_ICON_TYPES:
            raise HTTPException(
                status_code=400, 
                detail=f"Неподдерживаемый тип файла. Разрешены: {', '.join(ALLOWED_ICON_TYPES)}"
            )
        
        # Проверяем размер файла
        file_content = await file.read()
        if len(file_content) > MAX_ICON_SIZE:
            raise HTTPException(
                status_code=400, 
                detail=f"Файл слишком большой. Максимальный размер: {MAX_ICON_SIZE // (1024*1024)}MB"
            )
        
        # Генерируем уникальное имя файла
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(ICON_DIR, unique_filename)
        
        # Сохраняем файл
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
        
        # Деактивируем предыдущую иконку
        existing_icons = db.query(SiteIcon).filter(SiteIcon.is_active == True).all()
        for icon in existing_icons:
            icon.is_active = False
        
        # Создаем новую запись об иконке
        new_icon = SiteIcon(
            filename=unique_filename,
            original_filename=file.filename,
            file_size=len(file_content),
            mime_type=file.content_type,
            is_active=True,
            uploaded_by_user_id=current_user.id
        )
        
        db.add(new_icon)
        db.commit()
        db.refresh(new_icon)
        
        return new_icon
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        # Удаляем файл в случае ошибки
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Ошибка загрузки иконки: {str(e)}")
    finally:
        db.close()


@app.delete("/admin/site-icon/{icon_id}")
async def delete_site_icon(
    icon_id: int,
    current_user: User = Depends(get_current_admin_user)
):
    """Удалить иконку сайта"""
    db = SessionLocal()
    try:
        icon = db.query(SiteIcon).filter(SiteIcon.id == icon_id).first()
        if not icon:
            raise HTTPException(status_code=404, detail="Иконка не найдена")
        
        # Удаляем файл
        file_path = os.path.join(ICON_DIR, icon.filename)
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Удаляем запись из базы
        db.delete(icon)
        db.commit()
        
        return {"message": "Иконка удалена"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка удаления иконки: {str(e)}")
    finally:
        db.close()


@app.get("/api/site-icon")
async def get_current_site_icon():
    """Получить текущую активную иконку сайта (публичный endpoint)"""
    db = SessionLocal()
    try:
        icon = db.query(SiteIcon).filter(SiteIcon.is_active == True).first()
        if not icon:
            raise HTTPException(status_code=404, detail="Иконка не найдена")
        
        file_path = os.path.join(ICON_DIR, icon.filename)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Файл иконки не найден")
        
        from fastapi.responses import FileResponse
        return FileResponse(
            file_path,
            media_type=icon.mime_type,
            filename=icon.original_filename
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения иконки: {str(e)}")
    finally:
        db.close()


# Dashboard Statistics API
@app.get("/admin/dashboard/stats")
async def get_dashboard_stats(current_user: User = Depends(get_current_admin)):
    """Получить статистику для дашборда администратора"""
    db = SessionLocal()
    try:
        # Общая статистика пользователей
        total_users = db.query(User).count()
        active_users = db.query(User).filter(User.is_active == True).count()
        verified_users = db.query(User).filter(User.gwars_verified == True).count()
        admin_users = db.query(User).filter(User.role == "admin").count()
        
        # Статистика по ролям
        user_roles = db.query(User.role, func.count(User.id)).group_by(User.role).all()
        
        # Статистика мероприятий
        total_events = db.query(Event).count()
        active_events = db.query(Event).filter(Event.is_active == True).count()
        
        # Статистика регистраций на мероприятия
        total_registrations = db.query(EventRegistration).count()
        preregistrations = db.query(EventRegistration).filter(EventRegistration.registration_type == "preregistration").count()
        confirmed_registrations = db.query(EventRegistration).filter(EventRegistration.is_confirmed == True).count()
        
        # Статистика интересов (с проверкой существования таблицы)
        try:
            total_interests = db.query(Interest).count()
            active_interests = db.query(Interest).filter(Interest.is_active == True).count()
        except Exception:
            total_interests = 0
            active_interests = 0
        
        # Статистика FAQ (с проверкой существования таблицы)
        try:
            total_faq = db.query(FAQ).count()
            active_faq = db.query(FAQ).filter(FAQ.is_active == True).count()
        except Exception:
            total_faq = 0
            active_faq = 0
        
        # Статистика Telegram (с проверкой существования таблицы)
        try:
            telegram_subscribers = db.query(TelegramUser).filter(TelegramUser.is_active == True).count()
        except Exception:
            telegram_subscribers = 0
        
        # Статистика по месяцам (регистрации пользователей)
        from datetime import datetime, timedelta
        current_date = datetime.utcnow()
        six_months_ago = current_date - timedelta(days=180)
        
        monthly_registrations = db.query(
            func.strftime('%Y-%m', User.created_at).label('month'),
            func.count(User.id).label('count')
        ).filter(
            User.created_at >= six_months_ago
        ).group_by(
            func.strftime('%Y-%m', User.created_at)
        ).order_by('month').all()
        
        # Последние активные пользователи
        recent_users = db.query(User).order_by(User.created_at.desc()).limit(5).all()
        
        # Последние мероприятия
        recent_events = db.query(Event).order_by(Event.created_at.desc()).limit(5).all()
        
        return {
            "users": {
                "total": total_users,
                "active": active_users,
                "verified": verified_users,
                "admins": admin_users,
                "roles": [{"role": role, "count": count} for role, count in user_roles]
            },
            "events": {
                "total": total_events,
                "active": active_events
            },
            "registrations": {
                "total": total_registrations,
                "preregistrations": preregistrations,
                "confirmed": confirmed_registrations
            },
            "interests": {
                "total": total_interests,
                "active": active_interests
            },
            "faq": {
                "total": total_faq,
                "active": active_faq
            },
            "telegram": {
                "subscribers": telegram_subscribers
            },
            "charts": {
                "monthly_registrations": [{"month": month, "count": count} for month, count in monthly_registrations]
            },
            "recent": {
                "users": [
                    {
                        "id": user.id,
                        "email": user.email,
                        "name": user.name,
                        "role": user.role,
                        "created_at": user.created_at.isoformat(),
                        "gwars_verified": user.gwars_verified
                    } for user in recent_users
                ],
                "events": [
                    {
                        "id": event.id,
                        "title": event.name,
                        "unique_id": event.unique_id,
                        "created_at": event.created_at.isoformat(),
                        "is_active": event.is_active
                    } for event in recent_events
                ]
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения статистики: {str(e)}")
    finally:
        db.close()

# API endpoints для управления назначениями подарков
@app.post("/admin/events/{event_id}/gift-assignments/generate")
async def generate_gift_assignments_endpoint(
    event_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Генерирует случайные назначения подарков для мероприятия"""
    try:
        assignments = generate_gift_assignments(event_id, db)
        return {"message": f"Создано {len(assignments)} назначений подарков", "assignments": len(assignments)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при генерации назначений: {str(e)}")

@app.get("/admin/events/{event_id}/gift-assignments", response_model=list[GiftAssignmentResponse])
async def get_gift_assignments(
    event_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Получает все назначения подарков для мероприятия"""
    assignments_data = get_gift_assignments_with_details(event_id, db)
    return assignments_data

@app.put("/admin/gift-assignments/{assignment_id}")
async def update_gift_assignment(
    assignment_id: int,
    assignment_update: GiftAssignmentUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Обновляет назначение подарка"""
    assignment = db.query(GiftAssignment).filter(GiftAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Назначение не найдено")
    
    if assignment_update.giver_id is not None:
        assignment.giver_id = assignment_update.giver_id
    if assignment_update.receiver_id is not None:
        assignment.receiver_id = assignment_update.receiver_id
    if assignment_update.is_approved is not None:
        assignment.is_approved = assignment_update.is_approved
        if assignment_update.is_approved:
            assignment.approved_at = datetime.utcnow()
            assignment.approved_by = current_user.id
    
    db.commit()
    return {"message": "Назначение обновлено"}

@app.post("/admin/gift-assignments/{assignment_id}/approve")
async def approve_gift_assignment(
    assignment_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Утверждает назначение подарка"""
    assignment = db.query(GiftAssignment).filter(GiftAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Назначение не найдено")
    
    assignment.is_approved = True
    assignment.approved_at = datetime.utcnow()
    assignment.approved_by = current_user.id
    
    db.commit()
    return {"message": "Назначение утверждено"}

@app.post("/admin/events/{event_id}/gift-assignments/approve-all")
async def approve_all_gift_assignments(
    event_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Утверждает все назначения подарков для мероприятия"""
    assignments = db.query(GiftAssignment).filter(
        GiftAssignment.event_id == event_id,
        GiftAssignment.is_approved == False
    ).all()
    
    if not assignments:
        raise HTTPException(status_code=404, detail="Нет неутвержденных назначений")
    
    for assignment in assignments:
        assignment.is_approved = True
        assignment.approved_at = datetime.utcnow()
        assignment.approved_by = current_user.id
    
    db.commit()
    
    # Отправляем уведомления пользователям
    try:
        telegram_bot = create_telegram_bot(db)
        if telegram_bot:
            for assignment in assignments:
                # Уведомление дарителю
                giver = db.query(User).filter(User.id == assignment.giver_id).first()
                receiver = db.query(User).filter(User.id == assignment.receiver_id).first()
                event = db.query(Event).filter(Event.id == event_id).first()
                
                if giver and receiver and event:
                    message = f"""🎁 Назначение подарка утверждено!

Мероприятие: {event.name}
Вы дарите подарок: {receiver.full_name or receiver.name}
Адрес получателя: {receiver.address}

Пожалуйста, отправьте подарок по указанному адресу."""
                    
                    telegram_bot.send_notification_to_user(giver.id, message)
    except Exception as e:
        print(f"Ошибка при отправке уведомлений: {e}")
    
    return {"message": f"Утверждено {len(assignments)} назначений"}

@app.delete("/admin/gift-assignments/{assignment_id}")
async def delete_gift_assignment(
    assignment_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Удаляет назначение подарка"""
    assignment = db.query(GiftAssignment).filter(GiftAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Назначение не найдено")
    
    db.delete(assignment)
    db.commit()
    return {"message": "Назначение удалено"}

@app.get("/user/gift-assignments", response_model=list[GiftAssignmentResponse])
async def get_user_gift_assignments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получает назначения подарков для текущего пользователя"""
    # Назначения где пользователь дарит
    giver_assignments = db.query(GiftAssignment).filter(
        GiftAssignment.giver_id == current_user.id,
        GiftAssignment.is_approved == True
    ).all()
    
    # Назначения где пользователь получает
    receiver_assignments = db.query(GiftAssignment).filter(
        GiftAssignment.receiver_id == current_user.id,
        GiftAssignment.is_approved == True
    ).all()
    
    result = []
    
    # Добавляем назначения где пользователь дарит
    for assignment in giver_assignments:
        receiver = db.query(User).filter(User.id == assignment.receiver_id).first()
        event = db.query(Event).filter(Event.id == assignment.event_id).first()
        
        assignment_data = {
            "id": assignment.id,
            "event_id": assignment.event_id,
            "giver_id": assignment.giver_id,
            "receiver_id": assignment.receiver_id,
            "is_approved": assignment.is_approved,
            "created_at": assignment.created_at,
            "approved_at": assignment.approved_at,
            "approved_by": assignment.approved_by,
            "giver_name": current_user.full_name or current_user.name,
            "giver_email": current_user.email,
            "receiver_name": receiver.full_name or receiver.name if receiver else None,
            "receiver_email": receiver.email if receiver else None,
            "receiver_address": receiver.address if receiver else None,
            "event_name": event.name if event else None,
            "assignment_type": "giver"  # Тип назначения
        }
        result.append(assignment_data)
    
    # Добавляем назначения где пользователь получает
    for assignment in receiver_assignments:
        giver = db.query(User).filter(User.id == assignment.giver_id).first()
        event = db.query(Event).filter(Event.id == assignment.event_id).first()
        
        assignment_data = {
            "id": assignment.id,
            "event_id": assignment.event_id,
            "giver_id": assignment.giver_id,
            "receiver_id": assignment.receiver_id,
            "is_approved": assignment.is_approved,
            "created_at": assignment.created_at,
            "approved_at": assignment.approved_at,
            "approved_by": assignment.approved_by,
            "giver_name": giver.full_name or giver.name if giver else None,
            "giver_email": giver.email if giver else None,
            "receiver_name": current_user.full_name or current_user.name,
            "receiver_email": current_user.email,
            "receiver_address": current_user.address,
            "event_name": event.name if event else None,
            "assignment_type": "receiver"  # Тип назначения
        }
        result.append(assignment_data)
    
    return result


# Test Users Management
@app.post("/admin/generate-testing")
async def generate_test_users(
    count: int = 10,
    password: str = "test123",
    current_user: User = Depends(get_current_admin_user)
):
    """Генерация тестовых пользователей для ручного тестирования"""
    if count < 1 or count > 100:
        raise HTTPException(status_code=400, detail="Количество пользователей должно быть от 1 до 100")
    
    db = SessionLocal()
    try:
        generated_users = []
        
        for i in range(count):
            # Проверяем, не существует ли уже пользователь с таким email
            existing_user = db.query(User).filter(User.email == f"test_user_{i+1}@test.com").first()
            if existing_user:
                continue
                
            # Создаем нового тестового пользователя
            hashed_password = pwd_context.hash(password)
            avatar_seed = f"test_user_{i+1}"
            
            new_user = User(
                email=f"test_user_{i+1}@test.com",
                hashed_password=hashed_password,
                name=f"Тестовый пользователь {i+1}",
                wishlist=f"Тестовые интересы пользователя {i+1}",
                role="user",
                is_active=True,
                gwars_profile_url=f"https://www.gwars.io/info.php?id={1000+i}",
                gwars_nickname=f"TestPlayer_{i+1}",
                full_name=f"Тестовый Пользователь {i+1}",
                address=f"Тестовый адрес {i+1}",
                interests=f"Тест, Игры, Развлечения",
                profile_completed=True,
                gwars_verification_token=f"test_token_{i+1}",
                gwars_verified=True,
                avatar_seed=avatar_seed,
                phone_number=f"+7-900-{100+i:03d}-{1000+i:04d}",
                telegram_username=f"@test_user_{i+1}",
                is_test=True
            )
            
            db.add(new_user)
            generated_users.append(new_user)
        
        db.commit()
        
        return {
            "message": f"Создано {len(generated_users)} тестовых пользователей",
            "count": len(generated_users),
            "password": password,
            "users": [
                {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name
                }
                for user in generated_users
            ]
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка создания тестовых пользователей: {str(e)}")
    finally:
        db.close()


@app.delete("/admin/delete-testing")
async def delete_test_users(current_user: User = Depends(get_current_admin_user)):
    """Удаление всех тестовых пользователей"""
    db = SessionLocal()
    try:
        # Находим всех тестовых пользователей
        test_users = db.query(User).filter(User.is_test == True).all()
        
        if not test_users:
            return {"message": "Тестовые пользователи не найдены", "deleted_count": 0}
        
        # Удаляем регистрации тестовых пользователей
        for user in test_users:
            db.query(EventRegistration).filter(EventRegistration.user_id == user.id).delete()
            db.query(GiftAssignment).filter(
                (GiftAssignment.giver_id == user.id) | 
                (GiftAssignment.receiver_id == user.id)
            ).delete()
        
        # Удаляем самих пользователей
        deleted_count = len(test_users)
        db.query(User).filter(User.is_test == True).delete()
        
        db.commit()
        
        return {
            "message": f"Удалено {deleted_count} тестовых пользователей",
            "deleted_count": deleted_count
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка удаления тестовых пользователей: {str(e)}")
    finally:
        db.close()


@app.get("/admin/testing")
async def get_test_users(current_user: User = Depends(get_current_admin_user)):
    """Получение списка тестовых пользователей"""
    db = SessionLocal()
    try:
        test_users = db.query(User).filter(User.is_test == True).all()
        
        return {
            "count": len(test_users),
            "users": [
                {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "gwars_nickname": user.gwars_nickname,
                    "is_active": user.is_active,
                    "is_test": user.is_test,
                    "created_at": user.created_at.isoformat() if user.created_at else None
                }
                for user in test_users
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения тестовых пользователей: {str(e)}")
    finally:
        db.close()


# Mount static files for React app
# Проверяем разные возможные пути к собранному фронтенду
frontend_dirs = [
    "../build",  # Build в корне проекта (для PythonAnywhere)
    "build",     # Build в папке backend
    "dist",      # Старый путь
    "../dist"    # Dist в корне проекта
]

frontend_dir = None
frontend_served = False
for candidate_dir in frontend_dirs:
    if os.path.exists(candidate_dir):
        frontend_dir = candidate_dir
        frontend_served = True
        break

# Mount static files (CSS, JS, images)
if frontend_dir:
    # Монтируем статические файлы из папки static
    static_path = os.path.join(frontend_dir, "static")
    if os.path.exists(static_path):
        app.mount("/static", StaticFiles(directory=static_path), name="static_files")
    
    # Монтируем остальные статические файлы напрямую (favicon.ico, manifest.json, и т.д.)
    # Но только если они существуют, чтобы не конфликтовать с catch-all роутом
    @app.get("/favicon.ico")
    @app.get("/manifest.json")
    @app.get("/robots.txt")
    async def serve_static_files(request: Request):
        """Обработка статических файлов в корне"""
        file_path = request.url.path.lstrip('/')
        full_path = os.path.join(frontend_dir, file_path)
        if os.path.exists(full_path) and os.path.isfile(full_path):
            from fastapi.responses import FileResponse
            return FileResponse(full_path)
        raise HTTPException(status_code=404)

# Mount uploads directory for serving uploaded files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Catch-all роут для SPA (должен быть последним!)
# Этот роут возвращает index.html для всех путей, которые не являются API endpoints
if frontend_dir:
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str, request: Request):
        """
        Catch-all роут для SPA - возвращает index.html для всех маршрутов,
        которые не являются API endpoints или статическими файлами
        """
        try:
            # Список префиксов, которые обрабатываются API
            # Важно: проверяем точное совпадение или начало пути
            api_prefixes = [
                "api", "auth", "admin", "events", "users", "profile", "uploads", 
                "docs", "openapi.json", "redoc"
            ]
            
            # Разбиваем путь на части
            path_parts = full_path.strip('/').split('/')
            first_part = path_parts[0] if path_parts else ''
            
            # Проверяем, не является ли это API запросом
            # Проверяем первый сегмент пути или полное совпадение
            if any(first_part == prefix or full_path.startswith(f'/{prefix}/') or full_path == f'/{prefix}' for prefix in api_prefixes):
                raise HTTPException(status_code=404, detail="Not found")
            
            # Проверяем, не является ли это статическим файлом
            # Если путь содержит точку и не является известным роутом, возможно это файл
            if '.' in full_path.split('/')[-1] and not full_path.endswith('.html'):
                file_path = os.path.join(frontend_dir, full_path)
                if os.path.exists(file_path) and os.path.isfile(file_path):
                    from fastapi.responses import FileResponse
                    return FileResponse(file_path)
            
            # Для всех остальных запросов возвращаем index.html (SPA роутинг)
            index_path = os.path.join(frontend_dir, "index.html")
            if os.path.exists(index_path):
                from fastapi.responses import FileResponse
                return FileResponse(index_path)
            else:
                # Если index.html не найден, возвращаем информативное сообщение
                error_msg = f"Frontend not found. Build directory: {frontend_dir}, exists: {os.path.exists(frontend_dir)}"
                print(f"ERROR: {error_msg}")
                return JSONResponse(
                    status_code=500,
                    content={
                        "error": "Frontend not found",
                        "message": "Please build the frontend and ensure build/ directory is in the project root",
                        "build_dir": frontend_dir,
                        "build_dir_exists": os.path.exists(frontend_dir)
                    }
                )
        except HTTPException:
            raise
        except Exception as e:
            # Логируем ошибку для отладки
            error_msg = f"Error in serve_frontend: {str(e)}"
            print(f"ERROR: {error_msg}")
            import traceback
            traceback.print_exc()
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Internal server error",
                    "message": str(e),
                    "path": full_path,
                    "frontend_dir": frontend_dir
                }
            )
else:
    # Если frontend_dir не найден, добавляем catch-all роут, который вернет ошибку
    @app.get("/{full_path:path}")
    async def serve_frontend_missing(full_path: str, request: Request):
        """Обработчик для случая, когда frontend не собран"""
        # Проверяем, не является ли это API запросом
        api_prefixes = ["api", "auth", "admin", "events", "users", "profile", "uploads", "docs", "openapi.json", "redoc"]
        path_parts = full_path.strip('/').split('/')
        first_part = path_parts[0] if path_parts else ''
        
        if any(first_part == prefix or full_path.startswith(f'/{prefix}/') or full_path == f'/{prefix}' for prefix in api_prefixes):
            raise HTTPException(status_code=404, detail="Not found")
        
        # Если это не API запрос, возвращаем ошибку о отсутствии фронтенда
        return JSONResponse(
            status_code=500,
            content={
                "error": "Frontend not found",
                "message": "Frontend build directory not found. Please build the frontend: npm run build",
                "searched_paths": ["../build", "build", "dist", "../dist"],
                "hint": "Make sure build/ directory exists in the project root"
            }
        )

def generate_unique_verification_token(db: Session, user: User) -> str:
    # Деактивируем прошлые токены пользователя (в одной транзакции)
    db.execute(text("UPDATE verification_tokens SET is_active = 0 WHERE user_id = :uid AND is_active = 1"), {"uid": user.id})

    # Получаем настроку количества слов
    words_count_setting = db.query(SystemSettings).filter(SystemSettings.key == "token_words_count").first()
    try:
        words_count = int(words_count_setting.value) if words_count_setting and words_count_setting.value else 3
    except Exception:
        words_count = 3

    # Загружаем список нормализованных слов
    words = [w[0] for w in db.execute(text("SELECT normalized FROM season_words")).fetchall()]

    def build_candidate_from_words() -> str:
        if not words:
            return token_hex(16)  # Fallback: старый hex-токен
        selected = [random.choice(words) for _ in range(max(1, words_count))]
        base = ''.join(selected)
        return ''.join(c.upper() if random.choice([True, False]) else c.lower() for c in base)

    # Генерация уникального токена
    attempts = 0
    while True:
        candidate = build_candidate_from_words()
        exists = db.execute(text("SELECT 1 FROM verification_tokens WHERE token = :t LIMIT 1"), {"t": candidate}).fetchone()
        if not exists:
            break
        attempts += 1
        if attempts > 50:
            # На всякий случай аварийный переход на hex при сильных коллизиях
            candidate = token_hex(16)
            break

    # Обновляем пользователя и вставляем новый активный токен
    db.execute(text("UPDATE users SET gwars_verification_token = :tok WHERE id = :uid"), {"tok": candidate, "uid": user.id})
    db.execute(text("INSERT INTO verification_tokens (user_id, token, is_active, created_at) VALUES (:uid, :tok, 1, :dt)"), {
        "uid": user.id,
        "tok": candidate,
        "dt": datetime.utcnow()
    })
    db.commit()
    return candidate

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)
