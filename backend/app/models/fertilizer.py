from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from app.database import Base
from datetime import datetime

class FertilizerHistory(Base):
    """Fertilizer recommendation history table"""
    __tablename__ = "fertilizer_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    
    # Crop and soil information
    crop_type = Column(String(50), nullable=False)
    soil_data = Column(JSON, nullable=False)  # Original soil test data
    
    # AI recommendations
    npk_recommendation = Column(JSON, nullable=False)  # NPK analysis and recommendations
    application_schedule = Column(JSON, nullable=True)  # Application schedule phases
    
    # Preferences and metadata
    organic_preference = Column(String(20), nullable=False, default="mixed")
    confidence_score = Column(Float, nullable=True)
    
    # Implementation tracking
    implementation_status = Column(String(50), default="planned")  # planned, in_progress, completed
    actual_cost = Column(Float, nullable=True)  # Actual cost if implemented
    results_notes = Column(Text, nullable=True)  # User notes on results
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    implemented_at = Column(DateTime, nullable=True)
    
    # Additional fields
    area_covered = Column(Float, nullable=True)  # Hectares
    weather_conditions = Column(JSON, nullable=True)  # Weather during application
    yield_improvement = Column(Float, nullable=True)  # Percentage improvement if tracked
    
    def __repr__(self):
        return f"<FertilizerHistory(id={self.id}, user_id={self.user_id}, crop_type='{self.crop_type}', created_at='{self.created_at}')>"
