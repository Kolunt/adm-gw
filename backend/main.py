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

class Gift(Base):
    __tablename__ = "gifts"
    
    id = Column(Integer, primary_key=True, index=True)
    giver_id = Column(Integer, index=True)
    receiver_id = Column(Integer, index=True)
    gift_description = Column(String)
    is_delivered = Column(Boolean, default=False)
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
    gwars_profile_url: str | None = None
    full_name: str | None = None
    address: str | None = None
    interests: str | None = None

class GiftCreate(BaseModel):
    receiver_id: int
    gift_description: str

class GiftResponse(BaseModel):
    id: int
    giver_id: int
    receiver_id: int
    gift_description: str
    is_delivered: bool
    created_at: datetime

# FastAPI app
app = FastAPI(title="Анонимный Дед Мороз", version="0.0.13")

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

@app.post("/gifts/", response_model=GiftResponse)
async def create_gift(gift: GiftCreate, db: Session = Depends(get_db)):
    # Check if receiver exists
    receiver = db.query(User).filter(User.id == gift.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
    
    db_gift = Gift(
        receiver_id=gift.receiver_id,
        gift_description=gift.gift_description
    )
    db.add(db_gift)
    db.commit()
    db.refresh(db_gift)
    return db_gift

@app.get("/gifts/", response_model=list[GiftResponse])
async def get_gifts(db: Session = Depends(get_db)):
    gifts = db.query(Gift).all()
    return gifts

@app.get("/gifts/{gift_id}", response_model=GiftResponse)
async def get_gift(gift_id: int, db: Session = Depends(get_db)):
    gift = db.query(Gift).filter(Gift.id == gift_id).first()
    if not gift:
        raise HTTPException(status_code=404, detail="Gift not found")
    return gift

# Mount static files for React app
if os.path.exists("dist"):
    app.mount("/", StaticFiles(directory="dist", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
