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
    location = Column(String(255), nullable=True)
    farm_type = Column(String(50), nullable=True, default="small")
    created_at = Column(String(50), nullable=True)  # Could use DateTime but keeping it simple
    updated_at = Column(String(50), nullable=True)
    last_login = Column(String(50), nullable=True)
    phone = Column(String(20), nullable=True)
    farm_size = Column(String(50), nullable=True)  # e.g., "1-5 acres", "5-20 acres"
    primary_crops = Column(String(255), nullable=True)  # comma-separated crops
    farming_experience = Column(String(50), nullable=True)  # e.g., "beginner", "intermediate", "expert"
