import sys
import os
import logging
from sqlalchemy import create_engine, Column, DateTime, Float, JSON, Boolean, Text, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base, get_db, engine
from app.models.history import UserCropHistory

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def add_columns_to_user_crop_history():
    """Add missing columns to UserCropHistory table"""
    try:
        # Create a connection
        conn = engine.connect()
        
        # Check if columns exist before adding them
        # We'll check just one column - if created_at is missing, assume others are too
        try:
            conn.execute("SELECT created_at FROM user_crop_history LIMIT 1")
            logger.info("Column 'created_at' already exists in user_crop_history table")
        except Exception:
            logger.info("Adding missing columns to user_crop_history table...")
            
            # Add the missing columns one by one
            columns_to_add = [
                "ALTER TABLE user_crop_history ADD COLUMN soil_nutrients JSON",
                "ALTER TABLE user_crop_history ADD COLUMN climate_data JSON",
                "ALTER TABLE user_crop_history ADD COLUMN season VARCHAR(50)",
                "ALTER TABLE user_crop_history ADD COLUMN confidence_score FLOAT",
                "ALTER TABLE user_crop_history ADD COLUMN alternative_crops JSON",
                "ALTER TABLE user_crop_history ADD COLUMN implementation_status VARCHAR(50) DEFAULT 'pending'",
                "ALTER TABLE user_crop_history ADD COLUMN notes TEXT",
                "ALTER TABLE user_crop_history ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
                "ALTER TABLE user_crop_history ADD COLUMN is_archived BOOLEAN DEFAULT FALSE"
            ]
            
            for column_sql in columns_to_add:
                try:
                    conn.execute(column_sql)
                    logger.info(f"Successfully executed: {column_sql}")
                except Exception as e:
                    logger.warning(f"Error adding column (may already exist): {e}")
            
            logger.info("Columns added successfully to user_crop_history table")
        
        conn.close()
        logger.info("Database update completed successfully")
        
    except Exception as e:
        logger.error(f"Error updating database: {e}")
        raise

if __name__ == "__main__":
    add_columns_to_user_crop_history()
    print("✅ Database update completed")
