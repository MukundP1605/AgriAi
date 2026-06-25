from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class OrganicPreference(str, Enum):
    ORGANIC = "organic"
    CHEMICAL = "chemical"
    MIXED = "mixed"

class CropType(str, Enum):
    RICE = "rice"
    WHEAT = "wheat"
    CORN = "corn"
    TOMATO = "tomato"
    POTATO = "potato"
    COTTON = "cotton"
    SUGARCANE = "sugarcane"
    SOYBEAN = "soybean"
    OTHER = "other"

class SoilTestRequest(BaseModel):
    """Input schema for soil test data"""
    # Basic NPK values
    nitrogen: float = Field(..., ge=0, le=300, description="Nitrogen content in mg/kg")
    phosphorus: float = Field(..., ge=0, le=300, description="Phosphorus content in mg/kg")
    potassium: float = Field(..., ge=0, le=300, description="Potassium content in mg/kg")
    
    # Soil properties
    ph: float = Field(..., ge=3.0, le=10.0, description="Soil pH level")
    moisture: float = Field(..., ge=0, le=100, description="Soil moisture percentage")
    organic_matter: Optional[float] = Field(None, ge=0, le=50, description="Organic matter percentage")
    
    # Location and crop info
    location: str = Field(..., min_length=1, description="Farm location")
    crop_type: CropType = Field(..., description="Type of crop to be grown")
    area_size: Optional[float] = Field(None, ge=0, description="Area size in hectares")
    
    # Preferences
    organic_preference: OrganicPreference = Field(default=OrganicPreference.MIXED, description="Fertilizer preference")
    
    # Optional additional data
    soil_texture: Optional[str] = Field(None, description="Soil texture (sandy, clay, loam, etc.)")
    previous_crop: Optional[str] = Field(None, description="Previous crop grown")

class NPKAnalysis(BaseModel):
    """NPK analysis and recommendation"""
    current_npk: Dict[str, float] = Field(..., description="Current N, P, K levels")
    recommended_npk: Dict[str, float] = Field(..., description="Recommended N, P, K levels")
    deficiency_analysis: Dict[str, str] = Field(..., description="Analysis of nutrient deficiencies")
    optimal_range: Dict[str, Dict[str, float]] = Field(..., description="Optimal NPK ranges for the crop")
    confidence_score: float = Field(..., ge=0, le=100, description="Confidence score of the recommendation")

class ApplicationPhase(BaseModel):
    """Single application phase in fertilizer schedule"""
    phase: str = Field(..., description="Phase name (e.g., 'Pre-planting', 'Vegetative', 'Flowering')")
    timing: str = Field(..., description="When to apply (e.g., '2 weeks before planting')")
    npk_ratio: str = Field(..., description="NPK ratio for this phase (e.g., '10-10-10')")
    quantity_per_hectare: float = Field(..., ge=0, description="Quantity in kg per hectare")
    application_method: str = Field(..., description="How to apply (broadcast, side-dress, etc.)")
    notes: Optional[str] = Field(None, description="Additional notes for this phase")

class ApplicationSchedule(BaseModel):
    """Complete fertilizer application schedule"""
    total_phases: int = Field(..., ge=1, description="Total number of application phases")
    phases: List[ApplicationPhase] = Field(..., description="List of application phases")
    total_cost_estimate: Optional[float] = Field(None, description="Estimated total cost")

class MarketplaceMatch(BaseModel):
    """Marketplace product match for NPK requirements"""
    product_id: int = Field(..., description="Product ID from marketplace")
    product_name: str = Field(..., description="Product name")
    npk_ratio: str = Field(..., description="NPK ratio of the product")
    price: float = Field(..., description="Product price")
    quantity_needed: float = Field(..., description="Quantity needed for the area")
    total_cost: float = Field(..., description="Total cost for required quantity")
    match_score: float = Field(..., ge=0, le=100, description="How well it matches requirements")
    category: str = Field(..., description="Product category")
    organic_certified: bool = Field(default=False, description="Whether the product is organic")

class FertilizerRecommendationResponse(BaseModel):
    """Complete fertilizer recommendation response"""
    npk_analysis: NPKAnalysis = Field(..., description="NPK analysis and recommendations")
    application_schedule: List[ApplicationPhase] = Field(..., description="Application schedule")
    marketplace_matches: List[MarketplaceMatch] = Field(..., description="Matching marketplace products")
    request_id: int = Field(..., description="Request ID for tracking")
    confidence_score: float = Field(..., description="Overall confidence score")
    
    # Additional metadata
    generated_at: Optional[str] = Field(None, description="Timestamp when generated")
    recommendations_summary: Optional[str] = Field(None, description="Summary of recommendations")

class SoilReportUpload(BaseModel):
    """Schema for soil report upload response"""
    message: str = Field(..., description="Upload status message")
    file_path: str = Field(..., description="Path where file is stored")
    extracted_data: Optional[Dict[str, Any]] = Field(None, description="Extracted soil data from OCR")
    processing_status: str = Field(default="pending", description="OCR processing status")

class FertilizerHistoryItem(BaseModel):
    """Schema for fertilizer history item"""
    id: int = Field(..., description="History record ID")
    crop_type: str = Field(..., description="Crop type")
    confidence_score: Optional[float] = Field(None, description="Confidence score")
    organic_preference: str = Field(..., description="Organic preference")
    created_at: str = Field(..., description="Creation timestamp")
    soil_data: Dict[str, Any] = Field(..., description="Original soil data")
    npk_recommendation: Dict[str, Any] = Field(..., description="NPK recommendation")
# Updated 2026-07-13 21:55:08
# Updated 2026-07-13 21:55:31
# Updated 2026-07-13 22:04:14
# Updated 2026-07-13 22:04:30
# Updated 2026-07-13 22:04:31
# Updated 2026-07-13 22:04:37
# Updated 2026-07-13 22:04:40
# Updated 2026-07-13 22:10:52
