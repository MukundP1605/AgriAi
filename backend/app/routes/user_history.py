from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from typing import List, Optional, Dict, Any
from app.database import get_db
from app.models.users import DBUser
from app.models.history import UserScanHistory, UserCropHistory, UserChatHistory, UserActivityLog, UserFavorites, UserAchievements
from app.utils.auth import get_current_active_user
from pydantic import BaseModel
from datetime import datetime, timedelta
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# History schemas
class HistoryItem(BaseModel):
    id: int
    user_id: int
    type: str  # "chat", "disease", "crop"
    data: dict
    created_at: str

# Enhanced history schemas
class ScanHistoryItem(BaseModel):
    id: int
    image_name: str
    disease_result: str
    confidence: float
    treatment_recommendation: Optional[str]
    severity: Optional[str]
    crop_type: Optional[str]
    location: Optional[str]
    notes: Optional[str]
    created_at: str  # Change to string for serialization
    is_favorited: bool = False

class CropHistoryItem(BaseModel):
    id: int
    recommended_crop: str
    location: str
    soil_nutrients: Dict[str, Any]
    climate_data: Dict[str, Any]
    season: Optional[str]
    confidence_score: Optional[float]
    alternative_crops: Optional[List[str]]
    implementation_status: str
    notes: Optional[str]
    created_at: str  # Change to string for serialization
    is_favorited: bool = False

class ChatHistoryItem(BaseModel):
    id: int
    session_id: str
    message: str
    sender: str
    message_type: str
    response_time: Optional[float]
    satisfaction_rating: Optional[int]
    created_at: datetime

class HistoryFilters(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    search_query: Optional[str] = None
    category: Optional[str] = None
    confidence_min: Optional[float] = None
    severity: Optional[str] = None
    implementation_status: Optional[str] = None
    is_favorited: Optional[bool] = None

class DashboardStats(BaseModel):
    total_scans: int
    total_crop_plans: int
    total_chat_sessions: int
    accuracy_rate: float
    most_common_diseases: List[Dict[str, Any]]
    most_recommended_crops: List[Dict[str, Any]]
    monthly_activity: Dict[str, List[int]]
    recent_achievements: List[Dict[str, Any]]
    implementation_success_rate: float

# Enhanced scan saving with more details
class EnhancedScanData(BaseModel):
    result: str
    confidence: float
    image_name: str
    treatment_recommendation: Optional[str] = None
    severity: Optional[str] = None
    crop_type: Optional[str] = None
    location: Optional[str] = None
    weather_conditions: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None

# Enhanced crop plan saving
class EnhancedCropPlanData(BaseModel):
    crop: str
    location: str
    soil_nutrients: Dict[str, Any]
    climate: Dict[str, Any]
    season: Optional[str] = None
    confidence_score: Optional[float] = None
    alternative_crops: Optional[List[str]] = None
    expected_yield: Optional[str] = None
    estimated_profit: Optional[float] = None
    notes: Optional[str] = None

# Enhanced chat data
class EnhancedChatData(BaseModel):
    user_message: str
    bot_reply: str
    timestamp: Optional[str] = None
    session_id: Optional[str] = None

@router.get("/dashboard", response_model=DashboardStats)
async def get_user_dashboard(
    days: int = Query(30, description="Number of days to look back for statistics"),
    current_user: DBUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get dashboard statistics for the authenticated user.
    Provides key metrics like total scans, recommended crops, chat sessions,
    and visualization data for the dashboard.
    """
    try:
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get total scans
        total_scans = db.query(func.count(UserScanHistory.id)).filter(
            UserScanHistory.user_id == current_user.id,
            UserScanHistory.created_at >= start_date
        ).scalar() or 0
          # Get total crop plans
        total_crop_plans = db.query(func.count(UserCropHistory.id)).filter(
            UserCropHistory.user_id == current_user.id,
            UserCropHistory.created_at >= start_date if hasattr(UserCropHistory, 'created_at') else True
        ).scalar() or 0
        
        # Get total chat sessions (unique session_ids)
        total_chat_sessions = db.query(func.count(func.distinct(UserChatHistory.session_id))).filter(
            UserChatHistory.user_id == current_user.id,
            UserChatHistory.created_at >= start_date
        ).scalar() or 0
        
        # Calculate accuracy rate (assume we track this in scan history)
        # For example: if confidence > 0.7, consider it accurate
        accurate_scans = db.query(func.count(UserScanHistory.id)).filter(
            UserScanHistory.user_id == current_user.id,
            UserScanHistory.created_at >= start_date,
            UserScanHistory.confidence > 0.7
        ).scalar() or 0
        
        accuracy_rate = (accurate_scans / total_scans * 100) if total_scans > 0 else 0
        
        # Get most common diseases
        most_common_diseases = []
        disease_results = db.query(
            UserScanHistory.disease_result,
            func.count(UserScanHistory.disease_result).label('count')
        ).filter(
            UserScanHistory.user_id == current_user.id,
            UserScanHistory.created_at >= start_date
        ).group_by(UserScanHistory.disease_result).order_by(text('count DESC')).limit(5).all()
        
        for disease in disease_results:
            percentage = round((disease.count / total_scans * 100) if total_scans > 0 else 0, 1)
            most_common_diseases.append({
                "name": disease.disease_result,
                "count": disease.count,
                "percentage": percentage
            })
        
        # Get most recommended crops
        most_recommended_crops = []
        crop_results = db.query(
            UserCropHistory.recommended_crop,
            func.count(UserCropHistory.recommended_crop).label('count')        ).filter(
            UserCropHistory.user_id == current_user.id,
            UserCropHistory.created_at >= start_date if hasattr(UserCropHistory, 'created_at') else True
        ).group_by(UserCropHistory.recommended_crop).order_by(text('count DESC')).limit(5).all()
        
        for crop in crop_results:
            # Calculate success rate for each crop
            successful_implementations = db.query(func.count(UserCropHistory.id)).filter(
                UserCropHistory.user_id == current_user.id,
                UserCropHistory.recommended_crop == crop.recommended_crop,
                UserCropHistory.implementation_status == 'successful'
            ).scalar() or 0
            
            total_implementations = crop.count
            success_rate = round((successful_implementations / total_implementations * 100) 
                               if total_implementations > 0 else 0, 1)
            
            most_recommended_crops.append({
                "name": crop.recommended_crop,
                "count": crop.count,
                "success_rate": success_rate
            })
          # Calculate overall implementation success rate
        successful_crops = db.query(func.count(UserCropHistory.id)).filter(
            UserCropHistory.user_id == current_user.id,
            UserCropHistory.created_at >= start_date if hasattr(UserCropHistory, 'created_at') else True,
            UserCropHistory.implementation_status == 'successful' if hasattr(UserCropHistory, 'implementation_status') else True
        ).scalar() or 0
        
        implementation_success_rate = (successful_crops / total_crop_plans * 100) if total_crop_plans > 0 else 0
        
        # Get monthly activity (for the past year)
        months = 12
        monthly_scans = [0] * months
        monthly_crop_plans = [0] * months
        monthly_chat_sessions = [0] * months
        
        # Get recent achievements
        recent_achievements = []
        achievements = db.query(UserAchievements).filter(
            UserAchievements.user_id == current_user.id,
            UserAchievements.unlocked_at >= start_date
        ).order_by(UserAchievements.unlocked_at.desc()).limit(3).all()
        
        for achievement in achievements:
            recent_achievements.append({
                "name": achievement.achievement_name,
                "description": achievement.description,
                "points": achievement.points_earned,
                "unlocked_at": achievement.unlocked_at.isoformat() if achievement.unlocked_at else None
            })
        
        # If we don't have enough real achievements, add some placeholders
        if len(recent_achievements) < 3:
            placeholder_achievements = [
                {
                    "name": "Crop Expert",
                    "description": "Successfully implemented 5 crop recommendations",
                    "points": 50,
                    "unlocked_at": None
                },
                {
                    "name": "Disease Detective",
                    "description": "Identified 10 plant diseases accurately",
                    "points": 75,
                    "unlocked_at": None
                },
                {
                    "name": "AI Conversationalist",
                    "description": "Had 20 productive AI chat sessions",
                    "points": 30,
                    "unlocked_at": None
                }
            ]
            
            for i in range(3 - len(recent_achievements)):
                if i < len(placeholder_achievements):
                    recent_achievements.append(placeholder_achievements[i])
        
        # Assemble and return the dashboard data
        return {
            "total_scans": total_scans,
            "total_crop_plans": total_crop_plans,
            "total_chat_sessions": total_chat_sessions,
            "accuracy_rate": round(accuracy_rate, 1),
            "most_common_diseases": most_common_diseases,
            "most_recommended_crops": most_recommended_crops,
            "monthly_activity": {
                "scans": monthly_scans,
                "crop_plans": monthly_crop_plans,
                "chat_sessions": monthly_chat_sessions
            },
            "recent_achievements": recent_achievements,
            "implementation_success_rate": round(implementation_success_rate, 1)
        }
    
    except Exception as e:
        logger.error(f"Error getting dashboard data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard data: {str(e)}"
        )

@router.get("/scans", response_model=List[ScanHistoryItem])
async def get_scan_history(
    current_user: DBUser = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    limit: int = Query(20, description="Number of records to return"),
    offset: int = Query(0, description="Number of records to skip"),
    search: Optional[str] = Query(None, description="Search in disease results"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    start_date: Optional[datetime] = Query(None, description="Filter from date"),
    end_date: Optional[datetime] = Query(None, description="Filter to date")
):
    """Get user's disease scan history with filtering"""
    
    # Build base query
    query = db.query(UserScanHistory).filter(UserScanHistory.user_id == current_user.id)
    
    # Apply filters
    if search:
        query = query.filter(UserScanHistory.disease_result.ilike(f"%{search}%"))
    
    if severity:
        query = query.filter(UserScanHistory.severity == severity)
    
    if start_date:
        query = query.filter(UserScanHistory.created_at >= start_date)
    
    if end_date:
        query = query.filter(UserScanHistory.created_at <= end_date)
    
    # Get paginated results
    scans = query.order_by(UserScanHistory.created_at.desc()).offset(offset).limit(limit).all()
    
    # Convert to response model
    scan_items = []
    for scan in scans:
        # Check if favorited (fix field names)
        is_favorited = db.query(UserFavorites).filter(
            UserFavorites.user_id == current_user.id,
            UserFavorites.favorite_type == 'scan',
            UserFavorites.reference_id == scan.id
        ).first() is not None
        
        scan_items.append(ScanHistoryItem(
            id=scan.id,
            image_name=scan.image_name or "unknown.jpg",
            disease_result=scan.disease_result,
            confidence=scan.confidence or 0.0,
            treatment_recommendation=scan.treatment_recommendation,
            severity=scan.severity,
            crop_type=scan.crop_type,
            location=scan.location,
            notes=scan.notes,
            created_at=scan.created_at.isoformat() if scan.created_at else "",
            is_favorited=is_favorited
        ))
    
    return scan_items

@router.get("/crop-plans", response_model=List[CropHistoryItem])
async def get_crop_plan_history(
    current_user: DBUser = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    limit: int = Query(20, description="Number of records to return"),
    offset: int = Query(0, description="Number of records to skip"),
    status: Optional[str] = Query(None, description="Filter by implementation status"),
    crop: Optional[str] = Query(None, description="Filter by crop type")
):
    """Get user's crop recommendation history with filtering"""
    
    # Build base query
    query = db.query(UserCropHistory).filter(UserCropHistory.user_id == current_user.id)
    
    # Apply filters
    if status:
        query = query.filter(UserCropHistory.implementation_status == status)
    
    if crop:
        query = query.filter(UserCropHistory.recommended_crop.ilike(f"%{crop}%"))
    
    # Get paginated results
    crop_plans = query.order_by(UserCropHistory.created_at.desc()).offset(offset).limit(limit).all()
    
    # Convert to response model
    crop_items = []
    for plan in crop_plans:
        # Check if favorited (fix field names)
        is_favorited = db.query(UserFavorites).filter(
            UserFavorites.user_id == current_user.id,
            UserFavorites.favorite_type == 'crop_plan',
            UserFavorites.reference_id == plan.id
        ).first() is not None
        
        # Parse JSON fields safely
        soil_nutrients = json.loads(plan.soil_nutrients) if plan.soil_nutrients else {}
        climate_data = json.loads(plan.climate_data) if plan.climate_data else {}
        alternative_crops = json.loads(plan.alternative_crops) if plan.alternative_crops else []
        
        crop_items.append(CropHistoryItem(
            id=plan.id,
            recommended_crop=plan.recommended_crop,
            location=plan.location or "Unknown",
            soil_nutrients=soil_nutrients,
            climate_data=climate_data,
            season=plan.season,
            confidence_score=plan.confidence_score,
            alternative_crops=alternative_crops,
            implementation_status=plan.implementation_status or "planned",
            notes=plan.notes,
            created_at=plan.created_at.isoformat() if plan.created_at else "",
            is_favorited=is_favorited
        ))
    
    return crop_items

@router.post("/save-scan-enhanced")
async def save_enhanced_scan(
    scan_data: EnhancedScanData,
    current_user: DBUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Save enhanced disease scan record"""
    
    # Create new scan record
    new_scan = UserScanHistory(
        user_id=current_user.id,
        image_name=scan_data.image_name,
        disease_result=scan_data.result,
        confidence=scan_data.confidence,
        treatment_recommendation=scan_data.treatment_recommendation,
        severity=scan_data.severity,
        crop_type=scan_data.crop_type,
        location=scan_data.location or current_user.location,
        weather_conditions=json.dumps(scan_data.weather_conditions) if scan_data.weather_conditions else None,
        notes=scan_data.notes,
        created_at=datetime.utcnow()
    )
    
    db.add(new_scan)
    
    # Log user activity
    activity_log = UserActivityLog(
        user_id=current_user.id,
        activity_type="disease_scan",
        activity_details=json.dumps({
            "disease_result": scan_data.result,
            "confidence": scan_data.confidence,
            "image_name": scan_data.image_name
        }),
        created_at=datetime.utcnow()
    )
    db.add(activity_log)
    
    db.commit()
    db.refresh(new_scan)
    
    return {
        "message": "Enhanced scan saved successfully",
        "scan_id": new_scan.id,
        "scan_data": {
            "user_id": current_user.id,
            "image_name": scan_data.image_name,
            "disease_result": scan_data.result,
            "confidence": scan_data.confidence,
            "created_at": new_scan.created_at.isoformat()
        }
    }

@router.post("/save-crop-plan-enhanced")
async def save_enhanced_crop_plan(
    crop_data: EnhancedCropPlanData,
    current_user: DBUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Save enhanced crop plan record"""
    
    # Create new crop plan record
    new_crop_plan = UserCropHistory(
        user_id=current_user.id,
        recommended_crop=crop_data.crop,
        location=crop_data.location,
        soil_nutrients=json.dumps(crop_data.soil_nutrients),
        climate_data=json.dumps(crop_data.climate),
        season=crop_data.season,
        confidence_score=crop_data.confidence_score,
        alternative_crops=json.dumps(crop_data.alternative_crops) if crop_data.alternative_crops else None,
        expected_yield=crop_data.expected_yield,
        estimated_profit=crop_data.estimated_profit,
        implementation_status="planned",  # Default status
        notes=crop_data.notes,
        created_at=datetime.utcnow()
    )
    
    db.add(new_crop_plan)
    
    # Log user activity
    activity_log = UserActivityLog(
        user_id=current_user.id,
        activity_type="crop_recommendation",
        activity_details=json.dumps({
            "recommended_crop": crop_data.crop,
            "location": crop_data.location,
            "confidence_score": crop_data.confidence_score
        }),
        created_at=datetime.utcnow()
    )
    db.add(activity_log)
    
    db.commit()
    db.refresh(new_crop_plan)
    
    return {
        "message": "Enhanced crop plan saved successfully",
        "crop_plan_id": new_crop_plan.id,
        "crop_data": {
            "user_id": current_user.id,
            "recommended_crop": crop_data.crop,
            "location": crop_data.location,
            "confidence_score": crop_data.confidence_score,
            "created_at": new_crop_plan.created_at.isoformat()
        }
    }

@router.post("/save-chat-enhanced")
async def save_enhanced_chat(
    chat_data: EnhancedChatData,
    current_user: DBUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Save enhanced chat session (user message and bot reply)"""
    now = datetime.utcnow()
    session_id = chat_data.session_id or f"{current_user.id}-{now.strftime('%Y%m%d%H%M%S')}"
    # Save user message
    user_msg = UserChatHistory(
        user_id=current_user.id,
        session_id=session_id,
        message=chat_data.user_message,
        sender="user",
        message_type="text",
        created_at=now
    )
    db.add(user_msg)
    # Save bot reply
    bot_msg = UserChatHistory(
        user_id=current_user.id,
        session_id=session_id,
        message=chat_data.bot_reply,
        sender="bot",
        message_type="text",
        created_at=now
    )
    db.add(bot_msg)
    db.commit()
    return {"message": "Enhanced chat saved successfully", "session_id": session_id}

@router.post("/favorite/{item_type}/{item_id}")
async def toggle_favorite(
    item_type: str,
    item_id: int,
    current_user: DBUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Toggle favorite status for a scan or crop plan"""
    
    if item_type not in ['scan', 'crop_plan']:
        raise HTTPException(status_code=400, detail="Invalid item type")
    
    # Check if already favorited
    existing_favorite = db.query(UserFavorites).filter(
        UserFavorites.user_id == current_user.id,
        UserFavorites.favorite_type == item_type,
        UserFavorites.reference_id == item_id
    ).first()
    
    if existing_favorite:
        # Remove from favorites
        db.delete(existing_favorite)
        message = "Removed from favorites"
        is_favorited = False
    else:
        # Add to favorites
        new_favorite = UserFavorites(
            user_id=current_user.id,
            favorite_type=item_type,
            reference_id=item_id,
            created_at=datetime.utcnow()
        )
        db.add(new_favorite)
        message = "Added to favorites"
        is_favorited = True
    
    db.commit()
    
    return {
        "message": message,
        "is_favorited": is_favorited
    }

@router.get("/export/{data_type}")
async def export_data(
    data_type: str,
    current_user: DBUser = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    format: str = Query("json", description="Export format: json or csv")
):
    """Export user data"""
    
    if data_type not in ['scans', 'crop_plans', 'all']:
        raise HTTPException(status_code=400, detail="Invalid data type")
    
    export_data = {}
    
    if data_type in ['scans', 'all']:
        scans = db.query(UserScanHistory).filter(UserScanHistory.user_id == current_user.id).all()
        export_data['scans'] = [
            {
                "id": scan.id,
                "image_name": scan.image_name,
                "disease_result": scan.disease_result,
                "confidence": scan.confidence,
                "severity": scan.severity,
                "crop_type": scan.crop_type,
                "location": scan.location,
                "created_at": scan.created_at.isoformat() if scan.created_at else None
            }
            for scan in scans
        ]
    
    if data_type in ['crop_plans', 'all']:
        crop_plans = db.query(UserCropHistory).filter(UserCropHistory.user_id == current_user.id).all()
        export_data['crop_plans'] = [
            {
                "id": plan.id,
                "recommended_crop": plan.recommended_crop,
                "location": plan.location,
                "season": plan.season,
                "confidence_score": plan.confidence_score,
                "implementation_status": plan.implementation_status,
                "created_at": plan.created_at.isoformat() if plan.created_at else None
            }
            for plan in crop_plans
        ]
    
    return {
        "user_id": current_user.id,
        "export_type": data_type,
        "exported_at": datetime.utcnow().isoformat(),
        "data": export_data
    }
