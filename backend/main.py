from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime
import os
import uuid
import shutil
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from telegram_bot import TelegramBot, create_telegram_bot

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./santa.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# File upload settings
UPLOAD_DIR = "uploads"
ICON_DIR = os.path.join(UPLOAD_DIR, "icons")
os.makedirs(ICON_DIR, exist_ok=True)

# Allowed file types for icons
ALLOWED_ICON_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon"]
MAX_ICON_SIZE = 5 * 1024 * 1024  # 5MB

# JWT settings
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Database models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
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
    full_name = Column(String)  # ФИО
    address = Column(String)  # Адрес для отправки подарков
    interests = Column(String)  # Интересы пользователя
    profile_completed = Column(Boolean, default=False)  # Заполнен ли профиль
    
    # Верификация GWars.io
    gwars_verification_token = Column(String)  # Токен для верификации
    gwars_verified = Column(Boolean, default=False)  # Верифицирован ли профиль
    
    # Аватарка пользователя
    avatar_seed = Column(String)  # Seed для генерации аватарки DiceBear
    
    # Дополнительные поля профиля (необязательные)
    phone_number = Column(String)  # Номер телефона
    telegram_username = Column(String)  # Никнейм в Telegram

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    unique_id = Column(Integer, unique=True, index=True)  # Уникальный ID для URL (не переиспользуется)
    name = Column(String, index=True)
    description = Column(String)
    preregistration_start = Column(DateTime)  # Дата начала предварительной регистрации
    registration_start = Column(DateTime)     # Дата начала регистрации
    registration_end = Column(DateTime)       # Дата закрытия регистрации
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

class Interest(Base):
    __tablename__ = "interests"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=True)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Кто создал интерес
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class FAQ(Base):
    __tablename__ = "faq"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, nullable=False, index=True)
    answer = Column(String, nullable=False)
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

# Create default admin user
def create_default_admin():
    db = SessionLocal()
    try:
        # Check if admin already exists
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_user = User(
                username="admin",
                email="admin@example.com",
                hashed_password=get_password_hash("admin"),
                name="Администратор",
                wishlist="Управление системой Анонимный Дед Мороз",
                role="admin"
            )
            db.add(admin_user)
            db.commit()
            print("Создан дефолтный администратор: admin/admin")
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
        
        db.commit()
        print("Настройки системы инициализированы")
    except Exception as e:
        print(f"Ошибка при инициализации настроек: {e}")
    finally:
        db.close()

# Create default admin and settings on startup
create_default_admin()
create_default_settings()

# Pydantic models
class UserCreate(BaseModel):
    email: str
    password: str
    confirm_password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    name: str
    wishlist: str
    role: str
    is_active: bool
    created_at: datetime
    # Профиль пользователя
    gwars_profile_url: str | None = None
    gwars_nickname: str | None = None
    full_name: str | None = None
    address: str | None = None
    interests: str | None = None
    profile_completed: bool = False
    
    # Верификация GWars.io
    gwars_verification_token: str | None = None
    gwars_verified: bool = False
    
    # Аватарка пользователя
    avatar_seed: str | None = None
    
    # Дополнительные поля профиля (необязательные)
    phone_number: str | None = None
    telegram_username: str | None = None
    
    class Config:
        from_attributes = True

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

class EventCreate(BaseModel):
    name: str
    description: str = ""
    preregistration_start: datetime
    registration_start: datetime
    registration_end: datetime

class EventUpdate(BaseModel):
    name: str = None
    description: str = None
    preregistration_start: datetime = None
    registration_start: datetime = None
    registration_end: datetime = None
    is_active: bool = None

class EventResponse(BaseModel):
    id: int
    unique_id: int
    name: str
    description: str
    preregistration_start: datetime
    registration_start: datetime
    registration_end: datetime
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

class InterestResponse(BaseModel):
    id: int
    name: str
    is_active: bool
    created_by_user_id: int | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FAQCreate(BaseModel):
    question: str
    answer: str
    order: int = 0
    created_by_user_id: int | None = None


class FAQUpdate(BaseModel):
    question: str | None = None
    answer: str | None = None
    is_active: bool | None = None
    order: int | None = None


class FAQResponse(BaseModel):
    id: int
    question: str
    answer: str
    is_active: bool
    order: int
    created_by_user_id: int | None = None
    created_at: datetime
    updated_at: datetime

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


# FastAPI app
app = FastAPI(title="Анонимный Дед Мороз", version="0.1.1")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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

def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

# Alias for compatibility
get_current_admin_user = get_current_admin

# API endpoints
@app.get("/")
async def root():
    return {"message": "Анонимный Дед Мороз API"}

@app.post("/auth/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Проверяем совпадение паролей
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Пароли не совпадают")
    
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Generate username from email
    username = user.email.split('@')[0]
    
    # Check if username already exists, if so add a number
    original_username = username
    counter = 1
    while db.query(User).filter(User.username == username).first():
        username = f"{original_username}{counter}"
        counter += 1
    
    db_user = User(
        username=username,
        email=user.email,
        hashed_password=get_password_hash(user.password),
        name=username,  # Use email prefix as name
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
        avatar_seed=f"{username}_{user.email}_{datetime.utcnow().timestamp()}"  # Уникальный seed для аватарки
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

@app.get("/users/", response_model=list[UserResponse])
async def get_users(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.is_active == True).all()
    return users

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
    
    user.updated_at = datetime.utcnow()
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
    current_user.gwars_profile_url = step1_data.gwars_profile_url
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

@app.get("/profile/status")
async def get_profile_status(current_user: User = Depends(get_current_user)):
    """Получение статуса заполнения профиля"""
    return {
        "profile_completed": current_user.profile_completed,
        "step1_completed": bool(current_user.gwars_profile_url),
        "step2_completed": bool(current_user.full_name and current_user.address),
        "step2_5_completed": bool(current_user.phone_number or current_user.telegram_username),
        "step3_completed": bool(current_user.interests),
        "next_step": 1 if not current_user.gwars_profile_url else 
                    (2 if not (current_user.full_name and current_user.address) else 
                    (2.5 if not (current_user.phone_number or current_user.telegram_username) else 
                    (3 if not current_user.interests else None)))
    }

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

@app.get("/events/current", response_model=EventResponse)
async def get_current_event(db: Session = Depends(get_db)):
    """Получение ближайшего активного мероприятия"""
    now = datetime.utcnow()
    
    # Ищем активные мероприятия, которые еще не завершились
    active_events = db.query(Event).filter(
        Event.is_active == True,
        Event.registration_end > now
    ).order_by(Event.preregistration_start.asc()).all()
    
    if not active_events:
        raise HTTPException(status_code=404, detail="Нет активных мероприятий")
    
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
        raise HTTPException(status_code=404, detail="Регистрация не найдена")
    
    return {
        "id": registration.id,
        "event_id": registration.event_id,
        "user_id": registration.user_id,
        "is_preregistration": registration.is_preregistration,
        "is_confirmed": registration.is_confirmed,
        "registration_type": registration.registration_type,
        "created_at": registration.created_at.isoformat(),
        "updated_at": registration.updated_at.isoformat() if registration.updated_at else None
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
    
    user.role = "admin"
    db.commit()
    return {"message": "User promoted to admin successfully"}


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
    
    db.commit()
    db.refresh(current_user)
    return current_user


@app.post("/auth/parse-gwars-profile")
async def parse_gwars_profile(
    profile_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Парсинг GWars.io профиля для получения информации"""
    import requests
    import re
    
    profile_url = profile_data.get("profile_url")
    if not profile_url:
        raise HTTPException(status_code=400, detail="URL профиля не указан")
    
    try:
        # Получаем страницу профиля
        response = requests.get(profile_url, timeout=10)
        response.raise_for_status()
        
        # Парсим никнейм и уровень
        nickname_match = re.search(r'<title>([^<]+)</title>', response.text)
        level_match = re.search(r'Уровень:\s*(\d+)', response.text)
        
        if not nickname_match:
            return {"success": False, "error": "Не удалось найти никнейм в профиле"}
        
        # Извлекаем только никнейм из title, убирая " :: Информация ::  GWars.io"
        full_title = nickname_match.group(1).strip()
        # Разделяем по " :: " и берем первую часть (никнейм)
        nickname_parts = full_title.split(' :: ')
        nickname = nickname_parts[0].strip() if nickname_parts else full_title
        
        level = level_match.group(1) if level_match else "Неизвестно"
        
        # Обновляем URL профиля и никнейм в базе данных
        current_user.gwars_profile_url = profile_url
        current_user.gwars_nickname = nickname
        db.commit()
        
        return {
            "success": True,
            "profile": {
                "nickname": nickname,
                "level": level,
                "url": profile_url
            }
        }
        
    except requests.RequestException as e:
        return {"success": False, "error": f"Ошибка при загрузке профиля: {str(e)}"}
    except Exception as e:
        return {"success": False, "error": f"Ошибка при парсинге: {str(e)}"}


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
    # Проверяем, не существует ли уже такой интерес
    existing_interest = db.query(Interest).filter(Interest.name == interest_data.name).first()
    if existing_interest:
        raise HTTPException(status_code=400, detail="Интерес с таким названием уже существует")
    
    interest = Interest(
        name=interest_data.name,
        is_active=True,
        created_by_user_id=interest_data.created_by_user_id
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
    
    # Проверяем уникальность названия, если оно изменяется
    if interest_data.name and interest_data.name != interest.name:
        existing_interest = db.query(Interest).filter(Interest.name == interest_data.name).first()
        if existing_interest:
            raise HTTPException(status_code=400, detail="Интерес с таким названием уже существует")
    
    # Обновляем поля
    update_data = interest_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(interest, field, value)
    
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
    # Проверяем, не существует ли уже такой интерес
    existing_interest = db.query(Interest).filter(Interest.name == interest_data.name).first()
    if existing_interest:
        # Если интерес существует, возвращаем его
        return existing_interest
    
    # Создаем новый интерес
    interest = Interest(
        name=interest_data.name,
        is_active=True,
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
    public_keys = ['welcome_title', 'welcome_subtitle', 'site_title', 'site_description']
    settings = db.query(SystemSettings).filter(SystemSettings.key.in_(public_keys)).all()
    
    return [
        {
            "key": setting.key,
            "value": setting.value
        }
        for setting in settings
    ]
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
        raise HTTPException(status_code=400, detail="Поле query обязательно")
    
    # Проверяем, включено ли автодополнение
    dadata_enabled = db.query(SystemSettings).filter(SystemSettings.key == "dadata_enabled").first()
    if not dadata_enabled or dadata_enabled.value.lower() != "true":
        raise HTTPException(status_code=400, detail="Автодополнение адресов отключено")
    
    # Получаем токен
    dadata_token = db.query(SystemSettings).filter(SystemSettings.key == "dadata_token").first()
    if not dadata_token or not dadata_token.value:
        raise HTTPException(status_code=400, detail="Токен Dadata не настроен")
    
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

# FAQ API endpoints

@app.get("/api/faq", response_model=list[FAQResponse])
async def get_faq(
    db: Session = Depends(get_db)
):
    """Получение всех активных FAQ (доступно всем)"""
    faq_items = db.query(FAQ).filter(
        FAQ.is_active == True
    ).order_by(FAQ.order.asc(), FAQ.created_at.asc()).all()
    
    return faq_items

@app.get("/admin/faq", response_model=list[FAQResponse])
async def get_all_faq(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Получение всех FAQ для администратора"""
    faq_items = db.query(FAQ).order_by(FAQ.order.asc(), FAQ.created_at.asc()).all()
    return faq_items

@app.post("/admin/faq", response_model=FAQResponse)
async def create_faq(
    faq_data: FAQCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Создание нового FAQ (только для администраторов)"""
    faq = FAQ(
        question=faq_data.question,
        answer=faq_data.answer,
        order=faq_data.order,
        is_active=True,
        created_by_user_id=faq_data.created_by_user_id
    )
    db.add(faq)
    db.commit()
    db.refresh(faq)
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
    
    if faq_data.question is not None:
        faq.question = faq_data.question
    if faq_data.answer is not None:
        faq.answer = faq_data.answer
    if faq_data.is_active is not None:
        faq.is_active = faq_data.is_active
    if faq_data.order is not None:
        faq.order = faq_data.order
    
    faq.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(faq)
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
                        "username": user.username,
                        "email": user.email,
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


# Mount static files for React app
if os.path.exists("dist"):
    app.mount("/", StaticFiles(directory="dist", html=True), name="static")

# Mount uploads directory for serving uploaded files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
