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
# Updated 2026-07-13 19:39:08
# Updated 2026-07-13 19:39:10
# Updated 2026-07-13 19:39:20
# Updated 2026-07-13 19:39:38
# Updated 2026-07-13 19:39:57
# Updated 2026-07-13 19:40:07
# Updated 2026-07-13 19:40:16
# Updated 2026-07-13 19:40:21
# Updated 2026-07-13 19:40:33
# Updated 2026-07-13 19:40:37
# Updated 2026-07-13 21:53:10
# Updated 2026-07-13 21:53:13
# Updated 2026-07-13 21:54:36
# Updated 2026-07-13 21:54:50
# Updated 2026-07-13 21:55:15
# Updated 2026-07-13 21:55:38
# Updated 2026-07-13 21:55:39
# Updated 2026-07-13 22:03:50
# Updated 2026-07-13 22:04:35
# Updated 2026-07-13 22:09:17
# Updated 2026-07-13 22:09:24
# Updated 2026-07-13 22:09:44
# Updated 2026-07-13 22:10:07
# Updated 2026-07-13 22:10:17
# Updated 2026-07-13 22:10:49
