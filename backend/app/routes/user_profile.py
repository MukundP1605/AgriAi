from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.users import DBUser
from app.utils.auth import get_current_active_user
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

router = APIRouter()

# Profile schemas
class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    location: Optional[str] = None
    farm_type: Optional[str] = None
    phone: Optional[str] = None
    farm_size: Optional[str] = None
    primary_crops: Optional[str] = None
    farming_experience: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: int
    email: str
    full_name: str
    location: Optional[str]
    farm_type: Optional[str]
    phone: Optional[str]
    farm_size: Optional[str]
    primary_crops: Optional[str]
    farming_experience: Optional[str]
    is_active: bool
    created_at: Optional[str]
    last_login: Optional[str]
    total_scans: int
    total_crop_plans: int

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.get("/profile", response_model=UserProfileResponse)
async def get_user_profile(
    current_user: DBUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's profile information"""
    
    # Count user's activities (you'd query actual history tables in production)
    total_scans = 0  # TODO: Query actual scan history table
    total_crop_plans = 0  # TODO: Query actual crop plans table
    
    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        location=current_user.location,
        farm_type=current_user.farm_type,
        phone=getattr(current_user, 'phone', None),
        farm_size=getattr(current_user, 'farm_size', None),
        primary_crops=getattr(current_user, 'primary_crops', None),
        farming_experience=getattr(current_user, 'farming_experience', None),
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        last_login=getattr(current_user, 'last_login', None),
        total_scans=total_scans,
        total_crop_plans=total_crop_plans
    )

@router.put("/profile", response_model=UserProfileResponse)
async def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: DBUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile information"""
    
    # Update only provided fields
    update_data = profile_data.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        if hasattr(current_user, field):
            setattr(current_user, field, value)
    
    # Update last modified timestamp
    current_user.updated_at = datetime.now().isoformat()
    
    try:
        db.commit()
        db.refresh(current_user)
        
        # Return updated profile
        return await get_user_profile(current_user, db)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )

@router.post("/change-password")
async def change_password(
    password_data: ChangePasswordRequest,
    current_user: DBUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Change user's password"""
    
    from app.utils.auth import verify_password, get_password_hash
    
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Validate new password
    if len(password_data.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long"
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    current_user.updated_at = datetime.now().isoformat()
    
    try:
        db.commit()
        return {"message": "Password changed successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to change password: {str(e)}"
        )

@router.delete("/profile")
async def delete_user_account(
    current_user: DBUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete user account (soft delete by deactivating)"""
    
    try:
        # Soft delete by deactivating account
        current_user.is_active = False
        current_user.updated_at = datetime.now().isoformat()
        db.commit()
        
        return {"message": "Account deactivated successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to deactivate account: {str(e)}"
        )

@router.get("/stats")
async def get_user_stats(
    current_user: DBUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user activity statistics"""
    
    # In production, these would query actual database tables
    stats = {
        "total_scans": 0,
        "total_crop_plans": 0,
        "total_chat_messages": 0,
        "account_age_days": 0,
        "last_activity": current_user.created_at,
        "most_scanned_diseases": [],
        "most_recommended_crops": [],
        "monthly_activity": {
            "scans": [],
            "crop_plans": [],
            "chat_sessions": []
        }
    }
    
    return stats
