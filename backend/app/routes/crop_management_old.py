from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
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
from app.models.crop_management import CropStage

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
    try:        # Create new crop session
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
            crop_name=new_session.crop_name,
            sowing_date=new_session.sowing_date,
            land_size=new_session.land_size,
            land_size_unit=new_session.land_size_unit,
            location=new_session.location,
            soil_type=new_session.soil_type,
            created_at=new_session.created_at,
            status=new_session.status,
            additional_notes=new_session.additional_notes
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
        # This is a simplified example, in a real app this would use a crop calendar database
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
        elif session.crop_name.lower() in ["corn", "maize"]:
            stages = [
                {"name": "Sowing", "start_date": sowing_date, "end_date": sowing_date + timedelta(days=7), "description": "Germination and emergence"},
                {"name": "Vegetative", "start_date": sowing_date + timedelta(days=8), "end_date": sowing_date + timedelta(days=50), "description": "Leaf development and stem elongation"},
                {"name": "Flowering", "start_date": sowing_date + timedelta(days=51), "end_date": sowing_date + timedelta(days=70), "description": "Tasseling and silking"},
                {"name": "Harvest", "start_date": sowing_date + timedelta(days=71), "end_date": sowing_date + timedelta(days=100), "description": "Kernel development and maturation"}
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
        saved_reminders = []
        for reminder in reminders:
            new_reminder = Reminder(
                session_id=session.id,
                title=reminder["title"],
                due_date=reminder["due_date"],
                type=reminder["type"],
                description=reminder["description"],
                status="pending"
            )
            db.add(new_reminder)
            db.commit()
            db.refresh(new_reminder)
            
            saved_reminders.append(ReminderCreate(
                id=new_reminder.id,
                title=new_reminder.title,
                due_date=new_reminder.due_date,
                type=new_reminder.type,
                description=new_reminder.description,
                status=new_reminder.status
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
        # In a real application, this would use a weather API and pest database
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
            },
            "corn": {
                "Vegetative": [
                    {"name": "Corn borer", "severity": "high", "description": "Larvae bore into stalks and ears", "treatment": "Apply Bacillus thuringiensis (Bt) based products"},
                    {"name": "Leaf spot", "severity": "medium", "description": "Fungal disease causing circular spots", "treatment": "Rotate crops and apply fungicides"}
                ],
                "Flowering": [
                    {"name": "Corn smut", "severity": "medium", "description": "Fungal disease causing galls on ears", "treatment": "Remove and destroy infected plants"}
                ]
            }
        }
        
        # Default for other crops
        default_pests = {
            "Vegetative": [
                {"name": "Aphids", "severity": "medium", "description": "Small insects that suck plant sap", "treatment": "Introduce beneficial insects or apply insecticidal soap"},
                {"name": "Leaf spot", "severity": "medium", "description": "Fungal disease causing circular spots", "treatment": "Apply fungicides and ensure proper spacing"}
            ],
            "Flowering": [
                {"name": "Powdery mildew", "severity": "medium", "description": "White powdery coating on leaves", "treatment": "Apply sulfur-based fungicides"},
                {"name": "Fruit rot", "severity": "high", "description": "Fungal infection affecting fruits", "treatment": "Improve air circulation and apply approved fungicides"}
            ]
        }
        
        if current_stage:
            crop = session.crop_name.lower()
            stage = current_stage.name
            
            # Get pest data for this crop and stage
            crop_pests = pest_data.get(crop, default_pests)
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
        
        # In a real application, you would adjust this based on weather API data
        # Here we're using a simple confidence score based on crop type
        confidence_scores = {
            "rice": 0.85,
            "wheat": 0.9,
            "corn": 0.8,
            "maize": 0.8
        }
        
        crop = session.crop_name.lower()
        confidence = confidence_scores.get(crop, 0.75)  # Default for other crops
        
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
            notes=input_data.notes
        )
        
        db.add(new_input)
        db.commit()
        db.refresh(new_input)
        
        return FarmInputCreate(
            id=new_input.id,
            type=new_input.type,
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
            FarmInput.session_id == session_id
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
            if input_item.type not in input_summary:
                input_summary[input_item.type] = {
                    "count": 0,
                    "total_cost": 0,
                    "items": []
                }
            
            input_summary[input_item.type]["count"] += 1
            input_summary[input_item.type]["total_cost"] += input_item.cost
            input_summary[input_item.type]["items"].append({
                "name": input_item.name,
                "quantity": input_item.quantity,
                "unit": input_item.unit,
                "application_date": input_item.application_date.isoformat(),
                "cost": input_item.cost
            })
        
        # Generate productivity metrics
        productivity = {
            "yield_per_area": harvest.quantity / session.land_size if session.land_size else 0,
            "cost_per_unit": total_cost / harvest.quantity if harvest.quantity else 0,
            "revenue_per_unit": harvest.sale_price if harvest.sale_price else 0,
            "profit_per_area": profit_loss / session.land_size if session.land_size else 0
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
            session_id=session.id,
            report_type="season_summary",
            report_date=datetime.now(),
            report_data=json.dumps(report_data)
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
            FarmInput.session_id == session_id
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
        
        # Calculate ROI
        roi = ((revenue - total_cost) / total_cost * 100) if total_cost > 0 else 0
        
        # Calculate yield metrics
        yield_per_area = harvest.quantity / session.land_size if session.land_size else 0
        
        # Calculate cost breakdown
        cost_breakdown = {}
        for input_item in inputs:
            if input_item.type not in cost_breakdown:
                cost_breakdown[input_item.type] = 0
            cost_breakdown[input_item.type] += input_item.cost
        
        # Convert to percentage
        cost_percentage = {}
        for input_type, cost in cost_breakdown.items():
            cost_percentage[input_type] = (cost / total_cost * 100) if total_cost > 0 else 0
        
        return {
            "yield": harvest.quantity,
            "yield_unit": harvest.unit,
            "yield_per_area": yield_per_area,
            "area_unit": session.land_size_unit,
            "total_cost": total_cost,
            "revenue": revenue,
            "profit": revenue - total_cost,        "roi": roi,
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

# 11. DB Insertion for Analytics Data
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
            FarmInput.session_id == session_id
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
        
        # Calculate ROI
        roi = ((revenue - total_cost) / total_cost * 100) if total_cost > 0 else 0
        
        # Calculate yield metrics
        yield_per_area = harvest.quantity / session.land_size if session.land_size else 0
        
        # Calculate cost breakdown
        cost_breakdown = {}
        for input_item in inputs:
            if input_item.type not in cost_breakdown:
                cost_breakdown[input_item.type] = 0
            cost_breakdown[input_item.type] += input_item.cost
        
        # Convert to percentage
        cost_percentage = {}
        for input_type, cost in cost_breakdown.items():
            cost_percentage[input_type] = (cost / total_cost * 100) if total_cost > 0 else 0
            
        # Check if analytics already exists for this session
        existing_analytics = db.query(Analytics).filter(
            Analytics.session_id == session_id
        ).first()
        
        if existing_analytics:
            # Update existing analytics
            existing_analytics.yield_amount = harvest.quantity
            existing_analytics.yield_unit = harvest.unit
            existing_analytics.yield_per_area = yield_per_area
            existing_analytics.area_unit = session.land_size_unit
            existing_analytics.total_cost = total_cost
            existing_analytics.revenue = revenue
            existing_analytics.profit = revenue - total_cost
            existing_analytics.roi = roi
            existing_analytics.cost_breakdown = json.dumps(cost_breakdown)
            existing_analytics.cost_percentage = json.dumps(cost_percentage)
            existing_analytics.updated_at = datetime.now()
            
            db.commit()
            db.refresh(existing_analytics)
            
            return {
                "message": "Analytics data updated successfully",
                "id": existing_analytics.id
            }
        else:
            # Create new analytics entry
            new_analytics = Analytics(
                session_id=session_id,
                yield_amount=harvest.quantity,
                yield_unit=harvest.unit,
                yield_per_area=yield_per_area,
                area_unit=session.land_size_unit,
                total_cost=total_cost,
                revenue=revenue,
                profit=revenue - total_cost,
                roi=roi,
                cost_breakdown=json.dumps(cost_breakdown),
                cost_percentage=json.dumps(cost_percentage)
            )
            
            db.add(new_analytics)
            db.commit()
            db.refresh(new_analytics)
            
            return {
                "message": "Analytics data saved successfully",            "id": new_analytics.id
            }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save farm analytics: {str(e)}"
        )

# GET Saved Analytics Data
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
        cost_breakdown = json.loads(analytics.cost_breakdown)
        cost_percentage = json.loads(analytics.cost_percentage)
        
        return {
            "id": analytics.id,
            "session_id": analytics.session_id,
            "yield_amount": analytics.yield_amount,
            "yield_unit": analytics.yield_unit,
            "yield_per_area": analytics.yield_per_area,
            "area_unit": analytics.area_unit,
            "total_cost": analytics.total_cost,
            "revenue": analytics.revenue,
            "profit": analytics.profit,
            "roi": analytics.roi,
            "cost_breakdown": cost_breakdown,
            "cost_percentage": cost_percentage,
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
        
        # Get all farm inputs
        inputs = db.query(FarmInput).filter(
            FarmInput.session_id == session_id
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
        
        # Get crop stages
        stages = db.query(CropStage).filter(
            CropStage.session_id == session_id
        ).order_by(CropStage.start_date).all()
        
        # Get pest alerts
        pest_alerts = db.query(PestAlert).filter(
            PestAlert.session_id == session_id
        ).all()
        
        # Fertilizer Report
        fertilizer_inputs = [input_item for input_item in inputs if input_item.type == "fertilizer"]
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
        health_index = 100  # Start with perfect health
        for alert in pest_alerts:
            # Reduce health index based on severity
            if alert.severity == "low":
                health_index -= 5
            elif alert.severity == "medium":
                health_index -= 10
            elif alert.severity == "high":
                health_index -= 20
        
        health_index = max(0, health_index)  # Ensure it doesn't go below 0
        
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
        total_cost = sum(input_item.cost for input_item in inputs)
        revenue = harvest.quantity * harvest.sale_price if harvest.sale_price else 0
        profit = revenue - total_cost
        
        productivity_report = {
            "yield": harvest.quantity,
            "yield_unit": harvest.unit,
            "yield_per_area": harvest.quantity / session.land_size if session.land_size else 0,
            "cost_per_unit": total_cost / harvest.quantity if harvest.quantity else 0,
            "revenue_per_unit": harvest.sale_price if harvest.sale_price else 0,
            "profit_per_area": profit / session.land_size if session.land_size else 0,
            "labor_efficiency": "Not available"  # Would require labor tracking
        }
        
        return {
            "fertilizer_report": fertilizer_report,
            "health_report": health_report,
            "productivity_report": productivity_report,
            "stages": [
                {
                    "name": stage.name,
                    "start_date": stage.start_date.isoformat(),
                    "end_date": stage.end_date.isoformat(),
                    "duration": (stage.end_date - stage.start_date).days,
                    "description": stage.description
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

# 18. Graphs: Output vs Cost, Comparison Trends
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
            FarmInput.session_id == session_id
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
            if input_item.type not in cost_by_type:
                cost_by_type[input_item.type] = 0
            cost_by_type[input_item.type] += input_item.cost
        
        # Prepare cost breakdown by month
        cost_by_month = {}
        for input_item in inputs:
            month = input_item.application_date.strftime("%Y-%m")
            if month not in cost_by_month:
                cost_by_month[month] = 0
            cost_by_month[month] += input_item.cost
        
        # Prepare cost vs revenue data
        total_cost = sum(input_item.cost for input_item in inputs)
        revenue = harvest.quantity * harvest.sale_price if harvest.sale_price else 0
        
        cost_vs_revenue = {
            "labels": ["Cost", "Revenue"],
            "data": [total_cost, revenue]
        }
        
        # Get previous sessions for the same crop for comparison
        previous_sessions = db.query(CropSession).filter(
            CropSession.user_id == current_user.id,
            CropSession.crop_name == session.crop_name,
            CropSession.id != session.id,
            CropSession.status == "completed"
        ).all()
        
        comparison_data = {
            "labels": [session.sowing_date.strftime("%b %Y")],
            "yield": [harvest.quantity],
            "cost": [total_cost],
            "revenue": [revenue]
        }
        
        # Add data from previous sessions
        for prev_session in previous_sessions:
            prev_harvest = db.query(HarvestRecord).filter(
                HarvestRecord.session_id == prev_session.id
            ).first()
            
            if prev_harvest:
                prev_inputs = db.query(FarmInput).filter(
                    FarmInput.session_id == prev_session.id
                ).all()
                
                prev_cost = sum(item.cost for item in prev_inputs)
                prev_revenue = prev_harvest.quantity * prev_harvest.sale_price if prev_harvest.sale_price else 0
                
                comparison_data["labels"].append(prev_session.sowing_date.strftime("%b %Y"))
                comparison_data["yield"].append(prev_harvest.quantity)
                comparison_data["cost"].append(prev_cost)
                comparison_data["revenue"].append(prev_revenue)
        
        return {
            "cost_by_type": {
                "labels": list(cost_by_type.keys()),
                "data": list(cost_by_type.values())
            },
            "cost_by_month": {
                "labels": list(cost_by_month.keys()),
                "data": list(cost_by_month.values())
            },
            "cost_vs_revenue": cost_vs_revenue,
            "comparison_data": comparison_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get graph data: {str(e)}"
        )

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
        
        # Get all farm inputs
        inputs = db.query(FarmInput).filter(
            FarmInput.session_id == session_id
        ).all()
        
        # Get harvest record
        harvest = db.query(HarvestRecord).filter(
            HarvestRecord.session_id == session_id
        ).first()
        
        # Get pest alerts
        pest_alerts = db.query(PestAlert).filter(
            PestAlert.session_id == session_id
        ).all()
        
        # Generate insights based on available data
        insights = []
        
        # Input usage insights
        fertilizer_inputs = [item for item in inputs if item.type == "fertilizer"]
        if fertilizer_inputs:
            # Check if fertilizer was applied during vegetative stage
            stages = db.query(CropStage).filter(
                CropStage.session_id == session_id,
                CropStage.name == "Vegetative"
            ).first()
            
            if stages:
                veg_stage_start = stages.start_date
                veg_stage_end = stages.end_date
                
                veg_stage_fertilizers = [
                    item for item in fertilizer_inputs 
                    if veg_stage_start <= item.application_date <= veg_stage_end
                ]
                
                if not veg_stage_fertilizers:
                    insights.append({
                        "message": "Consider applying fertilizer during the vegetative stage next time",
                        "reason": "No fertilizer applications were recorded during the vegetative growth stage",
                        "recommendation_type": "improvement"
                    })
                elif len(veg_stage_fertilizers) > 2:
                    insights.append({
                        "message": "Consider reducing fertilizer applications during vegetative stage",
                        "reason": "Multiple fertilizer applications during vegetative stage may lead to excessive growth and reduced yield",
                        "recommendation_type": "efficiency"
                    })
        
        # Pest management insights
        if pest_alerts:
            high_severity_alerts = [alert for alert in pest_alerts if alert.severity == "high"]
            if high_severity_alerts:
                insights.append({
                    "message": "Implement preventative pest management next season",
                    "reason": f"{len(high_severity_alerts)} high-severity pest issues were detected this season",
                    "recommendation_type": "warning"
                })
        
        # Yield insights
        if harvest:
            # Compare yield with average for this crop
            # In a real application, this would use a database of average yields
            avg_yields = {
                "rice": 4.5,  # tons per hectare
                "wheat": 3.0,
                "corn": 5.5,
                "maize": 5.5
            }
            
            crop = session.crop_name.lower()
            avg_yield = avg_yields.get(crop, 4.0)  # Default for other crops
            
            # Convert land size to hectares for comparison
            hectare_conversion = {
                "hectare": 1,
                "acre": 0.404686,
                "square_meter": 0.0001
            }
            
            land_size_hectares = session.land_size * hectare_conversion.get(session.land_size_unit, 1)
            expected_yield = avg_yield * land_size_hectares
            
            # Compare actual yield with expected
            if harvest.unit.lower() in ["ton", "tons", "t"]:
                actual_yield = harvest.quantity
            elif harvest.unit.lower() in ["kg", "kilograms"]:
                actual_yield = harvest.quantity / 1000
            else:
                actual_yield = harvest.quantity  # Assume tons if unknown
            
            yield_difference = ((actual_yield - expected_yield) / expected_yield) * 100
            
            if yield_difference < -10:
                insights.append({
                    "message": "Your yield was below average for this crop",
                    "reason": f"Your yield was approximately {abs(round(yield_difference))}% below the average for {session.crop_name}",
                    "recommendation_type": "warning"
                })
            elif yield_difference > 10:
                insights.append({
                    "message": "Excellent yield results!",
                    "reason": f"Your yield was approximately {round(yield_difference)}% above the average for {session.crop_name}",
                    "recommendation_type": "success"
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
                    "recommendation_type": "warning"
                })
            elif (profit / total_cost) < 0.1:
                insights.append({
                    "message": "Consider alternative crops or methods to improve profitability",
                    "reason": "Your profit margin was less than 10%",
                    "recommendation_type": "improvement"
                })
            elif (profit / total_cost) > 0.5:
                insights.append({
                    "message": "This crop was highly profitable",
                    "reason": f"Your profit margin was over 50%, consider increasing your acreage of {session.crop_name} next season",
                    "recommendation_type": "success"
                })
        
        # If no insights were generated, provide a generic one
        if not insights:
            insights.append({
                "message": "Keep detailed records to get more personalized insights",
                "reason": "Not enough data available to generate specific recommendations",
                "recommendation_type": "info"
            })
        
        return {
            "insights": insights,
            "crop_name": session.crop_name,
            "season_dates": f"{session.sowing_date.isoformat()} to {harvest.harvest_date.isoformat() if harvest else 'ongoing'}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get personalized insights: {str(e)}"
        )

# 20. PDF Export (Analytics)
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
        
        # In a real application, this would generate a PDF and store it
        # For this example, we'll return a mock URL
        
        # Generate a filename
        filename = f"{session.crop_name.lower().replace(' ', '_')}_{session.sowing_date.strftime('%Y%m%d')}_report.pdf"
        
        # In a real application, you would generate the PDF here and store it
        # Then return the URL to download it
        
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

# Get all crop sessions for a user
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
        
        return [
            CropSessionResponse(
                id=session.id,
                crop_name=session.crop_name,
                sowing_date=session.sowing_date,
                land_size=session.land_size,
                land_size_unit=session.land_size_unit,
                location=session.location,
                soil_type=session.soil_type,
                created_at=session.created_at,
                status=session.status,
                additional_notes=session.additional_notes
            ) for session in sessions
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get crop sessions: {str(e)}"
        )

# Get a specific crop session
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
            crop_name=session.crop_name,
            sowing_date=session.sowing_date,
            land_size=session.land_size,
            land_size_unit=session.land_size_unit,
            location=session.location,
            soil_type=session.soil_type,
            created_at=session.created_at,
            status=session.status,
            additional_notes=session.additional_notes
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get crop session: {str(e)}"
        )

# Get all farm inputs for a session
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
            FarmInput.session_id == session_id
        ).order_by(FarmInput.application_date).all()
        
        return [
            FarmInputCreate(
                id=input_item.id,
                type=input_item.type,
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
                "land_size": session.land_size,
                "land_size_unit": session.land_size_unit,
                "yield": harvest.quantity,
                "yield_unit": harvest.unit,
                "yield_per_area": harvest.quantity / session.land_size if session.land_size else 0,
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
