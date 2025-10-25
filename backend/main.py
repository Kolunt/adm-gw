from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime
import os

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./santa.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    wishlist = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Gift(Base):
    __tablename__ = "gifts"
    
    id = Column(Integer, primary_key=True, index=True)
    giver_id = Column(Integer, index=True)
    receiver_id = Column(Integer, index=True)
    gift_description = Column(String)
    is_delivered = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic models
class UserCreate(BaseModel):
    name: str
    email: str
    wishlist: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    wishlist: str
    is_active: bool
    created_at: datetime

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
app = FastAPI(title="Анонимный Дед Мороз", version="0.0.5")

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

# API endpoints
@app.get("/")
async def root():
    return {"message": "Анонимный Дед Мороз API"}

@app.post("/users/", response_model=UserResponse)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = User(
        name=user.name,
        email=user.email,
        wishlist=user.wishlist
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

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
    uvicorn.run(app, host="0.0.0.0", port=8000)
