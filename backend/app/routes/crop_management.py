from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.responses import Response, FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, date
import json
from io import BytesIO
from pydantic import ValidationError
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors

from app.database import get_db
from app.utils.auth import get_current_active_user, get_current_user
from app.models.users import DBUser
from app.models.crop_management import (
    CropSession, Analytics, CropStage, Reminder, 
    PestAlert, FarmInput, HarvestRecord, Report
)
from app.schemas.crop_management import (
    CropSessionCreate, 
    CropSessionResponse,
    AnalyticsCreate,
    AnalyticsResponse,
    CropStageCreate,
    ReminderCreate,
    PestAlertCreate,
    FarmInputCreate,
    HarvestRecordCreate,
    ReportCreate,
    PDFExportRequest,
    PDFExportOptions
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
@router.post("/stages/{session_id}", response_model=List[CropStageCreate])
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
                {"name": "Sowing", "start_date": sowing_date, "end_date": sowing_date + timedelta(days=15), "description": "Germination and emergence"},
                {"name": "Vegetative", "start_date": sowing_date + timedelta(days=16), "end_date": sowing_date + timedelta(days=60), "description": "Tillering and stem elongation"},
                {"name": "Flowering", "start_date": sowing_date + timedelta(days=61), "end_date": sowing_date + timedelta(days=90), "description": "Panicle initiation and heading"},
                {"name": "Harvest", "start_date": sowing_date + timedelta(days=91), "end_date": sowing_date + timedelta(days=120), "description": "Grain filling and maturation"}
            ]
        elif session.crop_name.lower() in ["wheat"]:
            stages = [
                {"name": "Sowing", "start_date": sowing_date, "end_date": sowing_date + timedelta(days=10), "description": "Germination and emergence"},
                {"name": "Vegetative", "start_date": sowing_date + timedelta(days=11), "end_date": sowing_date + timedelta(days=45), "description": "Tillering and stem elongation"},
                {"name": "Flowering", "start_date": sowing_date + timedelta(days=46), "end_date": sowing_date + timedelta(days=75), "description": "Heading and anthesis"},
                {"name": "Harvest", "start_date": sowing_date + timedelta(days=76), "end_date": sowing_date + timedelta(days=110), "description": "Grain filling and maturation"}
            ]
        else:
            # Default generic stages for other crops
            stages = [
                {"name": "Sowing", "start_date": sowing_date, "end_date": sowing_date + timedelta(days=10), "description": "Germination and emergence"},
                {"name": "Vegetative", "start_date": sowing_date + timedelta(days=11), "end_date": sowing_date + timedelta(days=50), "description": "Vegetative growth"},
                {"name": "Flowering", "start_date": sowing_date + timedelta(days=51), "end_date": sowing_date + timedelta(days=80), "description": "Flowering and fruit development"},
                {"name": "Harvest", "start_date": sowing_date + timedelta(days=81), "end_date": sowing_date + timedelta(days=110), "description": "Ripening and maturation"}
            ]
        
        # Save stages to database
        saved_stages = []
        for stage in stages:
            new_stage = CropStage(
                session_id=session.id,
                name=stage["name"],
                start_date=stage["start_date"],
                end_date=stage["end_date"],
                description=stage["description"]
            )
            db.add(new_stage)
            db.commit()
            db.refresh(new_stage)
            
            saved_stages.append(CropStageCreate(
                id=new_stage.id,
                name=new_stage.name,
                start_date=new_stage.start_date,
                end_date=new_stage.end_date,
                description=new_stage.description
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

@router.get("/stages/{session_id}", response_model=List[CropStageCreate])
async def get_crop_stages(
    session_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get lifecycle stages for a crop session"""
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
        
        # Fetch stages from database
        stages = db.query(CropStage).filter(
            CropStage.session_id == session_id
        ).all()
        
        if not stages:
            # Return empty list if no stages exist yet
            return []
        
        # Format stages for response
        stage_responses = []
        for stage in stages:
            stage_responses.append(CropStageCreate(
                id=stage.id,
                name=stage.name,
                start_date=stage.start_date,
                end_date=stage.end_date,
                description=stage.description
            ))
        
        return stage_responses
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get crop stages: {str(e)}"
        )

# 3. Reminder Scheduler
@router.post("/reminders/{session_id}", response_model=List[ReminderCreate])
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
                    {"title": "First fertilizer application", "due_date": stage.start_date + timedelta(days=5), "type": "fertilizer", "description": "Apply first dose of fertilizer"},
                    {"title": "Regular watering", "due_date": stage.start_date + timedelta(days=7), "type": "irrigation", "description": "Maintain regular watering schedule"},
                    {"title": "Weed control", "due_date": stage.start_date + timedelta(days=10), "type": "maintenance", "description": "Remove weeds to prevent competition"}
                ])
            elif stage.name == "Flowering":
                reminders.extend([
                    {"title": "Second fertilizer application", "due_date": stage.start_date + timedelta(days=5), "type": "fertilizer", "description": "Apply second dose of fertilizer"},
                    {"title": "Pest inspection", "due_date": stage.start_date + timedelta(days=7), "type": "pest", "description": "Check for pests and diseases"},
                    {"title": "Support structures", "due_date": stage.start_date + timedelta(days=10), "type": "maintenance", "description": "Install support structures if needed"}
                ])
            elif stage.name == "Harvest":
                reminders.extend([
                    {"title": "Prepare for harvest", "due_date": stage.start_date + timedelta(days=5), "type": "harvest", "description": "Prepare tools and storage for harvest"},
                    {"title": "Check maturity", "due_date": stage.start_date + timedelta(days=15), "type": "harvest", "description": "Check crop maturity signs"},
                    {"title": "Plan harvest date", "due_date": stage.end_date - timedelta(days=7), "type": "harvest", "description": "Finalize harvest date based on maturity and weather"}
                ])
          # Save reminders to database
        # Save reminders to database
        saved_reminders = []
        for reminder in reminders:
            new_reminder = Reminder(
                crop_session_id=session.id,
                title=reminder["title"],
                reminder_date=reminder["due_date"],
                reminder_type=reminder["type"],
                description=reminder["description"],
                completed=0
            )
            db.add(new_reminder)
            db.commit()
            db.refresh(new_reminder)
            
            saved_reminders.append(ReminderCreate(
                id=new_reminder.id,
                title=new_reminder.title,
                due_date=new_reminder.reminder_date,
                type=new_reminder.reminder_type,
                description=new_reminder.description,
                status="pending" if new_reminder.completed == 0 else "completed"
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

# GET Reminders for a Session
@router.get("/reminders/{session_id}", response_model=List[ReminderCreate])
async def get_reminders(
    session_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get reminders for a specific crop session"""
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
        
        # Get reminders for the session
        reminders = db.query(Reminder).filter(
            Reminder.crop_session_id == session_id
        ).all()
        
        # Format reminders for response
        reminder_responses = []
        for reminder in reminders:
            reminder_responses.append(ReminderCreate(
                id=reminder.id,
                title=reminder.title,
                due_date=reminder.reminder_date,
                type=reminder.reminder_type,
                description=reminder.description,
                status="pending" if reminder.completed == 0 else "completed"
            ))
        
        return reminder_responses
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get reminders: {str(e)}"
        )

# 4. Pest/Disease Alert Fetcher
@router.get("/pest-alerts/{session_id}", response_model=List[PestAlertCreate])
async def get_pest_alerts(
    session_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get pest and disease alerts for a crop based on region and stage"""
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
        
        if not current_stage:
            # If no current stage, find the upcoming stage
            current_stage = db.query(CropStage).filter(
                CropStage.session_id == session_id,
                CropStage.start_date > current_date
            ).order_by(CropStage.start_date).first()
        
        # Generate alerts based on crop, region, and stage
        alerts = []
        
        # Example pest/disease data for demonstration
        pest_data = {
            "rice": {
                "Vegetative": [
                    {"name": "Rice stem borer", "severity": "medium", "description": "Larvae bore into stems causing deadhearts", "treatment": "Apply neem-based pesticides"},
                    {"name": "Brown planthopper", "severity": "high", "description": "Sucks sap from leaves causing yellowing", "treatment": "Maintain field drainage and apply approved insecticides"}
                ],
                "Flowering": [
                    {"name": "Rice blast", "severity": "high", "description": "Fungal disease affecting leaves and panicles", "treatment": "Apply fungicides and ensure proper spacing"}
                ]
            },
            "wheat": {
                "Vegetative": [
                    {"name": "Aphids", "severity": "medium", "description": "Small insects that suck plant sap", "treatment": "Introduce beneficial insects or apply insecticidal soap"},
                    {"name": "Powdery mildew", "severity": "medium", "description": "White powdery coating on leaves", "treatment": "Apply sulfur-based fungicides"}
                ],
                "Flowering": [
                    {"name": "Rust", "severity": "high", "description": "Fungal disease causing orange-brown pustules", "treatment": "Apply fungicides at first sign of infection"}
                ]
            }
        }
        
        if current_stage:
            crop = session.crop_name.lower()
            stage = current_stage.name
            
            # Get pest data for this crop and stage
            crop_pests = pest_data.get(crop, {})
            stage_pests = crop_pests.get(stage, [])
            
            for pest in stage_pests:
                new_alert = PestAlert(
                    session_id=session.id,
                    name=pest["name"],
                    detection_date=datetime.now(),
                    severity=pest["severity"],
                    description=pest["description"],
                    recommended_action=pest["treatment"]
                )
                db.add(new_alert)
                db.commit()
                db.refresh(new_alert)
                
                alerts.append(PestAlertCreate(
                    id=new_alert.id,
                    name=new_alert.name,
                    detection_date=new_alert.detection_date,
                    severity=new_alert.severity,
                    description=new_alert.description,
                    recommended_action=new_alert.recommended_action
                ))
        
        return alerts
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
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
    """Predict harvest time based on crop, sowing date, and weather data"""
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
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Harvest stage not found. Generate stages first."
            )
        
        # Confidence scores based on crop type
        confidence_scores = {
            "rice": 0.85,
            "wheat": 0.9,
            "corn": 0.8,
            "maize": 0.8
        }
        
        crop = session.crop_name.lower()
        confidence = confidence_scores.get(crop, 0.75)
        
        return {
            "predicted_harvest_date": harvest_stage.start_date,
            "expected_end_date": harvest_stage.end_date,
            "confidence_score": confidence,
            "factors": [
                "Crop type and variety",
                "Regional climate patterns",
                "Current growing conditions"
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
@router.post("/farm-inputs/{session_id}", response_model=FarmInputCreate)
async def add_farm_input(
    session_id: int,
    input_data: FarmInputCreate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Track farm inputs like fertilizer, irrigation, pesticide, etc."""
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
            )        # Create new farm input record
        new_input = FarmInput(
            crop_session_id=session.id,
            input_type=input_data.type,
            name=input_data.name,
            quantity=input_data.quantity,
            unit=input_data.unit,
            application_date=input_data.application_date,
            cost=input_data.cost,
            notes=input_data.notes
        )
        
        db.add(new_input)
        db.commit()
        db.refresh(new_input)
        
        return FarmInputCreate(
            id=new_input.id,
            type=new_input.input_type,
            name=new_input.name,
            quantity=new_input.quantity,
            unit=new_input.unit,
            application_date=new_input.application_date,
            cost=new_input.cost,
            notes=new_input.notes
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
@router.post("/harvest-record/{session_id}", response_model=HarvestRecordCreate)
async def record_harvest(
    session_id: int,
    harvest_data: HarvestRecordCreate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record harvest output and link to crop session"""
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
        new_record = HarvestRecord(
            session_id=session.id,
            harvest_date=harvest_data.harvest_date,
            quantity=harvest_data.quantity,
            unit=harvest_data.unit,
            quality_grade=harvest_data.quality_grade,
            sale_price=harvest_data.sale_price,
            notes=harvest_data.notes
        )
        
        db.add(new_record)
        
        # Update session status to completed
        session.status = "completed"
        
        db.commit()
        db.refresh(new_record)
        
        return HarvestRecordCreate(
            id=new_record.id,
            harvest_date=new_record.harvest_date,
            quantity=new_record.quantity,
            unit=new_record.unit,
            quality_grade=new_record.quality_grade,
            sale_price=new_record.sale_price,
            notes=new_record.notes
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record harvest: {str(e)}"
        )

# GET endpoint for harvest records
@router.get("/harvest-records/{session_id}", response_model=List[HarvestRecordCreate])
async def get_harvest_records(
    session_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get harvest records for a specific crop session"""
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
        
        # Get harvest records for the session
        records = db.query(HarvestRecord).filter(
            HarvestRecord.session_id == session_id
        ).all()
        
        # Format records for response
        record_responses = []
        for record in records:
            record_responses.append(HarvestRecordCreate(
                id=record.id,
                harvest_date=record.harvest_date,
                quantity=record.quantity,
                unit=record.unit,
                quality_grade=record.quality_grade,
                sale_price=record.sale_price,
                notes=record.notes
            ))
        
        return record_responses
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get harvest records: {str(e)}"
        )

# 8. Reports Generator (Fertilizer, Productivity)
@router.get("/reports/{session_id}")
async def generate_reports(
    session_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate summary reports of farm inputs vs outcome"""
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
        
        # Get all farm inputs
        inputs = db.query(FarmInput).filter(
            FarmInput.crop_session_id == session_id
        ).all()
        
        # Get harvest record
        harvest = db.query(HarvestRecord).filter(
            HarvestRecord.session_id == session_id
        ).first()
        
        if not harvest:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No harvest record found. Record harvest first."
            )
        
        # Calculate total input cost
        total_cost = sum(input_item.cost for input_item in inputs)
        
        # Calculate revenue
        revenue = harvest.quantity * harvest.sale_price if harvest.sale_price else 0
        
        # Calculate profit/loss
        profit_loss = revenue - total_cost
          # Create input summary by type
        input_summary = {}
        for input_item in inputs:
            if input_item.input_type not in input_summary:
                input_summary[input_item.input_type] = {
                    "count": 0,
                    "total_cost": 0,
                    "items": []
                }
            
            input_summary[input_item.input_type]["count"] += 1
            input_summary[input_item.input_type]["total_cost"] += input_item.cost
            input_summary[input_item.input_type]["items"].append({
                "name": input_item.name,
                "quantity": input_item.quantity,
                "unit": input_item.unit,
                "application_date": input_item.application_date.isoformat(),
                "cost": input_item.cost
            })
        
        # Generate productivity metrics
        productivity = {
            "yield_per_area": harvest.quantity / session.land_area if session.land_area else 0,
            "cost_per_unit": total_cost / harvest.quantity if harvest.quantity else 0,
            "revenue_per_unit": harvest.sale_price if harvest.sale_price else 0,
            "profit_per_area": profit_loss / session.land_area if session.land_area else 0
        }
        
        # Create report record
        report_data = {
            "input_summary": input_summary,
            "harvest_summary": {
                "date": harvest.harvest_date.isoformat(),
                "quantity": harvest.quantity,
                "unit": harvest.unit,
                "quality_grade": harvest.quality_grade,
                "sale_price": harvest.sale_price
            },
            "financial_summary": {
                "total_cost": total_cost,
                "revenue": revenue,
                "profit_loss": profit_loss
            },
            "productivity_metrics": productivity
        }
          # Save report to database
        new_report = Report(
            user_id=current_user.id,
            report_type="season_summary",
            title=f"Crop Report: {session.crop_name} (ID: {session.id})",
            content=json.dumps(report_data),
            generated_date=datetime.now()
        )
        
        db.add(new_report)
        db.commit()
        
        return report_data
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
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
    """Provide data for visual breakdown of seasonal data"""
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
        
        # Get all farm inputs
        inputs = db.query(FarmInput).filter(
            FarmInput.crop_session_id == session_id
        ).all()
        
        # Get harvest record
        harvest = db.query(HarvestRecord).filter(
            HarvestRecord.session_id == session_id
        ).first()
        
        if not harvest:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No harvest record found. Record harvest first."
            )
          # Prepare cost breakdown by type
        cost_by_type = {}
        for input_item in inputs:
            if input_item.input_type not in cost_by_type:
                cost_by_type[input_item.input_type] = 0
            cost_by_type[input_item.input_type] += input_item.cost
        
        # Prepare cost breakdown by month
        cost_by_month = {}
        for input_item in inputs:
            # Ensure application_date is properly handled
            if hasattr(input_item.application_date, 'strftime'):
                month = input_item.application_date.strftime("%Y-%m")
            else:
                # If it's already a string or other format, handle gracefully
                month = str(input_item.application_date)[:7] if input_item.application_date else "unknown"
            
            if month not in cost_by_month:
                cost_by_month[month] = 0
            cost_by_month[month] += input_item.cost
        
        # Prepare cost vs revenue data
        total_cost = sum(input_item.cost for input_item in inputs if input_item.cost)
        revenue = (harvest.quantity * harvest.sale_price) if (harvest.sale_price and harvest.quantity) else 0
        profit = revenue - total_cost
        roi = ((revenue - total_cost) / total_cost * 100) if total_cost > 0 else 0
        
        # Calculate days from sowing to harvest
        if harvest.harvest_date and session.sowing_date:
            # Ensure both dates are datetime objects for proper subtraction
            if hasattr(harvest.harvest_date, 'date'):
                harvest_date = harvest.harvest_date.date()
            else:
                harvest_date = harvest.harvest_date
                
            if hasattr(session.sowing_date, 'date'):
                sowing_date = session.sowing_date.date()
            else:
                sowing_date = session.sowing_date
                
            days_to_harvest = (harvest_date - sowing_date).days
        else:
            days_to_harvest = 90  # Default to 90 days if dates are missing
        
        # Generate mock growth trends data (since we don't have daily growth records)
        growth_trends_data = []
        for day in range(0, days_to_harvest, 7):  # Weekly data points
            growth_trends_data.append({
                "day": day,
                "height": min(day * 2.5, 150),  # Mock height progression
                "predicted": min(day * 2.8, 160),  # Slightly higher prediction
                "growth_rate": max(0, 3.5 - (day / 30) * 0.5)  # Decreasing growth rate over time
            })
        
        # Generate yield analysis data
        harvest_quantity = harvest.quantity if harvest.quantity else 0
        yield_comparison_data = [
            {"category": "Actual", "actual": harvest_quantity, "target": harvest_quantity * 0.9},
            {"category": "Expected", "actual": harvest_quantity, "target": harvest_quantity * 1.1}
        ]
        
        yield_distribution_data = [
            {"name": "High Quality", "value": 70},
            {"name": "Medium Quality", "value": 25},
            {"name": "Low Quality", "value": 5}
        ]
        
        # Generate correlation data (mock environmental factors)
        correlation_data = []
        for i in range(10):
            correlation_data.append({
                "temperature": 20 + i * 2,
                "yield": harvest_quantity * (0.8 + i * 0.04),
                "humidity": 60 + i * 3
            })
        
        # Cost analysis data
        cost_trends_data = []
        monthly_costs = {}
        for input_item in inputs:
            # Ensure application_date is properly handled for monthly breakdown
            if hasattr(input_item.application_date, 'strftime'):
                month = input_item.application_date.strftime("%Y-%m")
            else:
                month = str(input_item.application_date)[:7] if input_item.application_date else "unknown"
                
            if month not in monthly_costs:
                monthly_costs[month] = {"period": month, "seeds": 0, "fertilizer": 0, "labor": 0, "others": 0}
            
            cost_type = input_item.input_type.lower()
            if cost_type in ["seed", "seeds"]:
                monthly_costs[month]["seeds"] += input_item.cost
            elif cost_type in ["fertilizer", "nutrients"]:
                monthly_costs[month]["fertilizer"] += input_item.cost
            elif cost_type == "labor":
                monthly_costs[month]["labor"] += input_item.cost
            else:
                monthly_costs[month]["others"] += input_item.cost
        
        cost_trends_data = list(monthly_costs.values())
        
        # Cost breakdown data for pie chart
        cost_breakdown_data = []
        for input_type, amount in cost_by_type.items():
            percentage = (amount / total_cost * 100) if total_cost > 0 else 0
            cost_breakdown_data.append({
                "name": input_type.title(),
                "amount": amount,
                "percentage": round(percentage, 1)
            })
        
        # Cost efficiency data
        efficiency_data = []
        for input_type, amount in cost_by_type.items():
            efficiency = min(100, (amount / (total_cost / len(cost_by_type)) * 80))  # Mock efficiency calculation
            efficiency_data.append({
                "category": input_type.title(),
                "efficiency": round(efficiency, 1)
            })
        
        # Performance radar data
        harvest_quantity = harvest.quantity if harvest.quantity else 1  # Avoid division by zero
        land_area = session.land_area if session.land_area else 1  # Avoid division by zero
        
        performance_data = [
            {"metric": "Yield", "current": min(100, (harvest_quantity / (land_area * 50)) * 100), "average": 75},
            {"metric": "Cost Efficiency", "current": min(100, roi + 50), "average": 60},
            {"metric": "Quality", "current": 85, "average": 70},
            {"metric": "Timeliness", "current": 90, "average": 80},
            {"metric": "Sustainability", "current": 75, "average": 65},
            {"metric": "Profitability", "current": min(100, max(0, roi + 50)), "average": 55}
        ]
        
        performance_metrics = [
            {"name": "Yield Efficiency", "current": round((harvest_quantity / land_area), 2), "target": 50, "unit": "kg/acre"},
            {"name": "Cost per Unit", "current": round((total_cost / harvest_quantity), 2) if harvest_quantity > 0 else 0, "target": 25, "unit": "₹/kg"},
            {"name": "ROI", "current": round(roi, 1), "target": 20, "unit": "%"},
            {"name": "Profit Margin", "current": round((profit / revenue * 100), 1) if revenue > 0 else 0, "target": 30, "unit": "%"}
        ]

        # Calculate growth trends metrics
        avg_growth_rate = sum(d["growth_rate"] for d in growth_trends_data) / len(growth_trends_data) if growth_trends_data else 0
        
        # Calculate variability (standard deviation of growth rates)
        if growth_trends_data and len(growth_trends_data) > 1:
            growth_rates = [d["growth_rate"] for d in growth_trends_data]
            variance = sum((x - avg_growth_rate) ** 2 for x in growth_rates) / len(growth_rates)
            variability = variance ** 0.5  # Standard deviation
        else:
            variability = 0
        
        # Determine growth trend
        if avg_growth_rate > 2.5:
            growth_trend = "increasing"
        elif avg_growth_rate < 1.5:
            growth_trend = "decreasing"
        else:
            growth_trend = "stable"

        return {
            "growth_trends": {
                "data": growth_trends_data,
                "peak_growth_day": max(growth_trends_data, key=lambda x: x["growth_rate"])["day"] if growth_trends_data else 0,
                "avg_growth_rate": avg_growth_rate,
                "efficiency_score": min(100, roi + 60),
                "variability": round(variability, 2),
                "growth_trend": growth_trend,
                "growth_rate_data": [{"day": d["day"], "growth_rate": d["growth_rate"]} for d in growth_trends_data]
            },
            "yield_analysis": {
                "comparison_data": yield_comparison_data,
                "distribution_data": yield_distribution_data,
                "correlation_data": correlation_data,
                "total_yield": harvest_quantity,
                "yield_per_acre": round(harvest_quantity / land_area, 2)
            },
            "cost_analysis": {
                "trends_data": cost_trends_data,
                "breakdown_data": cost_breakdown_data,
                "efficiency_data": efficiency_data,
                "total_cost": total_cost,
                "cost_per_unit": round(total_cost / harvest_quantity, 2)
            },
            "performance_radar": {
                "data": performance_data,
                "metrics": performance_metrics,
                "overall_score": round(sum(d["current"] for d in performance_data) / len(performance_data), 1)
            },
            # Legacy data for backward compatibility
            "cost_by_type": {
                "labels": list(cost_by_type.keys()),
                "data": list(cost_by_type.values())
            },
            "cost_by_month": {
                "labels": list(cost_by_month.keys()),
                "data": list(cost_by_month.values())
            },
            "cost_vs_revenue": {
                "labels": ["Cost", "Revenue"],
                "data": [total_cost, revenue]
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
                FarmInput.crop_session_id == session.id
            ).all()
            
            total_cost = sum(item.cost for item in inputs)
            revenue = harvest.quantity * harvest.sale_price if harvest.sale_price else 0
            profit = revenue - total_cost
            
            # Calculate ROI
            roi = ((revenue - total_cost) / total_cost * 100) if total_cost > 0 else 0
            
            # Calculate cost breakdown
            cost_breakdown = {}
            for input_item in inputs:
                if input_item.input_type not in cost_breakdown:
                    cost_breakdown[input_item.input_type] = 0
                cost_breakdown[input_item.input_type] += input_item.cost
            
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

# 11. Analytics Data Insertion
@router.post("/analytics/{session_id}")
async def save_farm_analytics(
    session_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save farm performance metrics to the database"""
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
        
        # Get all farm inputs
        inputs = db.query(FarmInput).filter(
            FarmInput.crop_session_id == session_id
        ).all()
        
        # Get harvest record
        harvest = db.query(HarvestRecord).filter(
            HarvestRecord.session_id == session_id
        ).first()
        
        if not harvest:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No harvest record found. Record harvest first."
            )
          # Calculate analytics
        total_cost = sum(input_item.cost for input_item in inputs)
        revenue = harvest.quantity * harvest.sale_price if harvest.sale_price else 0
        roi = ((revenue - total_cost) / total_cost * 100) if total_cost > 0 else 0
        yield_per_area = harvest.quantity / session.land_area if session.land_area else 0
        
        # Cost breakdown
        cost_breakdown = {}
        for input_item in inputs:
            if input_item.input_type not in cost_breakdown:
                cost_breakdown[input_item.input_type] = 0
            cost_breakdown[input_item.input_type] += input_item.cost
        
        # Check if analytics already exists
        existing_analytics = db.query(Analytics).filter(
            Analytics.session_id == session_id
        ).first()
        
        if existing_analytics:            # Calculate cost percentages
            cost_percentages = {}
            if total_cost > 0:
                for input_type, cost in cost_breakdown.items():
                    cost_percentages[input_type] = (cost / total_cost) * 100
            
            # Update existing analytics
            existing_analytics.yield_amount = harvest.quantity
            existing_analytics.yield_unit = harvest.unit
            existing_analytics.yield_per_area = yield_per_area
            existing_analytics.area_unit = "hectare"  # Default area unit
            existing_analytics.total_cost = total_cost
            existing_analytics.revenue = revenue
            existing_analytics.profit = revenue - total_cost
            existing_analytics.roi = roi
            existing_analytics.cost_breakdown = json.dumps(cost_breakdown)
            existing_analytics.cost_percentage = json.dumps(cost_percentages)
            existing_analytics.updated_at = datetime.now()
            
            db.commit()
            return {"message": "Analytics data updated successfully", "id": existing_analytics.id}
        else:            # Calculate cost percentages
            cost_percentages = {}
            if total_cost > 0:
                for input_type, cost in cost_breakdown.items():
                    cost_percentages[input_type] = (cost / total_cost) * 100
            
            # Create new analytics entry
            new_analytics = Analytics(
                session_id=session_id,
                yield_amount=harvest.quantity,
                yield_unit=harvest.unit,
                yield_per_area=yield_per_area,
                area_unit="hectare",  # Default area unit
                total_cost=total_cost,
                revenue=revenue,
                profit=revenue - total_cost,
                roi=roi,
                cost_breakdown=json.dumps(cost_breakdown),
                cost_percentage=json.dumps(cost_percentages)
            )
            
            db.add(new_analytics)
            db.commit()
            db.refresh(new_analytics)
            
            return {"message": "Analytics data saved successfully", "id": new_analytics.id}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save farm analytics: {str(e)}"
        )

# 12. Frontend Integration Verification
@router.get("/sessions", response_model=List[CropSessionResponse])
async def get_user_crop_sessions(
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all crop sessions for the current user"""
    try:
        sessions = db.query(CropSession).filter(
            CropSession.user_id == current_user.id
        ).order_by(CropSession.created_at.desc()).all()
        
        result = []
        for session in sessions:
            try:
                result.append(CropSessionResponse(
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
                ))
            except Exception as session_error:
                print(f"Error processing session {session.id}: {str(session_error)}")
                # Continue processing other sessions instead of failing completely
        
        return result
        
    except Exception as e:
        print(f"Failed to get crop sessions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get crop sessions: {str(e)}"
        )

# 13. Backend Connection - Get Session Details
@router.get("/sessions/{session_id}", response_model=CropSessionResponse)
async def get_crop_session(
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
            detail=f"Failed to get crop session: {str(e)}"
        )

# 14. PDF Report Generator
@router.get("/report/pdf-download/{session_id}")
async def generate_pdf_report(
    session_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate and return a PDF report link for download"""
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
        
        # Generate a filename
        filename = f"{session.crop_name.lower().replace(' ', '_')}_{session.sowing_date.strftime('%Y%m%d')}_report.pdf"
        
        return {
            "pdf_url": f"/api/crop-management/reports/download/{filename}",
            "filename": filename,
            "generated_at": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF report: {str(e)}"
        )

# 15. Error Handling & Retry - Get Farm Inputs
@router.get("/farm-inputs/{session_id}", response_model=List[FarmInputCreate])
async def get_farm_inputs(
    session_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all farm inputs for a specific crop session"""
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
        
        inputs = db.query(FarmInput).filter(
            FarmInput.crop_session_id == session_id
        ).order_by(FarmInput.application_date).all()
        
        return [
            FarmInputCreate(
                id=input_item.id,
                type=input_item.input_type,
                name=input_item.name,
                quantity=input_item.quantity,
                unit=input_item.unit,
                application_date=input_item.application_date,
                cost=input_item.cost,
                notes=input_item.notes
            ) for input_item in inputs
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get farm inputs: {str(e)}"
        )

# 16. Farm Analytics (Yield, Cost, ROI)
@router.get("/analytics/{session_id}")
async def get_farm_analytics(
    session_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Calculate farm performance metrics including yield, cost, and ROI"""
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
          # Get all farm inputs
        inputs = db.query(FarmInput).filter(
            FarmInput.crop_session_id == session_id
        ).all()
        
        # Get harvest record
        harvest = db.query(HarvestRecord).filter(
            HarvestRecord.session_id == session_id
        ).first()
        
        if not harvest:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No harvest record found. Record harvest first."
            )
        
        # Calculate metrics
        total_cost = sum(input_item.cost for input_item in inputs)
        revenue = harvest.quantity * harvest.sale_price if harvest.sale_price else 0
        roi = ((revenue - total_cost) / total_cost * 100) if total_cost > 0 else 0
        yield_per_area = harvest.quantity / session.land_area if session.land_area else 0
          # Cost breakdown
        cost_breakdown = {}
        for input_item in inputs:
            if input_item.input_type not in cost_breakdown:
                cost_breakdown[input_item.input_type] = 0
            cost_breakdown[input_item.input_type] += input_item.cost
        
        # Cost percentage
        cost_percentage = {}
        for input_type, cost in cost_breakdown.items():
            cost_percentage[input_type] = (cost / total_cost * 100) if total_cost > 0 else 0
        
        return {
            "yield": harvest.quantity,
            "yield_unit": harvest.unit,
            "yield_per_area": yield_per_area,
            "total_cost": total_cost,
            "revenue": revenue,
            "profit": revenue - total_cost,
            "roi": roi,
            "cost_breakdown": cost_breakdown,
            "cost_percentage": cost_percentage
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get farm analytics: {str(e)}"
        )

# 17. Fertilizer, Crop Health, Productivity Reports
@router.get("/detailed-reports/{session_id}")
async def get_detailed_reports(
    session_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate detailed reports on fertilizer usage, crop health, and productivity"""
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
          # Get data
        inputs = db.query(FarmInput).filter(FarmInput.crop_session_id == session_id).all()
        harvest = db.query(HarvestRecord).filter(HarvestRecord.session_id == session_id).first()
        stages = db.query(CropStage).filter(CropStage.session_id == session_id).order_by(CropStage.start_date).all()
        pest_alerts = db.query(PestAlert).filter(PestAlert.session_id == session_id).all()
        
        if not harvest:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No harvest record found. Record harvest first."
            )
        
        # Fertilizer Report
        fertilizer_inputs = [item for item in inputs if item.input_type == "fertilizer"]
        fertilizer_report = {
            "total_applications": len(fertilizer_inputs),
            "total_cost": sum(item.cost for item in fertilizer_inputs),
            "applications": [
                {
                    "name": item.name,
                    "date": item.application_date.isoformat(),
                    "quantity": item.quantity,
                    "unit": item.unit,
                    "cost": item.cost,
                    "notes": item.notes
                } for item in fertilizer_inputs
            ]
        }
        
        # Crop Health Report
        health_index = 100
        for alert in pest_alerts:
            if alert.severity == "low":
                health_index -= 5
            elif alert.severity == "medium":
                health_index -= 10
            elif alert.severity == "high":
                health_index -= 20
        health_index = max(0, health_index)
        
        health_report = {
            "overall_health_index": health_index,
            "pest_disease_incidents": len(pest_alerts),
            "alerts": [
                {
                    "name": alert.name,
                    "detection_date": alert.detection_date.isoformat(),
                    "severity": alert.severity,
                    "description": alert.description,
                    "recommended_action": alert.recommended_action
                } for alert in pest_alerts
            ]
        }
        
        # Productivity Report
        total_cost = sum(item.cost for item in inputs)
        revenue = harvest.quantity * harvest.sale_price if harvest.sale_price else 0
        profit = revenue - total_cost
        
        productivity_report = {
            "yield": harvest.quantity,
            "yield_unit": harvest.unit,
            "yield_per_area": harvest.quantity / session.land_area if session.land_area else 0,
            "cost_per_unit": total_cost / harvest.quantity if harvest.quantity else 0,
            "revenue_per_unit": harvest.sale_price if harvest.sale_price else 0,
            "profit_per_area": profit / session.land_area if session.land_area else 0
        }
        
        # Calculate session duration (convert both to date for comparison)
        if harvest.harvest_date and session.sowing_date:
            harvest_date = harvest.harvest_date if isinstance(harvest.harvest_date, date) else harvest.harvest_date.date()
            sowing_date = session.sowing_date.date() if isinstance(session.sowing_date, datetime) else session.sowing_date
            session_duration = (harvest_date - sowing_date).days
        else:
            session_duration = 0
        
        # Calculate overall rating (simple algorithm based on health and productivity)
        productivity_score = min(100, (harvest.quantity / session.land_area * 10)) if session.land_area else 50
        overall_rating = ((health_index + productivity_score) / 200) * 5
        
        # Key metrics for dashboard
        key_metrics = [
            {
                "name": "Yield Efficiency",
                "value": f"{productivity_report['yield_per_area']:.2f} {harvest.unit}/area",
                "status": "excellent" if productivity_report['yield_per_area'] > 5 else "good",
                "change": 15  # Mock change percentage
            },
            {
                "name": "Cost Efficiency", 
                "value": f"₹{productivity_report['cost_per_unit']:.2f}/unit",
                "status": "good" if productivity_report['cost_per_unit'] < 50 else "fair",
                "change": -8
            },
            {
                "name": "Health Score",
                "value": f"{health_index}%",
                "status": "excellent" if health_index >= 90 else "good" if health_index >= 70 else "fair",
                "change": 5
            },
            {
                "name": "Profitability",
                "value": f"₹{profit:.2f}",
                "status": "excellent" if profit > 10000 else "good" if profit > 5000 else "fair",
                "change": 20
            }
        ]
        
        return {
            # Main overview data
            "total_yield": harvest.quantity,
            "yield_unit": harvest.unit,
            "session_duration": session_duration,
            "overall_rating": round(overall_rating, 1),
            "generated_at": datetime.utcnow().isoformat(),
            "key_metrics": key_metrics,
            
            # Detailed reports (keeping original structure for compatibility)
            "fertilizer_report": fertilizer_report,
            "health_report": health_report,
            "productivity_report": productivity_report,
            
            # Timeline data (frontend expects 'timeline' not 'timeline_events')
            "timeline": [
                {
                    "date": stage.start_date.isoformat(),
                    "stage": f"{stage.name} Stage",
                    "status": "completed" if stage.end_date else "in_progress",
                    "description": stage.description,
                    "notes": f"Duration: {(stage.end_date - stage.start_date).days if stage.end_date else 'Ongoing'} days"
                } for stage in stages
            ] + [
                {
                    "date": item.application_date.isoformat(),
                    "stage": f"Applied {item.name}",
                    "status": "completed",
                    "description": f"Input application: {item.quantity} {item.unit}",
                    "notes": item.notes
                } for item in inputs
            ] + [
                {
                    "date": alert.detection_date.isoformat(),
                    "stage": f"Pest Alert: {alert.name}",
                    "status": alert.severity,
                    "description": alert.description,
                    "notes": alert.recommended_action
                } for alert in pest_alerts
            ],
            
            # Performance data (matching frontend expectations)
            "actual_yield": harvest.quantity,
            "expected_yield": harvest.quantity * 1.1,  # Mock expected yield (10% higher)
            "yield_variance": 10,  # Mock variance percentage
            "quality_metrics": [
                {"name": "Grade", "value": harvest.quality_grade or "A", "rating": "excellent"},
                {"name": "Moisture Content", "value": "12%", "rating": "good"},
                {"name": "Protein Content", "value": "13%", "rating": "excellent"}
            ],
            
            # Performance metrics (keeping for compatibility)
            "performance_metrics": {
                "yield_per_area": productivity_report['yield_per_area'],
                "cost_efficiency": productivity_report['cost_per_unit'],
                "revenue_per_unit": productivity_report['revenue_per_unit'],
                "profit_margin": (profit / revenue * 100) if revenue > 0 else 0,
                "health_score": health_index
            },
            
            # Financial data (matching frontend expectations)
            "total_cost": total_cost,
            "total_revenue": revenue,
            "net_profit": profit,
            "profit_margin": (profit / revenue * 100) if revenue > 0 else 0,
            "roi": (profit / total_cost * 100) if total_cost > 0 else 0,
            "cost_breakdown": {
                input_type: sum(i.cost for i in inputs if i.input_type == input_type)
                for input_type in set(item.input_type for item in inputs)
            },
            
            # Financial summary (keeping for compatibility)
            "financial_summary": {
                "total_investment": total_cost,
                "total_revenue": revenue,
                "net_profit": profit,
                "roi_percentage": (profit / total_cost * 100) if total_cost > 0 else 0,
                "cost_breakdown": [
                    {
                        "category": input_type,
                        "amount": sum(i.cost for i in inputs if i.input_type == input_type),
                        "percentage": (sum(i.cost for i in inputs if i.input_type == input_type) / total_cost * 100) if total_cost > 0 else 0
                    } for input_type in set(item.input_type for item in inputs)
                ]
            },
            
            # Stages info
            "stages": [
                {
                    "name": stage.name,
                    "start_date": stage.start_date.isoformat(),
                    "end_date": stage.end_date.isoformat() if stage.end_date else None,
                    "duration": (stage.end_date - stage.start_date).days if stage.end_date else None,
                    "description": stage.description,
                    "status": "completed" if stage.end_date else "in_progress"
                } for stage in stages
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get detailed reports: {str(e)}"
        )

# 18. Graphs: Output vs Cost, Comparison Trends (already implemented as get_graph_data)

# 19. Personalized Insights (AI Suggestions)
@router.get("/insights/{session_id}")
async def get_personalized_insights(
    session_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate AI-based personalized insights for crop/season"""
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
          # Get data
        inputs = db.query(FarmInput).filter(FarmInput.crop_session_id == session_id).all()
        harvest = db.query(HarvestRecord).filter(HarvestRecord.session_id == session_id).first()
        pest_alerts = db.query(PestAlert).filter(PestAlert.session_id == session_id).all()
        
        # Generate insights with more detailed structure
        insights = []
        
        # Input usage insights
        fertilizer_inputs = [item for item in inputs if item.input_type == "fertilizer"]
        if len(fertilizer_inputs) > 3:
            insights.append({
                "id": f"insight_fertilizer_{session_id}",
                "title": "Optimize Fertilizer Usage",
                "message": "Consider reducing fertilizer applications",
                "description": "Multiple fertilizer applications may lead to excessive growth and reduced yield quality. Consider soil testing before next season.",
                "reason": f"You applied fertilizer {len(fertilizer_inputs)} times this season",
                "recommendation_type": "efficiency",
                "priority": "medium",
                "category": "nutrition",
                "confidence": 85,
                "action_steps": [
                    "Conduct soil testing before next season",
                    "Create a fertilizer schedule based on soil test results",
                    "Consider slow-release fertilizers to reduce application frequency"
                ],
                "expected_impact": {
                    "cost_savings": "10-15%",
                    "yield_impact": "Neutral to positive",
                    "quality_improvement": "Moderate"
                },
                "created_at": datetime.now().isoformat()
            })
        elif len(fertilizer_inputs) == 0:
            insights.append({
                "id": f"insight_no_fertilizer_{session_id}",
                "title": "Consider Fertilizer Application",
                "message": "Add fertilizer applications for better yield",
                "description": "No fertilizer applications were recorded. Proper nutrition is essential for optimal crop growth and yield.",
                "reason": "No fertilizer applications were recorded this season",
                "recommendation_type": "improvement",
                "priority": "high",
                "category": "nutrition",
                "confidence": 90,
                "action_steps": [
                    "Conduct soil testing to determine nutrient deficiencies",
                    "Apply balanced NPK fertilizer according to crop requirements",
                    "Consider organic alternatives like compost or vermicompost"
                ],
                "expected_impact": {
                    "yield_increase": "20-30%",
                    "quality_improvement": "High",
                    "additional_cost": "Moderate"
                },
                "created_at": datetime.now().isoformat()
            })
        
        # Pest management insights
        if pest_alerts:
            high_severity_alerts = [alert for alert in pest_alerts if alert.severity == "high"]
            if high_severity_alerts:
                insights.append({
                    "id": f"insight_pest_mgmt_{session_id}",
                    "title": "Implement Preventative Pest Management",
                    "message": "Strengthen pest control measures for next season",
                    "description": "High-severity pest issues were detected this season. Implementing preventative measures can significantly reduce crop damage.",
                    "reason": f"{len(high_severity_alerts)} high-severity pest issues were detected",
                    "recommendation_type": "warning",
                    "priority": "high",
                    "category": "risk_management",
                    "confidence": 95,
                    "action_steps": [
                        "Install pest monitoring traps before planting",
                        "Practice crop rotation to break pest cycles",
                        "Use integrated pest management (IPM) approaches",
                        "Consider pest-resistant crop varieties"
                    ],
                    "expected_impact": {
                        "damage_reduction": "40-60%",
                        "yield_protection": "High",
                        "cost_efficiency": "Long-term savings"
                    },
                    "created_at": datetime.now().isoformat()
                })
        
        # Profitability insights
        if harvest and inputs:
            total_cost = sum(item.cost for item in inputs)
            revenue = harvest.quantity * harvest.sale_price if harvest.sale_price else 0
            profit = revenue - total_cost
            roi = ((revenue - total_cost) / total_cost * 100) if total_cost > 0 else 0
            
            if profit < 0:
                insights.append({
                    "id": f"insight_profitability_loss_{session_id}",
                    "title": "Improve Profitability",
                    "message": "This crop was not profitable",
                    "description": "Your expenses exceeded revenue this season. Consider cost optimization and yield improvement strategies.",
                    "reason": f"Your expenses (₹{total_cost:.2f}) exceeded your revenue (₹{revenue:.2f})",
                    "recommendation_type": "warning",
                    "priority": "high",
                    "category": "financial",
                    "confidence": 100,
                    "action_steps": [
                        "Analyze cost breakdown to identify major expense categories",
                        "Explore bulk purchasing for inputs to reduce costs",
                        "Research higher-yielding varieties",
                        "Consider value-added processing or direct marketing"
                    ],
                    "expected_impact": {
                        "cost_reduction": "15-25%",
                        "revenue_increase": "10-20%",
                        "profit_turnaround": "Positive"
                    },
                    "created_at": datetime.now().isoformat()
                })
            elif roi > 50:
                insights.append({
                    "id": f"insight_high_profit_{session_id}",
                    "title": "Excellent Profitability Achieved",
                    "message": "This crop was highly profitable",
                    "description": "Your profit margin exceeded 50%, indicating excellent farming efficiency and market timing.",
                    "reason": f"Your ROI was {roi:.1f}%, consider scaling up next season",
                    "recommendation_type": "success",
                    "priority": "medium",
                    "category": "financial",
                    "confidence": 100,
                    "action_steps": [
                        "Consider expanding acreage for this crop",
                        "Document successful practices for replication",
                        "Explore contract farming opportunities",
                        "Invest in improved infrastructure"
                    ],
                    "expected_impact": {
                        "scalability": "High",
                        "income_growth": "Significant",
                        "market_position": "Strong"
                    },
                    "created_at": datetime.now().isoformat()
                })
        
        # Timing and efficiency insights
        if harvest and session.sowing_date:
            # Ensure both dates are in the same format for proper subtraction
            if harvest.harvest_date:
                if hasattr(harvest.harvest_date, 'date'):
                    harvest_date = harvest.harvest_date.date()
                else:
                    harvest_date = harvest.harvest_date
                    
                if hasattr(session.sowing_date, 'date'):
                    sowing_date = session.sowing_date.date()
                else:
                    sowing_date = session.sowing_date
                    
                days_to_harvest = (harvest_date - sowing_date).days
            else:
                days_to_harvest = 0
            expected_days = 120  # Default expected days for most crops
            
            if days_to_harvest < expected_days * 0.8:
                insights.append({
                    "id": f"insight_early_harvest_{session_id}",
                    "title": "Early Harvest Achievement",
                    "message": "Crop matured earlier than expected",
                    "description": "Your crop reached maturity ahead of schedule, which can be advantageous for market timing.",
                    "reason": f"Harvest completed in {days_to_harvest} days (faster than typical {expected_days} days)",
                    "recommendation_type": "success",
                    "priority": "low",
                    "category": "optimization",
                    "confidence": 80,
                    "action_steps": [
                        "Document the factors that contributed to early maturity",
                        "Consider planting multiple cycles per year",
                        "Plan for early market entry next season"
                    ],
                    "expected_impact": {
                        "market_advantage": "Early market access",
                        "additional_cycles": "Possible",
                        "revenue_boost": "Seasonal premium pricing"
                    },
                    "created_at": datetime.now().isoformat()
                })
        
        # Generate weather-based insights (mock data)
        insights.append({
            "id": f"insight_weather_{session_id}",
            "title": "Weather Impact Analysis",
            "message": "Monitor weather patterns for optimal timing",
            "description": "Weather conditions significantly impact crop growth and yield. Stay informed about seasonal patterns.",
            "reason": "Weather monitoring helps optimize planting and harvesting decisions",
            "recommendation_type": "info",
            "priority": "medium",
            "category": "weather_tips",
            "confidence": 75,
            "action_steps": [
                "Subscribe to reliable weather forecasting services",
                "Plan planting dates based on historical weather data",
                "Implement weather-protective measures (irrigation, mulching)"
            ],
            "expected_impact": {
                "risk_reduction": "Moderate",
                "yield_stability": "Improved",
                "planning_accuracy": "Enhanced"
            },
            "created_at": datetime.now().isoformat()
        })
        
        # If no specific insights were generated, provide comprehensive generic ones
        if len(insights) <= 1:  # Only weather insight
            insights.extend([
                {
                    "id": f"insight_record_keeping_{session_id}",
                    "title": "Enhance Record Keeping",
                    "message": "Keep detailed records to get more personalized insights",
                    "description": "Comprehensive data collection enables AI to provide more targeted and valuable recommendations.",
                    "reason": "Limited data available for generating specific recommendations",
                    "recommendation_type": "info",
                    "priority": "medium",
                    "category": "optimization",
                    "confidence": 90,
                    "action_steps": [
                        "Record daily activities and observations",
                        "Track all input applications with dates and quantities",
                        "Monitor weather conditions and their effects",
                        "Document pest and disease occurrences"
                    ],
                    "expected_impact": {
                        "insight_quality": "Significantly improved",
                        "decision_making": "Data-driven",
                        "farm_efficiency": "Optimized"
                    },
                    "created_at": datetime.now().isoformat()
                }
            ])
        
        # Add default insights if no specific insights were generated
        if len(insights) == 0:
            insights.extend([
                {
                    "id": f"insight_general_1_{session_id}",
                    "title": "Get Started with Data Recording",
                    "message": "Record your farming activities to receive personalized insights",
                    "description": "By recording inputs, observations, and harvest data, our AI can provide tailored recommendations for your farming practices.",
                    "reason": "No data has been recorded for this crop session yet",
                    "recommendation_type": "optimization",
                    "priority": "medium",
                    "category": "optimization",
                    "confidence": 90,
                    "action_steps": [
                        "Record fertilizer and pesticide applications",
                        "Log growth observations and milestones",
                        "Document harvest details when ready"
                    ],
                    "expected_impact": {
                        "insight_quality": "Significantly improved",
                        "decision_making": "Data-driven",
                        "farm_efficiency": "Optimized"
                    },
                    "created_at": datetime.now().isoformat()
                },
                {
                    "id": f"insight_general_2_{session_id}",
                    "title": "Monitor Weather Patterns",
                    "message": "Keep track of weather conditions for better crop management",
                    "description": "Weather plays a crucial role in crop growth. Monitoring rainfall, temperature, and humidity helps in making informed decisions.",
                    "reason": "Weather monitoring improves farming success rates",
                    "recommendation_type": "weather_tips",
                    "priority": "low",
                    "category": "weather_tips",
                    "confidence": 85,
                    "action_steps": [
                        "Check daily weather forecasts",
                        "Record rainfall and temperature data",
                        "Adjust irrigation based on weather patterns"
                    ],
                    "expected_impact": {
                        "water_usage": "Optimized",
                        "crop_health": "Improved",
                        "yield_quality": "Enhanced"
                    },
                    "created_at": datetime.now().isoformat()
                },
                {
                    "id": f"insight_general_3_{session_id}",
                    "title": "Plan for Optimal Harvest Timing",
                    "message": "Timing your harvest correctly maximizes yield and quality",
                    "description": "Harvesting at the right time ensures maximum yield and quality. Monitor crop maturity indicators and market conditions.",
                    "reason": "Proper timing increases profitability and crop quality",
                    "recommendation_type": "timing",
                    "priority": "medium",
                    "category": "optimization",
                    "confidence": 80,
                    "action_steps": [
                        "Monitor crop maturity indicators",
                        "Check market prices and demand",
                        "Plan harvest logistics in advance"
                    ],
                    "expected_impact": {
                        "crop_quality": "Maximized",
                        "market_value": "Optimized",
                        "profit_margin": "Increased"
                    },
                    "created_at": datetime.now().isoformat()
                }
            ])
        
        # Calculate summary statistics
        high_priority_count = len([i for i in insights if i.get("priority") == "high"])
        avg_confidence = sum(i.get("confidence", 0) for i in insights) / len(insights) if insights else 0
        
        return {
            "insights": insights,
            "total_insights": len(insights),
            "high_priority_count": high_priority_count,
            "avg_confidence": round(avg_confidence, 1),
            "crop_name": session.crop_name,
            "season_dates": f"{session.sowing_date.isoformat()} to {harvest.harvest_date.isoformat() if harvest else 'ongoing'}",
            "generated_at": datetime.now().isoformat(),
            "categories": {
                "optimization": len([i for i in insights if i.get("category") == "optimization"]),
                "risk_management": len([i for i in insights if i.get("category") == "risk_management"]),
                "weather_tips": len([i for i in insights if i.get("category") == "weather_tips"]),
                "nutrition": len([i for i in insights if i.get("category") == "nutrition"]),
                "financial": len([i for i in insights if i.get("category") == "financial"])
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get personalized insights: {str(e)}"
        )

# 20. PDF Export (Analytics)
@router.post("/analytics/export-pdf")
async def export_analytics_pdf(
    data: Dict[str, Any] = Body(...),
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate and return a PDF report with analytics data"""
    try:
        # Debug logging
        print(f"PDF Export Request Data: {data}")
          # Validate the incoming data using the Pydantic model
        try:
            # Extract session_id with fallback
            if isinstance(data.get("session_id"), int):
                session_id = data.get("session_id")
            elif isinstance(data.get("session_id"), str) and data.get("session_id").isdigit():
                session_id = int(data.get("session_id"))
            else:
                raise ValueError("Invalid session_id: must be an integer")
                
            # Extract export options as a simple dictionary
            export_options_dict = data.get("export_options", {})
            if not isinstance(export_options_dict, dict):
                export_options_dict = {}
                
            # Create an instance of PDFExportOptions with sensible defaults
            export_options = PDFExportOptions()
            
            # Update attributes from request if they exist
            if "includeOverview" in export_options_dict:
                export_options.includeOverview = bool(export_options_dict["includeOverview"])
            if "includeDetailedReports" in export_options_dict:
                export_options.includeDetailedReports = bool(export_options_dict["includeDetailedReports"])
            if "includeCharts" in export_options_dict:
                export_options.includeCharts = bool(export_options_dict["includeCharts"])
            if "includeInsights" in export_options_dict:
                export_options.includeInsights = bool(export_options_dict["includeInsights"])
            if "includeFinancials" in export_options_dict:
                export_options.includeFinancials = bool(export_options_dict["includeFinancials"])
            if "includeTimeline" in export_options_dict:
                export_options.includeTimeline = bool(export_options_dict["includeTimeline"])
            if "includeRecommendations" in export_options_dict:
                export_options.includeRecommendations = bool(export_options_dict["includeRecommendations"])
                
        except Exception as e:
            print(f"Data Processing Error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Error processing PDF export request: {str(e)}"            )
                
        # Verify session ownership - use session_id from above
        session = db.query(CropSession).filter(
            CropSession.id == session_id,
            CropSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Crop session not found or unauthorized"
            )
        
        # Create a BytesIO buffer to store the PDF
        buffer = BytesIO()
        
        # Create the PDF document
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        
        # Styles
        styles = getSampleStyleSheet()
        title_style = styles["Title"]
        heading_style = styles["Heading1"]
        subheading_style = styles["Heading2"]
        normal_style = styles["Normal"]
        
        # Create a list to hold the PDF elements
        elements = []
        
        # Add title
        elements.append(Paragraph(f"Crop Analytics Report: {session.crop_name}", title_style))
        elements.append(Spacer(1, 0.25 * inch))
        
        # Add session information
        elements.append(Paragraph("Session Information", heading_style))
        elements.append(Spacer(1, 0.1 * inch))
        
        session_info = [
            ["Crop Name:", session.crop_name],
            ["Sowing Date:", session.sowing_date.strftime("%Y-%m-%d")],
            ["Land Area:", f"{session.land_area} hectares"],
            ["Expected Harvest:", session.expected_harvest_date.strftime("%Y-%m-%d") if session.expected_harvest_date else "Not set"],
            ["Actual Harvest:", session.actual_harvest_date.strftime("%Y-%m-%d") if session.actual_harvest_date else "Not harvested"],
            ["Status:", session.status]
        ]
        
        session_table = Table(session_info, colWidths=[2*inch, 3*inch])
        session_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.darkblue),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('BACKGROUND', (1, 0), (1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.lightgrey)
        ]))
        
        elements.append(session_table)
        elements.append(Spacer(1, 0.25 * inch))        # Fetch data based on export options
        include_overview = export_options.includeOverview if hasattr(export_options, 'includeOverview') else True
        if include_overview:
            elements.append(Paragraph("Overview Summary", heading_style))
            elements.append(Spacer(1, 0.1 * inch))
            
            # Get analytics data
            try:
                # Directly fetch inputs and harvest records since they're needed for analytics
                inputs = db.query(FarmInput).filter(FarmInput.crop_session_id == session_id).all()
                harvest = db.query(HarvestRecord).filter(HarvestRecord.session_id == session_id).first()
                
                if harvest:
                    # Calculate basic metrics
                    total_cost = sum(input_item.cost for input_item in inputs)
                    revenue = harvest.quantity * harvest.sale_price if harvest.sale_price else 0
                    profit = revenue - total_cost
                    roi = ((profit / total_cost) * 100) if total_cost > 0 else 0
                    
                    overview_data = [
                        ["Metric", "Value"],
                        ["Total Yield:", f"{harvest.quantity} {harvest.unit}"],
                        ["Total Cost:", f"${total_cost:.2f}"],
                        ["Total Revenue:", f"${revenue:.2f}"],
                        ["Profit/Loss:", f"${profit:.2f}"],
                        ["ROI:", f"{roi:.2f}%"]
                    ]
                    
                    overview_table = Table(overview_data, colWidths=[2.5*inch, 2.5*inch])
                    overview_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                        ('GRID', (0, 0), (-1, -1), 1, colors.black)
                    ]))
                    
                    elements.append(overview_table)
                else:
                    elements.append(Paragraph("No harvest data available for overview.", normal_style))
            except Exception as e:
                elements.append(Paragraph(f"Error fetching overview data: {str(e)}", normal_style))
            
            elements.append(Spacer(1, 0.25 * inch))        # Add detailed reports if requested
        include_detailed_reports = export_options.includeDetailedReports if hasattr(export_options, 'includeDetailedReports') else True
        if include_detailed_reports:
            elements.append(Paragraph("Detailed Reports", heading_style))
            elements.append(Spacer(1, 0.1 * inch))
            
            try:
                # Fetch detailed reports data using existing endpoint logic
                inputs = db.query(FarmInput).filter(FarmInput.crop_session_id == session_id).all()
                harvest = db.query(HarvestRecord).filter(HarvestRecord.session_id == session_id).first()
                stages = db.query(CropStage).filter(CropStage.session_id == session_id).order_by(CropStage.start_date).all()
                pest_alerts = db.query(PestAlert).filter(PestAlert.session_id == session_id).all()
                
                if harvest:
                    # Fertilizer Report
                    elements.append(Paragraph("Fertilizer Usage", subheading_style))
                    fertilizer_inputs = [item for item in inputs if item.input_type == "fertilizer"]
                    
                    if fertilizer_inputs:
                        fert_data = [["Name", "Date Applied", "Quantity", "Cost"]]
                        for item in fertilizer_inputs:
                            fert_data.append([
                                item.name,
                                item.application_date.strftime("%Y-%m-%d"),
                                f"{item.quantity} {item.unit}",
                                f"${item.cost:.2f}"
                            ])
                        
                        fert_table = Table(fert_data, colWidths=[1.5*inch, 1.2*inch, 1.2*inch, 1*inch])
                        fert_table.setStyle(TableStyle([
                            ('BACKGROUND', (0, 0), (-1, 0), colors.green),
                            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                            ('GRID', (0, 0), (-1, -1), 1, colors.black)
                        ]))
                        
                        elements.append(fert_table)
                    else:
                        elements.append(Paragraph("No fertilizer inputs recorded.", normal_style))
                    
                    elements.append(Spacer(1, 0.15 * inch))
                    
                    # Crop Health Report
                    elements.append(Paragraph("Crop Health", subheading_style))
                    health_index = 100
                    for alert in pest_alerts:
                        if alert.severity == "low":
                            health_index -= 5
                        elif alert.severity == "medium":
                            health_index -= 10
                        elif alert.severity == "high":
                            health_index -= 20
                    health_index = max(0, health_index)
                    
                    elements.append(Paragraph(f"Overall Health Index: {health_index}%", normal_style))
                    
                    if pest_alerts:
                        pest_data = [["Issue", "Detected", "Severity", "Action Taken"]]
                        for alert in pest_alerts:
                            pest_data.append([
                                alert.name,
                                alert.detection_date.strftime("%Y-%m-%d"),
                                alert.severity.upper(),
                                alert.recommended_action
                            ])
                        
                        pest_table = Table(pest_data, colWidths=[1.2*inch, 1*inch, 0.8*inch, 2*inch])
                        pest_table.setStyle(TableStyle([
                            ('BACKGROUND', (0, 0), (-1, 0), colors.red),
                            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                            ('GRID', (0, 0), (-1, -1), 1, colors.black)
                        ]))
                        
                        elements.append(pest_table)
                    else:
                        elements.append(Paragraph("No pest or disease issues recorded.", normal_style))
                else:
                    elements.append(Paragraph("No harvest record found. Detailed reports require harvest data.", normal_style))
            except Exception as e:
                elements.append(Paragraph(f"Error fetching detailed reports: {str(e)}", normal_style))
            
            elements.append(Spacer(1, 0.25 * inch))        # Include financial analysis if requested
        include_financials = export_options.includeFinancials if hasattr(export_options, 'includeFinancials') else True
        if include_financials:
            elements.append(Paragraph("Financial Analysis", heading_style))
            elements.append(Spacer(1, 0.1 * inch))
            
            try:
                # Fetch financial data
                inputs = db.query(FarmInput).filter(FarmInput.crop_session_id == session_id).all()
                harvest = db.query(HarvestRecord).filter(HarvestRecord.session_id == session_id).first()
                
                if harvest and inputs:
                    # Calculate cost breakdown
                    cost_breakdown = {}
                    for input_item in inputs:
                        if input_item.input_type not in cost_breakdown:
                            cost_breakdown[input_item.input_type] = 0
                        cost_breakdown[input_item.input_type] += input_item.cost
                    
                    # Calculate total cost and revenue
                    total_cost = sum(input_item.cost for input_item in inputs)
                    revenue = harvest.quantity * harvest.sale_price if harvest.sale_price else 0
                    
                    # Cost breakdown table
                    elements.append(Paragraph("Cost Breakdown", subheading_style))
                    
                    cost_data = [["Input Type", "Cost", "Percentage"]]
                    for input_type, cost in cost_breakdown.items():
                        percentage = (cost / total_cost * 100) if total_cost > 0 else 0
                        cost_data.append([
                            input_type.capitalize(),
                            f"${cost:.2f}",
                            f"{percentage:.2f}%"
                        ])
                    
                    # Add total row
                    cost_data.append(["TOTAL", f"${total_cost:.2f}", "100%"])
                    
                    cost_table = Table(cost_data, colWidths=[2*inch, 1.5*inch, 1.5*inch])
                    cost_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                        ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
                        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                        ('GRID', (0, 0), (-1, -1), 1, colors.black)
                    ]))
                    
                    elements.append(cost_table)
                    elements.append(Spacer(1, 0.15 * inch))
                    
                    # Profitability analysis
                    elements.append(Paragraph("Profitability Analysis", subheading_style))
                    
                    profit = revenue - total_cost
                    profit_margin = (profit / revenue * 100) if revenue > 0 else 0
                    roi = (profit / total_cost * 100) if total_cost > 0 else 0
                    
                    profit_data = [
                        ["Metric", "Value"],
                        ["Total Revenue:", f"${revenue:.2f}"],
                        ["Total Cost:", f"${total_cost:.2f}"],
                        ["Profit/Loss:", f"${profit:.2f}"],
                        ["Profit Margin:", f"{profit_margin:.2f}%"],
                        ["Return on Investment:", f"{roi:.2f}%"]
                    ]
                    
                    profit_table = Table(profit_data, colWidths=[2.5*inch, 2.5*inch])
                    profit_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                        ('GRID', (0, 0), (-1, -1), 1, colors.black)
                    ]))
                    
                    elements.append(profit_table)
                else:
                    elements.append(Paragraph("No financial data available. Both harvest and input records are required.", normal_style))
            except Exception as e:
                elements.append(Paragraph(f"Error fetching financial data: {str(e)}", normal_style))
            
            elements.append(Spacer(1, 0.25 * inch))        # Include timeline data if requested
        include_timeline = export_options.includeTimeline if hasattr(export_options, 'includeTimeline') else True
        if include_timeline:
            elements.append(Paragraph("Crop Lifecycle Timeline", heading_style))
            elements.append(Spacer(1, 0.1 * inch))
            
            try:
                # Fetch timeline data
                stages = db.query(CropStage).filter(CropStage.session_id == session_id).order_by(CropStage.start_date).all()
                
                if stages:
                    stage_data = [["Stage", "Start Date", "End Date", "Duration (Days)"]]
                    for stage in stages:
                        duration = (stage.end_date - stage.start_date).days
                        stage_data.append([
                            stage.name,
                            stage.start_date.strftime("%Y-%m-%d"),
                            stage.end_date.strftime("%Y-%m-%d"),
                            str(duration)
                        ])
                    
                    stage_table = Table(stage_data, colWidths=[1.5*inch, 1.2*inch, 1.2*inch, 1*inch])
                    stage_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                        ('GRID', (0, 0), (-1, -1), 1, colors.black)
                    ]))
                    
                    elements.append(stage_table)
                else:
                    elements.append(Paragraph("No lifecycle stages recorded for this crop session.", normal_style))
            except Exception as e:
                elements.append(Paragraph(f"Error fetching timeline data: {str(e)}", normal_style))
            
            elements.append(Spacer(1, 0.25 * inch))        # Include AI insights if requested
        include_insights = export_options.includeInsights if hasattr(export_options, 'includeInsights') else True
        if include_insights:
            elements.append(Paragraph("AI Insights & Recommendations", heading_style))
            elements.append(Spacer(1, 0.1 * inch))
            
            try:
                # Generate insights (similar to the insights endpoint)
                inputs = db.query(FarmInput).filter(FarmInput.crop_session_id == session_id).all()
                harvest = db.query(HarvestRecord).filter(HarvestRecord.session_id == session_id).first()
                pest_alerts = db.query(PestAlert).filter(PestAlert.session_id == session_id).all()
                
                insights = []
                
                # Input usage insights
                fertilizer_inputs = [item for item in inputs if item.input_type == "fertilizer"]
                if len(fertilizer_inputs) > 3:
                    insights.append({
                        "message": "Consider reducing fertilizer applications",
                        "reason": "Multiple fertilizer applications may lead to excessive growth and reduced yield",
                        "type": "efficiency"
                    })
                elif len(fertilizer_inputs) == 0:
                    insights.append({
                        "message": "Consider adding fertilizer applications",
                        "reason": "No fertilizer applications were recorded",
                        "type": "improvement"
                    })
                
                # Pest management insights
                if pest_alerts:
                    high_severity_alerts = [alert for alert in pest_alerts if alert.severity == "high"]
                    if high_severity_alerts:
                        insights.append({
                            "message": "Implement preventative pest management next season",
                            "reason": f"{len(high_severity_alerts)} high-severity pest issues were detected",
                            "type": "warning"
                        })
                
                # Profitability insights
                if harvest and inputs:
                    total_cost = sum(item.cost for item in inputs)
                    revenue = harvest.quantity * harvest.sale_price if harvest.sale_price else 0
                    profit = revenue - total_cost
                    
                    if profit < 0:
                        insights.append({
                            "message": "This crop was not profitable",
                            "reason": f"Your expenses (${total_cost}) exceeded your revenue (${revenue})",
                            "type": "warning"
                        })
                    elif (profit / total_cost) > 0.5:
                        insights.append({
                            "message": "This crop was highly profitable",
                            "reason": f"Your profit margin was over 50%, consider increasing your acreage next season",
                            "type": "success"
                        })
                
                # If no insights were generated, provide a generic one
                if not insights:
                    insights.append({
                        "message": "Keep detailed records to get more personalized insights",
                        "reason": "Not enough data available to generate specific recommendations",
                        "type": "info"
                    })
                
                # Display insights
                for i, insight in enumerate(insights):
                    message_style = ParagraphStyle(
                        'InsightMessage', 
                        parent=normal_style, 
                        fontName='Helvetica-Bold',
                        textColor=colors.darkblue if insight['type'] != 'warning' else colors.darkred
                    )
                    elements.append(Paragraph(f"{i+1}. {insight['message']}", message_style))
                    elements.append(Paragraph(f"   Reason: {insight['reason']}", normal_style))
                    elements.append(Spacer(1, 0.1 * inch))
            except Exception as e:
                elements.append(Paragraph(f"Error generating insights: {str(e)}", normal_style))
            
            elements.append(Spacer(1, 0.25 * inch))        # Add recommendations if requested
        include_recommendations = export_options.includeRecommendations if hasattr(export_options, 'includeRecommendations') else True
        if include_recommendations:
            elements.append(Paragraph("Action Items & Future Recommendations", heading_style))
            elements.append(Spacer(1, 0.1 * inch))
            
            try:
                # Fetch data for recommendations
                inputs = db.query(FarmInput).filter(FarmInput.crop_session_id == session_id).all()
                harvest = db.query(HarvestRecord).filter(HarvestRecord.session_id == session_id).first()
                pest_alerts = db.query(PestAlert).filter(PestAlert.session_id == session_id).all()
                
                # Generate recommendations based on data analysis
                recommendations = []
                
                if harvest and inputs:
                    total_cost = sum(item.cost for item in inputs)
                    revenue = harvest.quantity * harvest.sale_price if harvest.sale_price else 0
                    profit = revenue - total_cost
                    
                    # Cost optimization recommendations
                    highest_cost_type = max(
                        [(input_type, sum(item.cost for item in inputs if item.input_type == input_type)) 
                         for input_type in set(item.input_type for item in inputs)],
                        key=lambda x: x[1]
                    )
                    
                    recommendations.append(
                        f"Focus on optimizing {highest_cost_type[0]} costs, which accounted for "
                        f"${highest_cost_type[1]:.2f} of your total expenses."
                    )
                    
                    # Yield improvement recommendations
                    if session.land_area:
                        yield_per_area = harvest.quantity / session.land_area
                        recommendations.append(
                            f"Your yield per hectare was {yield_per_area:.2f} {harvest.unit}. "
                            f"Consider techniques to improve yield for next season."
                        )
                    
                    # Profitability recommendations
                    if profit < 0:
                        recommendations.append(
                            "Consider alternative crops or improved management practices to achieve profitability."
                        )
                    elif profit > 0:
                        recommendations.append(
                            f"Your profit was ${profit:.2f}. Consider reinvesting in improved equipment or technology."
                        )
                
                # Pest management recommendations
                if pest_alerts:
                    pest_types = set(alert.name for alert in pest_alerts)
                    recommendations.append(
                        f"Implement preventative measures for common issues: {', '.join(pest_types)}."
                    )
                
                # If no recommendations, add defaults
                if not recommendations:
                    recommendations = [
                        "Maintain detailed records of all farm inputs and activities.",
                        "Consider soil testing before the next planting season.",
                        "Evaluate your irrigation efficiency and consider improvements.",
                        "Research latest farming techniques for your specific crop."
                    ]
                
                # Add recommendations to PDF
                for i, recommendation in enumerate(recommendations):
                    elements.append(Paragraph(f"{i+1}. {recommendation}", normal_style))
                    elements.append(Spacer(1, 0.1 * inch))
                
            except Exception as e:
                elements.append(Paragraph(f"Error generating recommendations: {str(e)}", normal_style))
        
        # Add footer with generation date
        elements.append(Spacer(1, 0.5 * inch))
        
        footer_text = f"Report generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | AgriAI Crop Management System"
        footer_style = ParagraphStyle(
            'Footer', 
            parent=normal_style, 
            fontSize=8, 
            textColor=colors.gray
        )
        elements.append(Paragraph(footer_text, footer_style))
        
        # Build the PDF
        doc.build(elements)
        
        # Get the PDF content from the buffer
        pdf_content = buffer.getvalue()
        buffer.close()
          # Create timestamp for filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"crop-analytics-{session.crop_name.lower().replace(' ', '-')}-{timestamp}.pdf"
        
        # Return the PDF as a downloadable file
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except HTTPException:
        raise
    except ValidationError as e:
        # Handle Pydantic validation errors specifically
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Validation error in PDF export request: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF report: {str(e)}"
        )

# Additional endpoint to get saved analytics
@router.get("/analytics/{session_id}/saved")
async def get_saved_analytics(
    session_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve saved analytics data for a crop session"""
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
        
        # Get analytics data
        analytics = db.query(Analytics).filter(
            Analytics.session_id == session_id
        ).first()
        
        if not analytics:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No saved analytics data found for this session"
            )
        
        # Parse JSON strings
        cost_breakdown = json.loads(analytics.cost_breakdown) if analytics.cost_breakdown else {}
        
        return {
            "id": analytics.id,
            "session_id": analytics.session_id,
            "yield_amount": analytics.yield_amount,
            "yield_unit": analytics.yield_unit,
            "yield_per_area": analytics.yield_per_area,
            "total_cost": analytics.total_cost,
            "revenue": analytics.revenue,
            "profit": analytics.profit,
            "roi": analytics.roi,
            "cost_breakdown": cost_breakdown,
            "created_at": analytics.created_at,
            "updated_at": analytics.updated_at
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve saved analytics data: {str(e)}"
        )
