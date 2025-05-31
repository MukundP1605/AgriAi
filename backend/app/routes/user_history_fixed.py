from fastapi import APIRouter, Depends, HTTPException, status, Query
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

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: DBUser = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    days: int = Query(30, description="Number of days to analyze")
):
    """Get comprehensive dashboard statistics"""
    
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get actual database counts
    total_scans = db.query(UserScanHistory).filter(
        UserScanHistory.user_id == current_user.id,
        UserScanHistory.created_at >= start_date
    ).count()
    
    total_crop_plans = db.query(UserCropHistory).filter(
        UserCropHistory.user_id == current_user.id,
        UserCropHistory.created_at >= start_date
    ).count()
    
    # Count unique chat sessions
    total_chat_sessions = db.query(UserChatHistory.session_id).filter(
        UserChatHistory.user_id == current_user.id,
        UserChatHistory.created_at >= start_date
    ).distinct().count()
    
    # Calculate most common diseases
    disease_counts = db.query(
        UserScanHistory.disease_result,
        func.count(UserScanHistory.disease_result).label('count')
    ).filter(
        UserScanHistory.user_id == current_user.id,
        UserScanHistory.created_at >= start_date
    ).group_by(UserScanHistory.disease_result).order_by(text('count DESC')).limit(5).all()
    
    total_disease_scans = sum([d.count for d in disease_counts])
    most_common_diseases = [
        {
            "name": disease.disease_result,
            "count": disease.count,
            "percentage": round((disease.count / max(total_disease_scans, 1)) * 100, 1)
        }
        for disease in disease_counts
    ]
    
    # Calculate most recommended crops
    crop_counts = db.query(
        UserCropHistory.recommended_crop,
        func.count(UserCropHistory.recommended_crop).label('count')
    ).filter(
        UserCropHistory.user_id == current_user.id,
        UserCropHistory.created_at >= start_date
    ).group_by(UserCropHistory.recommended_crop).order_by(text('count DESC')).limit(5).all()
    
    most_recommended_crops = [
        {
            "name": crop.recommended_crop,
            "count": crop.count,
            "success_rate": 85  # Default success rate - could be calculated from implementation_status
        }
        for crop in crop_counts
    ]
    
    # Calculate implementation success rate
    total_plans = db.query(UserCropHistory).filter(
        UserCropHistory.user_id == current_user.id
    ).count()
    
    successful_plans = db.query(UserCropHistory).filter(
        UserCropHistory.user_id == current_user.id,
        UserCropHistory.implementation_status == 'completed'
    ).count()
    
    implementation_success_rate = round((successful_plans / max(total_plans, 1)) * 100, 1)
    
    # Get recent achievements
    recent_achievements = db.query(UserAchievements).filter(
        UserAchievements.user_id == current_user.id
    ).order_by(UserAchievements.unlocked_at.desc()).limit(5).all()
    
    achievements_data = [
        {
            "name": achievement.achievement_name,
            "unlocked_at": achievement.unlocked_at.isoformat() if achievement.unlocked_at else None,
            "points": achievement.points or 0
        }
        for achievement in recent_achievements
    ]
    
    # Mock monthly activity data (would need complex queries for actual data)
    monthly_activity = {
        "scans": [0] * 12,
        "crop_plans": [0] * 12,
        "chat_sessions": [0] * 12
    }
    
    stats = DashboardStats(
        total_scans=total_scans,
        total_crop_plans=total_crop_plans,
        total_chat_sessions=total_chat_sessions,
        accuracy_rate=85.5,  # Could be calculated from confidence scores
        most_common_diseases=most_common_diseases,
        most_recommended_crops=most_recommended_crops,
        monthly_activity=monthly_activity,
        recent_achievements=achievements_data,
        implementation_success_rate=implementation_success_rate
    )
    
    return stats

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
