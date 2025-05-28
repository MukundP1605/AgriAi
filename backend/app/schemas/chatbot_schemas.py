from pydantic import BaseModel
from typing import Optional, List

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"

class ChatResponse(BaseModel):
    reply: str
    intent: Optional[str] = None  # e.g., "greeting", "crop_advice", etc.
    sources: Optional[List[str]] = None  # if using LLM with sources
