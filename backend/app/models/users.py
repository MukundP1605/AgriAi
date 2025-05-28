from sqlalchemy import Boolean, Column, Integer, String
from pydantic import BaseModel
from app.database import Base

# SQLAlchemy DB Model
class DBUser(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)  # Specify length
    full_name = Column(String(100))  # Specify length
    hashed_password = Column(String(255))  # Specify length
    is_active = Column(Boolean, default=True)
    # Add any other fields you need
