from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List

from app.database import get_db
from app.models.users import DBUser
from app.schemas.auth import UserCreate, UserLogin, UserResponse, Token
from app.utils.auth import (
    get_password_hash, 
    authenticate_user, 
    create_access_token, 
    get_current_active_user
)

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    db_user = db.query(DBUser).filter(DBUser.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = DBUser(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        location=user.location,
        farm_type=user.farm_type,
        created_at=datetime.now().isoformat()
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=1440)  # 24 hours
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=dict)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token_expires = timedelta(minutes=1440)  # 24 hours
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    
    # Return both token and user data
    return {
        "token": access_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "location": user.location,
            "farm_type": user.farm_type,
            "is_active": user.is_active
        }
    }

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: DBUser = Depends(get_current_active_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_user(
    user_data: dict,
    current_user: DBUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Update only allowed fields
    allowed_fields = ["full_name", "location", "farm_type"]
    for field in allowed_fields:
        if field in user_data:
            setattr(current_user, field, user_data[field])
    
    db.commit()
    db.refresh(current_user)
    return current_user
