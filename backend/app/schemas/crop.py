from pydantic import BaseModel

# 🟢 Input schema (from frontend)
class CropRequest(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float
    location: str  # Location field for personalization
    soil_quality: str  # Soil quality field for personalization

    model_config = {
        "from_attributes": True
    }
class CropResponse(BaseModel):
    crop: str
# app/schemas/crop.py (continue after CropResponse)
# Updated 2026-07-13 19:39:02
# Updated 2026-07-13 19:39:07
