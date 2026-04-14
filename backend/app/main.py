import sys
import os
import logging
from dotenv import load_dotenv
from pathlib import Path
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
from app.routes import crop
from app.routes.user_data import router as save_user_data_router
from app.routes.disease import router as disease_router
from app.routes.chatbot import router as chatbot_router
from app.routes.auth_router import router as auth_router
from app.routes.user_history import router as history_router
from app.routes.user_profile import router as profile_router
from app.routes.marketplace import router as marketplace_router
from app.routes.fertilizer import router as fertilizer_router
from app.routes.crop_management import router as crop_management_router
from app.database import Base, engine, get_db, SessionLocal
from sqlalchemy.orm import Session
from app.utils.redis_client import redis_client

# Load environment variables at startup
load_dotenv()

# Verify required environment variables
required_vars = ["OPENROUTER_API_KEY", "SECRET_KEY"]
for var in required_vars:
    if not os.getenv(var):
        raise ValueError(f"{var} is missing in .env file")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    logger.error("OPENROUTER_API_KEY is missing in .env file")
    raise ValueError("OPENROUTER_API_KEY is missing in .env file")
else:
    logger.info("✅ OpenRouter API key loaded successfully")

try:
    logger.info("Ensuring database tables exist...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables are ready.")
except Exception as e:
    logger.error(f"Error creating tables: {e}")
    raise

app = FastAPI(
    title="🌿 AgriAI Crop Prediction API",
    version="1.0.0",
    description="An API to predict the best crop based on soil and weather conditions."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000", 
                  "http://localhost:5174", "http://localhost:5175", "http://127.0.0.1:5174", "http://127.0.0.1:5175",
                  "http://localhost:*", "http://127.0.0.1:*"],  # frontend origins with wildcard for dev ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(crop.router, tags=["Crop Prediction"])
app.include_router(save_user_data_router, tags=["User Data"])
app.include_router(disease_router, tags=["Disease Detection"])
app.include_router(chatbot_router, prefix="/api/chatbot", tags=["Chatbot"])
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(history_router, prefix="/api/user/history", tags=["User History"])
app.include_router(profile_router, prefix="/api/user/profile", tags=["User Profile"])
app.include_router(marketplace_router, prefix="/api/marketplace", tags=["Marketplace"])
app.include_router(fertilizer_router, prefix="/api/fertilizer", tags=["Fertilizer Recommendation"])
app.include_router(crop_management_router, prefix="/api/crop-management", tags=["Crop Management"])

@app.on_event("startup")
async def startup_event():
    try:
        redis_client.ping()  # Changed from await since Redis client is synchronous
        logger.info("✅ Redis connected successfully!")
    except Exception as e:
        logger.error(f"⚠️ Redis connection failed at startup: {e}")

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "🌿 AgriAI API is up and running!"}

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint to verify the API is running"""
    return {
        "status": "healthy",
        "message": "AgriAI API is running properly",
        "version": "1.0.0"
    }
# Updated 2026-07-13 19:25:53
# Updated 2026-07-13 19:25:56
# Updated 2026-07-13 19:25:57
# Updated 2026-07-13 19:26:01
# Updated 2026-07-13 19:26:06
# Updated 2026-07-13 19:26:09
# Updated 2026-07-13 19:26:12
# Updated 2026-07-13 19:26:17
# Updated 2026-07-13 19:26:18
# Updated 2026-07-13 19:26:21
# Updated 2026-07-13 19:26:24
# Updated 2026-07-13 19:26:26
# Updated 2026-07-13 19:32:45
# Updated 2026-07-13 19:32:48
# Updated 2026-07-13 19:32:54
# Updated 2026-07-13 19:33:22
# Updated 2026-07-13 19:33:41
# Updated 2026-07-13 19:33:42
# Updated 2026-07-13 19:34:03
# Updated 2026-07-13 19:34:10
# Updated 2026-07-13 19:34:17
# Updated 2026-07-13 19:34:24
# Updated 2026-07-13 19:34:29
# Updated 2026-07-13 19:39:12
# Updated 2026-07-13 19:39:32
# Updated 2026-07-13 19:39:47
# Updated 2026-07-13 19:39:51
# Updated 2026-07-13 19:40:19
# Updated 2026-07-13 21:53:20
# Updated 2026-07-13 21:54:02
# Updated 2026-07-13 21:54:20
# Updated 2026-07-13 21:54:30
# Updated 2026-07-13 21:54:53
