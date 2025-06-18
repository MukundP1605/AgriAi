from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base

class CropSession(Base):
    __tablename__ = "crop_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    crop_name = Column(String(100), nullable=False)
    land_area = Column(Float, nullable=False)  # Match existing DB schema
    sowing_date = Column(DateTime, nullable=False)  # Match existing DB schema (datetime not date)
    expected_harvest_date = Column(DateTime)  # Match existing DB schema
    actual_harvest_date = Column(DateTime)  # Match existing DB schema
    status = Column(String(50))  # Match existing DB schema (varchar(50))
    created_at = Column(DateTime)  # Match existing DB schema
    updated_at = Column(DateTime)  # Match existing DB schema

class CropStage(Base):
    __tablename__ = "crop_stages"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("crop_sessions.id"))
    name = Column(String(100), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.now)
    
    # Relationships
    session = relationship("CropSession")

class Reminder(Base):
    __tablename__ = "reminders"
    
    id = Column(Integer, primary_key=True, index=True)
    crop_session_id = Column(Integer, ForeignKey("crop_sessions.id"))
    title = Column(String(200), nullable=False)
    reminder_date = Column(DateTime, nullable=False)
    reminder_type = Column(String(50), nullable=False)  # fertilizer, irrigation, pest, harvest, preparation, maintenance
    description = Column(Text)
    completed = Column(Integer, default=0)  # 0 for pending, 1 for completed
    
    # Relationships
    session = relationship("CropSession")

class PestAlert(Base):
    __tablename__ = "pest_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("crop_sessions.id"))
    name = Column(String(200), nullable=False)
    detection_date = Column(DateTime, nullable=False)
    severity = Column(String(20), nullable=False)  # low, medium, high
    description = Column(Text)
    recommended_action = Column(Text)
    
    # Relationships
    session = relationship("CropSession")

class FarmInput(Base):
    __tablename__ = "farm_inputs"
    id = Column(Integer, primary_key=True, index=True)
    crop_session_id = Column(Integer, ForeignKey("crop_sessions.id"))
    input_type = Column(String(50), nullable=False)  # fertilizer, irrigation, pesticide, labor, seed, other
    name = Column(String(200), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)  # kg, liter, hour, etc.
    application_date = Column(Date, nullable=False)
    cost = Column(Float, default=0.0)
    notes = Column(Text)
    
    # Relationships
    session = relationship("CropSession")

class HarvestRecord(Base):
    __tablename__ = "harvest_records"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("crop_sessions.id"))
    harvest_date = Column(Date, nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)  # kg, ton, bushel, etc.
    quality_grade = Column(String(50))
    sale_price = Column(Float)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.now)
    
    # Relationships
    session = relationship("CropSession")

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    report_type = Column(String(50), nullable=False)  # season_summary, fertilizer, productivity, comparison
    title = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)  # JSON string
    generated_date = Column(DateTime, default=datetime.now)
    
    # Relationships
    user = relationship("DBUser")

class Analytics(Base):
    __tablename__ = "analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("crop_sessions.id"))
    yield_amount = Column(Float, nullable=False)
    yield_unit = Column(String(20), nullable=False)
    yield_per_area = Column(Float, nullable=False)
    area_unit = Column(String(20), nullable=False)
    total_cost = Column(Float, nullable=False)
    revenue = Column(Float, nullable=False)
    profit = Column(Float, nullable=False)
    roi = Column(Float, nullable=False)
    cost_breakdown = Column(Text, nullable=False)  # JSON string
    cost_percentage = Column(Text, nullable=False)  # JSON string
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Relationships
    session = relationship("CropSession")
