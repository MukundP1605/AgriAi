from sqlalchemy import Boolean, Column, Integer, String, Text, DateTime, Float, JSON
from app.database import Base
from datetime import datetime

class UserScanHistory(Base):
    """Disease scan history table"""
    __tablename__ = "user_scan_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    image_name = Column(String(255), nullable=False)
    disease_result = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    treatment_recommendation = Column(Text, nullable=True)
    severity = Column(String(50), nullable=True)  # mild, moderate, severe
    crop_type = Column(String(100), nullable=True)
    location = Column(String(255), nullable=True)
    weather_conditions = Column(JSON, nullable=True)  # temperature, humidity, etc.
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_archived = Column(Boolean, default=False)

class UserCropHistory(Base):
    """Crop recommendation history table"""
    __tablename__ = "user_crop_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    recommended_crop = Column(String(100), nullable=False)
    location = Column(String(255), nullable=False)
    soil_nutrients = Column(JSON, nullable=False)  # N, P, K, pH
    climate_data = Column(JSON, nullable=False)  # temperature, humidity, rainfall
    season = Column(String(50), nullable=True)
    confidence_score = Column(Float, nullable=True)
    alternative_crops = Column(JSON, nullable=True)  # list of other suitable crops
    expected_yield = Column(String(100), nullable=True)
    estimated_profit = Column(Float, nullable=True)
    implementation_status = Column(String(50), default="planned")  # planned, implemented, completed
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_archived = Column(Boolean, default=False)

class UserChatHistory(Base):
    """Chat conversation history table"""
    __tablename__ = "user_chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    session_id = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    sender = Column(String(20), nullable=False)  # 'user' or 'bot'
    message_type = Column(String(50), default="text")  # text, image, document
    context_data = Column(JSON, nullable=True)  # additional context
    response_time = Column(Float, nullable=True)  # bot response time in seconds
    satisfaction_rating = Column(Integer, nullable=True)  # 1-5 rating
    created_at = Column(DateTime, default=datetime.utcnow)
    is_archived = Column(Boolean, default=False)

class UserActivityLog(Base):
    """General user activity tracking"""
    __tablename__ = "user_activity_log"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    activity_type = Column(String(50), nullable=False)  # login, scan, crop_plan, chat, profile_update
    activity_details = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(255), nullable=True)
    session_duration = Column(Float, nullable=True)  # in minutes
    created_at = Column(DateTime, default=datetime.utcnow)

class UserFavorites(Base):
    """User favorites and bookmarks"""
    __tablename__ = "user_favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    favorite_type = Column(String(50), nullable=False)  # scan, crop_plan, chat_response
    reference_id = Column(Integer, nullable=False)  # ID of the favorited item
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserAchievements(Base):
    """User achievements and milestones"""
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    achievement_type = Column(String(100), nullable=False)  # first_scan, 10_scans, expert_farmer, etc.
    achievement_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    badge_icon = Column(String(255), nullable=True)
    points_earned = Column(Integer, default=0)
    unlocked_at = Column(DateTime, default=datetime.utcnow)
    is_featured = Column(Boolean, default=False)
