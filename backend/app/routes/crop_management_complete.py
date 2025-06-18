from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import json

from app.database import get_db
from app.utils.auth import get_current_active_user, get_current_user
from app.models.users import DBUser
from app.models.crop_management import (
    CropSession, Analytics, CropStage, Reminder, 
    PestAlert, FarmInput, HarvestRecord, Report
)
from app.schemas.crop_management import (
    CropSessionCreate, CropSessionResponse,
    CropStageCreate, CropStageResponse,
    ReminderCreate, ReminderResponse,
    PestAlertCreate, PestAlertResponse,
    FarmInputCreate, FarmInputResponse,
    HarvestRecordCreate, HarvestRecordResponse,
    ReportCreate, ReportResponse,
    AnalyticsCreate, AnalyticsResponse
)

router = APIRouter(
    tags=["crop_management"]
)

# 1. Crop Selection & Initial Input Form
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
        
        return CropSessionResponse(
            id=new_session.id,
            user_id=new_session.user_id,
            crop_name=new_session.crop_name,
            sowing_date=new_session.sowing_date,
            land_area=new_session.land_area,
            expected_harvest_date=new_session.expected_harvest_date,
            actual_harvest_date=new_session.actual_harvest_date,
            status=new_session.status,
            created_at=new_session.created_at,
            updated_at=new_session.updated_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create crop session: {str(e)}"
        )

# 2. Lifecycle Stage Generator
@router.post("/stages/{session_id}", response_model=List[CropStageResponse])
async def generate_crop_stages(
    session_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate lifecycle stages for a crop session"""
    try:
        # Check if the session exists and belongs to the user
        session = db.query(CropSession).filter(
            CropSession.id == session_id,
            CropSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Crop session not found or unauthorized"
            )
        
        # Generate stages based on crop type
        stages = []
        sowing_date = session.sowing_date
        
        # Example crop stages for common crops
        if session.crop_name.lower() in ["rice", "paddy"]:
            stages = [
                {"name": "Sowing", "start_date": sowing_date.date(), "end_date": (sowing_date + timedelta(days=15)).date(), "description": "Germination and emergence"},
                {"name": "Vegetative", "start_date": (sowing_date + timedelta(days=16)).date(), "end_date": (sowing_date + timedelta(days=60)).date(), "description": "Tillering and stem elongation"},
                {"name": "Flowering", "start_date": (sowing_date + timedelta(days=61)).date(), "end_date": (sowing_date + timedelta(days=90)).date(), "description": "Panicle initiation and heading"},
                {"name": "Harvest", "start_date": (sowing_date + timedelta(days=91)).date(), "end_date": (sowing_date + timedelta(days=120)).date(), "description": "Grain filling and maturation"}
            ]
        elif session.crop_name.lower() in ["wheat"]:
            stages = [
                {"name": "Sowing", "start_date": sowing_date.date(), "end_date": (sowing_date + timedelta(days=10)).date(), "description": "Germination and emergence"},
                {"name": "Vegetative", "start_date": (sowing_date + timedelta(days=11)).date(), "end_date": (sowing_date + timedelta(days=45)).date(), "description": "Tillering and stem elongation"},
                {"name": "Flowering", "start_date": (sowing_date + timedelta(days=46)).date(), "end_date": (sowing_date + timedelta(days=75)).date(), "description": "Heading and anthesis"},
                {"name": "Harvest", "start_date": (sowing_date + timedelta(days=76)).date(), "end_date": (sowing_date + timedelta(days=110)).date(), "description": "Grain filling and maturation"}
            ]
        elif session.crop_name.lower() in ["corn", "maize"]:
            stages = [
                {"name": "Sowing", "start_date": sowing_date.date(), "end_date": (sowing_date + timedelta(days=7)).date(), "description": "Germination and emergence"},
                {"name": "Vegetative", "start_date": (sowing_date + timedelta(days=8)).date(), "end_date": (sowing_date + timedelta(days=50)).date(), "description": "Leaf development and stem elongation"},
                {"name": "Flowering", "start_date": (sowing_date + timedelta(days=51)).date(), "end_date": (sowing_date + timedelta(days=70)).date(), "description": "Tasseling and silking"},
                {"name": "Harvest", "start_date": (sowing_date + timedelta(days=71)).date(), "end_date": (sowing_date + timedelta(days=100)).date(), "description": "Kernel development and maturation"}
            ]
        else:
            # Default generic stages for other crops
            stages = [
                {"name": "Sowing", "start_date": sowing_date.date(), "end_date": (sowing_date + timedelta(days=10)).date(), "description": "Germination and emergence"},
                {"name": "Vegetative", "start_date": (sowing_date + timedelta(days=11)).date(), "end_date": (sowing_date + timedelta(days=50)).date(), "description": "Vegetative growth"},
                {"name": "Flowering", "start_date": (sowing_date + timedelta(days=51)).date(), "end_date": (sowing_date + timedelta(days=80)).date(), "description": "Flowering and fruit development"},
                {"name": "Harvest", "start_date": (sowing_date + timedelta(days=81)).date(), "end_date": (sowing_date + timedelta(days=110)).date(), "description": "Ripening and maturation"}
            ]
        
        # Save stages to database
        saved_stages = []
        for stage in stages:
            new_stage = CropStage(
                session_id=session.id,
                name=stage["name"],
                start_date=stage["start_date"],
                end_date=stage["end_date"],
                description=stage["description"],
                created_at=datetime.now()
            )
            db.add(new_stage)
            db.commit()
            db.refresh(new_stage)
            
            saved_stages.append(CropStageResponse(
                id=new_stage.id,
                session_id=new_stage.session_id,
                name=new_stage.name,
                start_date=new_stage.start_date,
                end_date=new_stage.end_date,
                description=new_stage.description,
                created_at=new_stage.created_at
            ))
        
        return saved_stages
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate crop stages: {str(e)}"
        )

# 3. Reminder Scheduler
@router.post("/reminders/{session_id}", response_model=List[ReminderResponse])
async def schedule_reminders(
    session_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Schedule reminders for a crop session based on stages"""
    try:
        # Verify session ownership
        session = db.query(CropSession).filter(
            CropSession.id == session_id,
            CropSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Crop session not found or unauthorized"
            )
        
        # Get crop stages
        stages = db.query(CropStage).filter(
            CropStage.session_id == session_id
        ).all()
        
        if not stages:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No stages found for this crop session. Generate stages first."
            )
        
        # Generate reminders based on stages
        reminders = []
        
        for stage in stages:
            # Different reminder types for different stages
            if stage.name == "Sowing":
                reminders.extend([
                    {"title": "Prepare land", "due_date": stage.start_date - timedelta(days=7), "type": "preparation", "description": "Prepare your land for sowing"},
                    {"title": "Purchase seeds", "due_date": stage.start_date - timedelta(days=5), "type": "preparation", "description": "Purchase high-quality seeds for planting"},
                    {"title": "Soil testing", "due_date": stage.start_date - timedelta(days=3), "type": "preparation", "description": "Test soil pH and nutrient levels"}
                ])
            elif stage.name == "Vegetative":
                reminders.extend([
                    {"title": "First fertilizer application", "due_date": stage.start_date + timedelta(days=7), "type": "fertilizer", "description": "Apply nitrogen-rich fertilizer for vegetative growth"},
                    {"title": "Irrigation check", "due_date": stage.start_date + timedelta(days=10), "type": "irrigation", "description": "Ensure adequate water supply"},
                    {"title": "Weed control", "due_date": stage.start_date + timedelta(days=14), "type": "maintenance", "description": "Remove weeds and apply herbicide if necessary"}
                ])
            elif stage.name == "Flowering":
                reminders.extend([
                    {"title": "Pest monitoring", "due_date": stage.start_date + timedelta(days=3), "type": "pest", "description": "Check for pests and diseases during flowering"},
                    {"title": "Phosphorus application", "due_date": stage.start_date + timedelta(days=5), "type": "fertilizer", "description": "Apply phosphorus-rich fertilizer for flowering"}
                ])
            elif stage.name == "Harvest":
                reminders.extend([
                    {"title": "Harvest preparation", "due_date": stage.start_date - timedelta(days=7), "type": "preparation", "description": "Prepare harvesting equipment and storage"},
                    {"title": "Quality check", "due_date": stage.start_date, "type": "harvest", "description": "Check crop maturity and quality before harvest"},
                    {"title": "Market preparation", "due_date": stage.start_date + timedelta(days=3), "type": "harvest", "description": "Prepare for market sale or storage"}
                ])
        
        # Save reminders to database
        saved_reminders = []
        for reminder in reminders:
            new_reminder = Reminder(
                session_id=session.id,
                title=reminder["title"],
                due_date=reminder["due_date"],
                type=reminder["type"],
                description=reminder["description"],
                status="pending",
                created_at=datetime.now()
            )
            db.add(new_reminder)
            db.commit()
            db.refresh(new_reminder)
            
            saved_reminders.append(ReminderResponse(
                id=new_reminder.id,
                session_id=new_reminder.session_id,
                title=new_reminder.title,
                due_date=new_reminder.due_date,
                type=new_reminder.type,
                description=new_reminder.description,
                status=new_reminder.status,
                created_at=new_reminder.created_at
            ))
        
        return saved_reminders
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to schedule reminders: {str(e)}"
        )

# 4. Pest/Disease Alert Fetcher
@router.get("/pest-alerts/{session_id}", response_model=List[PestAlertResponse])
async def get_pest_alerts(
    session_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get pest and disease alerts for a crop session"""
    try:
        # Verify session ownership
        session = db.query(CropSession).filter(
            CropSession.id == session_id,
            CropSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Crop session not found or unauthorized"
            )
        
        # Get current stage
        current_date = datetime.now().date()
        current_stage = db.query(CropStage).filter(
            CropStage.session_id == session_id,
            CropStage.start_date <= current_date,
            CropStage.end_date >= current_date
        ).first()
        
        # Generate pest alerts based on crop type and current stage
        pest_alerts = []
        
        # Common pest alerts based on crop type
        if session.crop_name.lower() in ["rice", "paddy"]:
            pest_alerts = [
                {"name": "Brown Planthopper", "severity": "high", "description": "Sucks plant sap causing yellowing", "recommended_action": "Apply neem oil or appropriate insecticide"},
                {"name": "Rice Blast", "severity": "medium", "description": "Fungal disease causing lesions on leaves", "recommended_action": "Apply fungicide and improve drainage"},
                {"name": "Stem Borer", "severity": "medium", "description": "Larvae bore into stems", "recommended_action": "Use pheromone traps and biological control"}
            ]
        elif session.crop_name.lower() in ["wheat"]:
            pest_alerts = [
                {"name": "Aphids", "severity": "medium", "description": "Small insects that suck plant juices", "recommended_action": "Use beneficial insects or spray with soap solution"},
                {"name": "Rust Disease", "severity": "high", "description": "Fungal disease causing orange-red pustules", "recommended_action": "Apply fungicide and use resistant varieties"},
                {"name": "Armyworm", "severity": "medium", "description": "Caterpillars that feed on leaves", "recommended_action": "Manual removal or use of appropriate pesticide"}
            ]
        elif session.crop_name.lower() in ["corn", "maize"]:
            pest_alerts = [
                {"name": "Corn Borer", "severity": "high", "description": "Larvae tunnel into stalks and ears", "recommended_action": "Use Bt corn varieties or apply targeted insecticide"},
                {"name": "Fall Armyworm", "severity": "high", "description": "Caterpillars feed on leaves and ears", "recommended_action": "Early detection and targeted spray"},
                {"name": "Gray Leaf Spot", "severity": "medium", "description": "Fungal disease causing gray lesions", "recommended_action": "Improve air circulation and apply fungicide"}
            ]
        else:
            # Generic pest alerts
            pest_alerts = [
                {"name": "Aphids", "severity": "medium", "description": "General sap-sucking insects", "recommended_action": "Use insecticidal soap or neem oil"},
                {"name": "Fungal Diseases", "severity": "medium", "description": "Various fungal infections", "recommended_action": "Improve ventilation and apply appropriate fungicide"},
                {"name": "Caterpillars", "severity": "low", "description": "Leaf-eating larvae", "recommended_action": "Manual removal or biological control"}
            ]
        
        # Save alerts to database and return
        saved_alerts = []
        for alert in pest_alerts:
            # Check if alert already exists
            existing_alert = db.query(PestAlert).filter(
                PestAlert.session_id == session_id,
                PestAlert.name == alert["name"]
            ).first()
            
            if not existing_alert:
                new_alert = PestAlert(
                    session_id=session.id,
                    name=alert["name"],
                    detection_date=datetime.now(),
                    severity=alert["severity"],
                    description=alert["description"],
                    recommended_action=alert["recommended_action"],
                    created_at=datetime.now()
                )
                db.add(new_alert)
                db.commit()
                db.refresh(new_alert)
                
                saved_alerts.append(PestAlertResponse(
                    id=new_alert.id,
                    session_id=new_alert.session_id,
                    name=new_alert.name,
                    detection_date=new_alert.detection_date,
                    severity=new_alert.severity,
                    description=new_alert.description,
                    recommended_action=new_alert.recommended_action,
                    created_at=new_alert.created_at
                ))
            else:
                saved_alerts.append(PestAlertResponse(
                    id=existing_alert.id,
                    session_id=existing_alert.session_id,
                    name=existing_alert.name,
                    detection_date=existing_alert.detection_date,
                    severity=existing_alert.severity,
                    description=existing_alert.description,
                    recommended_action=existing_alert.recommended_action,
                    created_at=existing_alert.created_at
                ))
        
        return saved_alerts
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get pest alerts: {str(e)}"
        )

# 5. Harvest Time Predictor
@router.get("/harvest-prediction/{session_id}")
async def predict_harvest_time(
    session_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Predict optimal harvest time for a crop session"""
    try:
        # Verify session ownership
        session = db.query(CropSession).filter(
            CropSession.id == session_id,
            CropSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Crop session not found or unauthorized"
            )
        
        # Get harvest stage
        harvest_stage = db.query(CropStage).filter(
            CropStage.session_id == session_id,
            CropStage.name == "Harvest"
        ).first()
        
        if not harvest_stage:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Harvest stage not found. Generate crop stages first."
            )
        
        # Calculate prediction based on various factors
        current_date = datetime.now().date()
        days_to_harvest = (harvest_stage.start_date - current_date).days
        
        # Harvest readiness indicators
        readiness_factors = {
            "days_remaining": days_to_harvest,
            "estimated_start_date": harvest_stage.start_date.isoformat(),
            "estimated_end_date": harvest_stage.end_date.isoformat(),
            "current_stage": "In Progress" if days_to_harvest > 0 else "Ready for Harvest"
        }
        
        # Crop-specific harvest indicators
        if session.crop_name.lower() in ["rice", "paddy"]:
            readiness_factors.update({
                "moisture_content": "Check grain moisture (should be 20-25%)",
                "grain_color": "Grains should be golden yellow",
                "field_drying": "Field should be drained 1-2 weeks before harvest"
            })
        elif session.crop_name.lower() in ["wheat"]:
            readiness_factors.update({
                "grain_hardness": "Grains should be hard and difficult to dent with fingernail",
                "moisture_content": "Grain moisture should be 12-15%",
                "stem_color": "Stems should be golden brown"
            })
        elif session.crop_name.lower() in ["corn", "maize"]:
            readiness_factors.update({
                "kernel_moisture": "Kernel moisture should be 15-20%",
                "husk_color": "Husks should be brown and dry",
                "kernel_appearance": "Kernels should be fully developed and dented"
            })
        
        # Weather considerations
        readiness_factors["weather_advice"] = "Check weather forecast - avoid harvesting during rain or high humidity"
        
        # Quality factors
        quality_indicators = {
            "optimal_time": "Early morning (6-10 AM) for best quality",
            "storage_preparation": "Ensure storage facilities are clean and dry",
            "transportation": "Arrange transportation in advance"
        }
        
        return {
            "session_id": session_id,
            "crop_name": session.crop_name,
            "harvest_prediction": readiness_factors,
            "quality_indicators": quality_indicators,
            "recommendations": [
                "Monitor crop daily as harvest date approaches",
                "Test grain moisture content regularly",
                "Prepare harvesting equipment in advance",
                "Check market prices for optimal selling time"
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to predict harvest time: {str(e)}"
        )

# 6. Farm Input/Output Tracking
@router.post("/farm-inputs/{session_id}", response_model=FarmInputResponse)
async def add_farm_input(
    session_id: int,
    input_data: FarmInputCreate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add farm input record for a crop session"""
    try:
        # Verify session ownership
        session = db.query(CropSession).filter(
            CropSession.id == session_id,
            CropSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Crop session not found or unauthorized"
            )
        
        # Create new farm input record
        new_input = FarmInput(
            session_id=session.id,
            type=input_data.type,
            name=input_data.name,
            quantity=input_data.quantity,
            unit=input_data.unit,
            application_date=input_data.application_date,
            cost=input_data.cost,
            notes=input_data.notes,
            created_at=datetime.now()
        )
        
        db.add(new_input)
        db.commit()
        db.refresh(new_input)
        
        return FarmInputResponse(
            id=new_input.id,
            session_id=new_input.session_id,
            type=new_input.type,
            name=new_input.name,
            quantity=new_input.quantity,
            unit=new_input.unit,
            application_date=new_input.application_date,
            cost=new_input.cost,
            notes=new_input.notes,
            created_at=new_input.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add farm input: {str(e)}"
        )

# 7. Crop Yield Recording
@router.post("/harvest-record/{session_id}", response_model=HarvestRecordResponse)
async def record_harvest(
    session_id: int,
    harvest_data: HarvestRecordCreate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record harvest data for a crop session"""
    try:
        # Verify session ownership
        session = db.query(CropSession).filter(
            CropSession.id == session_id,
            CropSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Crop session not found or unauthorized"
            )
        
        # Create new harvest record
        new_harvest = HarvestRecord(
            session_id=session.id,
            harvest_date=harvest_data.harvest_date,
            quantity=harvest_data.quantity,
            unit=harvest_data.unit,
            quality_grade=harvest_data.quality_grade,
            sale_price=harvest_data.sale_price,
            notes=harvest_data.notes,
            created_at=datetime.now()
        )
        
        db.add(new_harvest)
        
        # Update session status to completed if not already
        if session.status != "completed":
            session.status = "completed"
            session.actual_harvest_date = datetime.combine(harvest_data.harvest_date, datetime.min.time())
            session.updated_at = datetime.now()
        
        db.commit()
        db.refresh(new_harvest)
        
        return HarvestRecordResponse(
            id=new_harvest.id,
            session_id=new_harvest.session_id,
            harvest_date=new_harvest.harvest_date,
            quantity=new_harvest.quantity,
            unit=new_harvest.unit,
            quality_grade=new_harvest.quality_grade,
            sale_price=new_harvest.sale_price,
            notes=new_harvest.notes,
            created_at=new_harvest.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record harvest: {str(e)}"
        )

# 8. Reports Generator
@router.get("/reports/{session_id}")
async def generate_reports(
    session_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate comprehensive reports for a crop session"""
    try:
        # Verify session ownership
        session = db.query(CropSession).filter(
            CropSession.id == session_id,
            CropSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Crop session not found or unauthorized"
            )
        
        # Get all related data
        stages = db.query(CropStage).filter(CropStage.session_id == session_id).all()
        reminders = db.query(Reminder).filter(Reminder.session_id == session_id).all()
        pest_alerts = db.query(PestAlert).filter(PestAlert.session_id == session_id).all()
        farm_inputs = db.query(FarmInput).filter(FarmInput.session_id == session_id).all()
        harvest_records = db.query(HarvestRecord).filter(HarvestRecord.session_id == session_id).all()
        
        # Calculate totals
        total_cost = sum(input_item.cost for input_item in farm_inputs)
        total_yield = sum(record.quantity for record in harvest_records)
        total_revenue = sum((record.quantity * record.sale_price) if record.sale_price else 0 for record in harvest_records)
        profit = total_revenue - total_cost
        
        # Cost breakdown
        cost_breakdown = {}
        for input_item in farm_inputs:
            if input_item.type not in cost_breakdown:
                cost_breakdown[input_item.type] = 0
            cost_breakdown[input_item.type] += input_item.cost
        
        # Generate comprehensive report
        report_data = {
            "session_info": {
                "id": session.id,
                "crop_name": session.crop_name,
                "sowing_date": session.sowing_date.isoformat(),
                "land_area": session.land_area,
                "status": session.status
            },
            "stages": [
                {
                    "name": stage.name,
                    "start_date": stage.start_date.isoformat(),
                    "end_date": stage.end_date.isoformat(),
                    "description": stage.description
                } for stage in stages
            ],
            "reminders": [
                {
                    "title": reminder.title,
                    "due_date": reminder.due_date.isoformat(),
                    "type": reminder.type,
                    "status": reminder.status
                } for reminder in reminders
            ],
            "pest_alerts": [
                {
                    "name": alert.name,
                    "severity": alert.severity,
                    "description": alert.description,
                    "recommended_action": alert.recommended_action
                } for alert in pest_alerts
            ],
            "farm_inputs": [
                {
                    "type": input_item.type,
                    "name": input_item.name,
                    "quantity": input_item.quantity,
                    "unit": input_item.unit,
                    "cost": input_item.cost,
                    "application_date": input_item.application_date.isoformat()
                } for input_item in farm_inputs
            ],
            "harvest_records": [
                {
                    "harvest_date": record.harvest_date.isoformat(),
                    "quantity": record.quantity,
                    "unit": record.unit,
                    "quality_grade": record.quality_grade,
                    "sale_price": record.sale_price
                } for record in harvest_records
            ],
            "financial_summary": {
                "total_cost": total_cost,
                "total_revenue": total_revenue,
                "profit": profit,
                "roi": ((profit / total_cost) * 100) if total_cost > 0 else 0,
                "cost_breakdown": cost_breakdown
            },
            "productivity": {
                "total_yield": total_yield,
                "yield_per_area": total_yield / session.land_area if session.land_area > 0 else 0,
                "cost_per_unit_yield": total_cost / total_yield if total_yield > 0 else 0
            }
        }
        
        # Save report to database
        report_json = json.dumps(report_data)
        new_report = Report(
            session_id=session.id,
            report_type="comprehensive",
            report_date=datetime.now(),
            report_data=report_json,
            created_at=datetime.now()
        )
        
        db.add(new_report)
        db.commit()
        
        return {
            "report_id": new_report.id,
            "generated_at": new_report.created_at.isoformat(),
            "data": report_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate reports: {str(e)}"
        )

# 9. Graphical View Renderer
@router.get("/graph-data/{session_id}")
async def get_graph_data(
    session_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get data for graphical visualization of crop session"""
    try:
        # Verify session ownership
        session = db.query(CropSession).filter(
            CropSession.id == session_id,
            CropSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Crop session not found or unauthorized"
            )
        
        # Get data for different types of graphs
        farm_inputs = db.query(FarmInput).filter(FarmInput.session_id == session_id).all()
        harvest_records = db.query(HarvestRecord).filter(HarvestRecord.session_id == session_id).all()
        stages = db.query(CropStage).filter(CropStage.session_id == session_id).all()
        
        # Cost breakdown pie chart data
        cost_breakdown = {}
        for input_item in farm_inputs:
            if input_item.type not in cost_breakdown:
                cost_breakdown[input_item.type] = 0
            cost_breakdown[input_item.type] += input_item.cost
        
        cost_pie_data = {
            "labels": list(cost_breakdown.keys()),
            "values": list(cost_breakdown.values())
        }
        
        # Timeline chart data (stages)
        timeline_data = [
            {
                "name": stage.name,
                "start": stage.start_date.isoformat(),
                "end": stage.end_date.isoformat(),
                "duration": (stage.end_date - stage.start_date).days
            } for stage in stages
        ]
        
        # Input application timeline
        input_timeline = [
            {
                "date": input_item.application_date.isoformat(),
                "type": input_item.type,
                "name": input_item.name,
                "quantity": input_item.quantity,
                "cost": input_item.cost
            } for input_item in farm_inputs
        ]
        
        # Yield data
        yield_data = [
            {
                "date": record.harvest_date.isoformat(),
                "quantity": record.quantity,
                "unit": record.unit,
                "revenue": (record.quantity * record.sale_price) if record.sale_price else 0
            } for record in harvest_records
        ]
        
        # Calculate cumulative costs over time
        inputs_by_date = sorted(farm_inputs, key=lambda x: x.application_date)
        cumulative_cost_data = []
        running_total = 0
        
        for input_item in inputs_by_date:
            running_total += input_item.cost
            cumulative_cost_data.append({
                "date": input_item.application_date.isoformat(),
                "cumulative_cost": running_total,
                "daily_cost": input_item.cost
            })
        
        # ROI calculation data
        total_cost = sum(input_item.cost for input_item in farm_inputs)
        total_revenue = sum((record.quantity * record.sale_price) if record.sale_price else 0 for record in harvest_records)
        profit = total_revenue - total_cost
        roi = ((profit / total_cost) * 100) if total_cost > 0 else 0
        
        financial_summary = {
            "total_cost": total_cost,
            "total_revenue": total_revenue,
            "profit": profit,
            "roi": roi
        }
        
        return {
            "session_id": session_id,
            "crop_name": session.crop_name,
            "graphs": {
                "cost_breakdown_pie": cost_pie_data,
                "crop_timeline": timeline_data,
                "input_timeline": input_timeline,
                "yield_data": yield_data,
                "cumulative_costs": cumulative_cost_data,
                "financial_summary": financial_summary
            },
            "metadata": {
                "land_area": session.land_area,
                "sowing_date": session.sowing_date.isoformat(),
                "status": session.status
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get graph data: {str(e)}"
        )

# 10. Season/Crop-wise Comparison
@router.get("/comparisons")
async def compare_crop_seasons(
    crop_name: Optional[str] = None,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Compare different crop seasons or crop types"""
    try:
        # Query to get completed crop sessions
        query = db.query(CropSession).filter(
            CropSession.user_id == current_user.id,
            CropSession.status == "completed"
        )
        
        # Filter by crop name if provided
        if crop_name:
            query = query.filter(CropSession.crop_name == crop_name)
        
        # Get sessions
        sessions = query.all()
        
        if not sessions:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No completed crop sessions found"
            )
        
        # Prepare comparison data
        comparison_data = []
        
        for session in sessions:
            # Get harvest record
            harvest = db.query(HarvestRecord).filter(
                HarvestRecord.session_id == session.id
            ).first()
            
            if not harvest:
                continue
            
            # Get inputs
            inputs = db.query(FarmInput).filter(
                FarmInput.session_id == session.id
            ).all()
            
            total_cost = sum(item.cost for item in inputs)
            revenue = harvest.quantity * harvest.sale_price if harvest.sale_price else 0
            profit = revenue - total_cost
            
            # Calculate ROI
            roi = ((revenue - total_cost) / total_cost * 100) if total_cost > 0 else 0
            
            # Calculate cost breakdown
            cost_breakdown = {}
            for input_item in inputs:
                if input_item.type not in cost_breakdown:
                    cost_breakdown[input_item.type] = 0
                cost_breakdown[input_item.type] += input_item.cost
            
            session_data = {
                "session_id": session.id,
                "crop_name": session.crop_name,
                "sowing_date": session.sowing_date.isoformat(),
                "harvest_date": harvest.harvest_date.isoformat(),
                "land_area": session.land_area,
                "yield": harvest.quantity,
                "yield_unit": harvest.unit,
                "yield_per_area": harvest.quantity / session.land_area if session.land_area else 0,
                "total_cost": total_cost,
                "revenue": revenue,
                "profit": profit,
                "roi": roi,
                "cost_breakdown": cost_breakdown
            }
            
            comparison_data.append(session_data)
        
        # Calculate deltas if comparing same crop types
        if crop_name and len(comparison_data) > 1:
            # Sort by sowing date
            comparison_data.sort(key=lambda x: x["sowing_date"])
            
            # Calculate deltas against the previous season
            for i in range(1, len(comparison_data)):
                current = comparison_data[i]
                previous = comparison_data[i-1]
                
                current["yield_delta"] = ((current["yield"] - previous["yield"]) / previous["yield"] * 100) if previous["yield"] else 0
                current["cost_delta"] = ((current["total_cost"] - previous["total_cost"]) / previous["total_cost"] * 100) if previous["total_cost"] else 0
                current["profit_delta"] = ((current["profit"] - previous["profit"]) / previous["profit"] * 100) if previous["profit"] else 0
                current["roi_delta"] = current["roi"] - previous["roi"]
        
        return {
            "comparison_data": comparison_data,
            "crop_types": list(set(session.crop_name for session in sessions))
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compare crop seasons: {str(e)}"
        )

# Additional utility endpoints

@router.get("/sessions", response_model=List[CropSessionResponse])
async def get_user_sessions(
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all crop sessions for the current user"""
    try:
        sessions = db.query(CropSession).filter(
            CropSession.user_id == current_user.id
        ).all()
        
        return [
            CropSessionResponse(
                id=session.id,
                user_id=session.user_id,
                crop_name=session.crop_name,
                sowing_date=session.sowing_date,
                land_area=session.land_area,
                expected_harvest_date=session.expected_harvest_date,
                actual_harvest_date=session.actual_harvest_date,
                status=session.status,
                created_at=session.created_at,
                updated_at=session.updated_at
            ) for session in sessions
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get sessions: {str(e)}"
        )

@router.get("/sessions/{session_id}", response_model=CropSessionResponse)
async def get_session_details(
    session_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get details of a specific crop session"""
    try:
        session = db.query(CropSession).filter(
            CropSession.id == session_id,
            CropSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Crop session not found or unauthorized"
            )
        
        return CropSessionResponse(
            id=session.id,
            user_id=session.user_id,
            crop_name=session.crop_name,
            sowing_date=session.sowing_date,
            land_area=session.land_area,
            expected_harvest_date=session.expected_harvest_date,
            actual_harvest_date=session.actual_harvest_date,
            status=session.status,
            created_at=session.created_at,
            updated_at=session.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get session details: {str(e)}"
        )

@router.get("/farm-inputs/{session_id}", response_model=List[FarmInputResponse])
async def get_farm_inputs(
    session_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all farm inputs for a crop session"""
    try:
        # Verify session ownership
        session = db.query(CropSession).filter(
            CropSession.id == session_id,
            CropSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Crop session not found or unauthorized"
            )
        
        # Get inputs
        inputs = db.query(FarmInput).filter(
            FarmInput.session_id == session_id
        ).all()
        
        return [
            FarmInputResponse(
                id=input_item.id,
                session_id=input_item.session_id,
                type=input_item.type,
                name=input_item.name,
                quantity=input_item.quantity,
                unit=input_item.unit,
                application_date=input_item.application_date,
                cost=input_item.cost,
                notes=input_item.notes,
                created_at=input_item.created_at
            ) for input_item in inputs
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get farm inputs: {str(e)}"
        )
