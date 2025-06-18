from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime

# Crop Session Schemas
class CropSessionCreate(BaseModel):
    crop_name: str
    sowing_date: datetime  # Match database schema
    land_area: float  # Match database schema
    expected_harvest_date: Optional[datetime] = None
    status: Optional[str] = "active"

class CropSessionResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    crop_name: str
    land_area: float
    sowing_date: datetime
    expected_harvest_date: Optional[datetime] = None
    actual_harvest_date: Optional[datetime] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# Crop Stage Schemas
class CropStageCreate(BaseModel):
    id: Optional[int] = None
    name: str
    start_date: date
    end_date: date
    description: Optional[str] = None

class CropStageResponse(BaseModel):
    id: int
    session_id: int
    name: str
    start_date: date
    end_date: date
    description: Optional[str] = None
    created_at: datetime

# Reminder Schemas
class ReminderCreate(BaseModel):
    id: Optional[int] = None
    title: str
    due_date: date
    type: str  # fertilizer, irrigation, pest, harvest, preparation, maintenance
    description: Optional[str] = None
    status: Optional[str] = "pending"

class ReminderResponse(BaseModel):
    id: int
    session_id: int
    title: str
    due_date: date
    type: str
    description: Optional[str] = None
    status: str

# Pest Alert Schemas
class PestAlertCreate(BaseModel):
    id: Optional[int] = None
    name: str
    detection_date: datetime
    severity: str  # low, medium, high
    description: Optional[str] = None
    recommended_action: Optional[str] = None

class PestAlertResponse(BaseModel):
    id: int
    session_id: int
    name: str
    detection_date: datetime
    severity: str
    description: Optional[str] = None
    recommended_action: Optional[str] = None
    created_at: datetime

# Farm Input Schemas
class FarmInputCreate(BaseModel):
    id: Optional[int] = None
    type: str  # fertilizer, irrigation, pesticide, labor, seed, other
    name: str
    quantity: float
    unit: str  # kg, liter, hour, etc.
    application_date: date
    cost: float = 0.0
    notes: Optional[str] = None

class FarmInputResponse(BaseModel):
    id: int
    session_id: int
    input_type: str
    name: str
    quantity: float
    unit: str
    application_date: date
    cost: float
    notes: Optional[str] = None
    created_at: datetime

# Harvest Record Schemas
class HarvestRecordCreate(BaseModel):
    id: Optional[int] = None
    harvest_date: date
    quantity: float
    unit: str  # kg, ton, bushel, etc.
    quality_grade: Optional[str] = None
    sale_price: Optional[float] = None
    notes: Optional[str] = None

class HarvestRecordResponse(BaseModel):
    id: int
    session_id: int
    harvest_date: date
    quantity: float
    unit: str
    quality_grade: Optional[str] = None
    sale_price: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime

# Report Schemas
class ReportCreate(BaseModel):
    id: Optional[int] = None
    report_type: str  # season_summary, fertilizer, productivity, comparison
    report_date: datetime
    report_data: str  # JSON string

class ReportResponse(BaseModel):
    id: int
    session_id: int
    report_type: str
    report_date: datetime
    report_data: str
    created_at: datetime

# Analytics Schemas
class AnalyticsCreate(BaseModel):
    session_id: int
    yield_amount: float
    yield_unit: str
    yield_per_area: float
    area_unit: str
    total_cost: float
    revenue: float
    profit: float
    roi: float
    cost_breakdown: Dict[str, float]
    cost_percentage: Dict[str, float]
    
class AnalyticsResponse(BaseModel):
    id: int
    session_id: int
    yield_amount: float
    yield_unit: str
    yield_per_area: float
    area_unit: str
    total_cost: float
    revenue: float
    profit: float
    roi: float
    cost_breakdown: Dict[str, float]
    cost_percentage: Dict[str, float]
    created_at: datetime
    updated_at: Optional[datetime] = None

# PDF Export Schemas
class PDFExportOptions(BaseModel):
    includeOverview: bool = True
    includeDetailedReports: bool = True
    includeCharts: bool = True
    includeInsights: bool = True
    includeFinancials: bool = True
    includeTimeline: bool = True
    includeRecommendations: bool = True

class PDFExportRequest(BaseModel):
    session_id: int
    export_options: Optional[PDFExportOptions] = None
