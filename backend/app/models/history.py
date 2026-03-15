from sqlalchemy import Boolean, Column, Integer, String, Text, DateTime, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class UserScanHistory(Base):
    """Disease scan history table"""
    __tablename__ = "user_scan_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
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
    
    # Relationship to user
    user = relationship("DBUser")
    
    def __repr__(self):
        return f"<UserScanHistory(id={self.id}, user_id={self.user_id}, disease_result='{self.disease_result}')>"

class UserCropHistory(Base):
    """Crop recommendation history table"""
    __tablename__ = "user_crop_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    recommended_crop = Column(String(100), nullable=False)
    location = Column(String(255), nullable=False)
    soil_nutrients = Column(JSON, nullable=True)  # N, P, K, pH, etc.
    climate_data = Column(JSON, nullable=True)  # temperature, humidity, rainfall
    season = Column(String(50), nullable=True)
    confidence_score = Column(Float, nullable=True)
    alternative_crops = Column(JSON, nullable=True)  # list of alternative crops
    implementation_status = Column(String(50), default="pending")  # pending, in_progress, successful, failed
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_archived = Column(Boolean, default=False)
    
    # Relationship to user
    user = relationship("DBUser")
    
    def __repr__(self):
        return f"<UserCropHistory(id={self.id}, user_id={self.user_id}, recommended_crop='{self.recommended_crop}')>"
class ChatLog(Base):
    """Chat history log for user interactions"""
    __tablename__ = "chat_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), index=True)
    user_message = Column(Text, nullable=False)
    bot_response = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    intent = Column(String(100), nullable=True)
    
    def __repr__(self):
        return f"<ChatLog(id={self.id}, session_id={self.session_id})>"

class UserChatHistory(Base):
    """Chat conversation history table"""
    __tablename__ = "user_chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    session_id = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    sender = Column(String(20), nullable=False)  # 'user' or 'bot'
    message_type = Column(String(50), default="text")  # text, image, document
    context_data = Column(JSON, nullable=True)  # additional context
    response_time = Column(Float, nullable=True)  # bot response time in seconds
    satisfaction_rating = Column(Integer, nullable=True)  # 1-5 rating
    created_at = Column(DateTime, default=datetime.utcnow)
    is_archived = Column(Boolean, default=False)
    
    # Relationship to user
    user = relationship("DBUser")
    
    def __repr__(self):
        return f"<UserChatHistory(id={self.id}, user_id={self.user_id}, sender='{self.sender}')>"

class UserActivityLog(Base):
    """General user activity tracking"""
    __tablename__ = "user_activity_log"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    activity_type = Column(String(50), nullable=False)  # login, scan, crop_plan, chat, profile_update
    activity_details = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(255), nullable=True)
    session_duration = Column(Float, nullable=True)  # in minutes
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to user
    user = relationship("DBUser")
    
    def __repr__(self):
        return f"<UserActivityLog(id={self.id}, user_id={self.user_id}, activity_type='{self.activity_type}')>"

class UserFavorites(Base):
    """User favorites and bookmarks"""
    __tablename__ = "user_favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    favorite_type = Column(String(50), nullable=False)  # scan, crop_plan, chat_response
    reference_id = Column(Integer, nullable=False)  # ID of the favorited item
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to user
    user = relationship("DBUser")
    
    def __repr__(self):
        return f"<UserFavorites(id={self.id}, user_id={self.user_id}, favorite_type='{self.favorite_type}')>"

class UserAchievements(Base):
    """User achievements and milestones"""
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    achievement_type = Column(String(100), nullable=False)  # first_scan, 10_scans, expert_farmer, etc.
    achievement_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    badge_icon = Column(String(255), nullable=True)
    points_earned = Column(Integer, default=0)
    unlocked_at = Column(DateTime, default=datetime.utcnow)
    is_featured = Column(Boolean, default=False)
    
    # Relationship to user
    user = relationship("DBUser")
    
    def __repr__(self):
        return f"<UserAchievements(id={self.id}, user_id={self.user_id}, achievement_type='{self.achievement_type}')>"
