from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import json

from app.database import get_db
from app.utils.auth import get_current_active_user, get_current_user
from app.models.users import DBUser
from app.models.crop_management import CropSession, Analytics
from app.schemas.crop_management import (
    CropSessionCreate, 
    CropSessionResponse,
    AnalyticsCreate,
    AnalyticsResponse
)

router = APIRouter(
    tags=["crop_management"]
)

# 1. Crop Session Management
@router.post("/initialize", response_model=CropSessionResponse)
async def initialize_crop_session(
    crop_data: CropSessionCreate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new crop session with initial data"""
    try:
        # Create new crop session
        new_session = CropSession(
            user_id=current_user.id,
            crop_name=crop_data.crop_name,
            sowing_date=crop_data.sowing_date,
            land_area=crop_data.land_area,
            expected_harvest_date=crop_data.expected_harvest_date,
            status=crop_data.status,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        
        return new_session
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create crop session: {str(e)}"
        )

@router.get("/sessions", response_model=List[CropSessionResponse])
async def get_user_crop_sessions(
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all crop sessions for the current user"""
    try:
        sessions = db.query(CropSession).filter(CropSession.user_id == current_user.id).all()
        return sessions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch sessions: {str(e)}"
        )

@router.get("/sessions/{session_id}", response_model=CropSessionResponse)
async def get_crop_session(
    session_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific crop session"""
    try:
        session = db.query(CropSession).filter(
            CropSession.id == session_id,
            CropSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Crop session not found"
            )
        
        return session
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch session: {str(e)}"
        )

# 2. Analytics Management
@router.post("/analytics", response_model=AnalyticsResponse)
async def save_analytics(
    analytics_data: AnalyticsCreate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save analytics data for a crop session"""
    try:
        # Verify the session belongs to the current user
        session = db.query(CropSession).filter(
            CropSession.id == analytics_data.session_id,
            CropSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Crop session not found"
            )
        
        # Check if analytics already exist for this session
        existing_analytics = db.query(Analytics).filter(
            Analytics.session_id == analytics_data.session_id
        ).first()
        
        if existing_analytics:
            # Update existing analytics
            for key, value in analytics_data.dict().items():
                setattr(existing_analytics, key, value)
            existing_analytics.updated_at = datetime.now()
            db.commit()
            db.refresh(existing_analytics)
            return existing_analytics
        else:
            # Create new analytics
            new_analytics = Analytics(
                session_id=analytics_data.session_id,
                yield_amount=analytics_data.yield_amount,
                yield_unit=analytics_data.yield_unit,
                yield_per_area=analytics_data.yield_per_area,
                area_unit=analytics_data.area_unit,
                total_cost=analytics_data.total_cost,
                revenue=analytics_data.revenue,
                profit=analytics_data.profit,
                roi=analytics_data.roi,
                cost_breakdown=analytics_data.cost_breakdown,
                cost_percentage=analytics_data.cost_percentage,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            
            db.add(new_analytics)
            db.commit()
            db.refresh(new_analytics)
            return new_analytics
            
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save analytics: {str(e)}"
        )

@router.get("/analytics/{session_id}", response_model=AnalyticsResponse)
async def get_analytics(
    session_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analytics data for a crop session"""
    try:
        # Verify the session belongs to the current user
        session = db.query(CropSession).filter(
            CropSession.id == session_id,
            CropSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Crop session not found"
            )
        
        # Get analytics
        analytics = db.query(Analytics).filter(
            Analytics.session_id == session_id
        ).first()
        
        if not analytics:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analytics not found for this session"
            )
        
        return analytics
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch analytics: {str(e)}"
        )

@router.get("/analytics", response_model=List[AnalyticsResponse])
async def get_all_user_analytics(
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all analytics data for the current user"""
    try:
        # Get all user's sessions and their analytics
        user_sessions = db.query(CropSession).filter(CropSession.user_id == current_user.id).all()
        session_ids = [session.id for session in user_sessions]
        
        analytics_list = db.query(Analytics).filter(
            Analytics.session_id.in_(session_ids)
        ).all()
        
        return analytics_list
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch analytics: {str(e)}"
        )
