from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime
import os
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./santa.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

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
    full_name = Column(String)  # ФИО
    address = Column(String)  # Адрес для отправки подарков
    interests = Column(String)  # Интересы пользователя
    profile_completed = Column(Boolean, default=False)  # Заполнен ли профиль
    
    # Верификация GWars.io
    gwars_verification_token = Column(String)  # Токен для верификации
    gwars_verified = Column(Boolean, default=False)  # Верифицирован ли профиль

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
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

# Create default admin on startup
create_default_admin()

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
    full_name: str | None = None
    address: str | None = None
    interests: str | None = None
    profile_completed: bool = False
    
    # Верификация GWars.io
    gwars_verification_token: str | None = None
    gwars_verified: bool = False

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

class ProfileUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    gwars_profile_url: str | None = None
    full_name: str | None = None
    address: str | None = None
    interests: str | None = None

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
    name: str
    description: str
    preregistration_start: datetime
    registration_start: datetime
    registration_end: datetime
    is_active: bool
    created_at: datetime
    created_by: int

class EventRegistrationCreate(BaseModel):
    event_id: int
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


# FastAPI app
app = FastAPI(title="Анонимный Дед Мороз", version="0.0.26")

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
    
    db_user = User(
        username=username,
        email=user.email,
        hashed_password=get_password_hash(user.password),
        name=username,  # Use email prefix as name
        wishlist="",
        role="user",
        profile_completed=False,  # Профиль не заполнен
        gwars_profile_url=None,
        full_name=None,
        address=None,
        interests=None
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
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
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
        "step3_completed": bool(current_user.interests),
        "next_step": 1 if not current_user.gwars_profile_url else 
                    (2 if not (current_user.full_name and current_user.address) else 
                    (3 if not current_user.interests else None))
    }

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
    
    db_event = Event(
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
    """Получение конкретного мероприятия"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

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
        
        nickname = nickname_match.group(1).strip()
        level = level_match.group(1) if level_match else "Неизвестно"
        
        # Обновляем URL профиля в базе данных
        current_user.gwars_profile_url = profile_url
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


# Mount static files for React app
if os.path.exists("dist"):
    app.mount("/", StaticFiles(directory="dist", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
