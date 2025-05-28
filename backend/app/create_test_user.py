# filepath: d:\AgriAI\backend\app\create_test_user.py
import os
import sys

# Add the parent directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.database import SessionLocal
from app.models.users import DBUser

# Create password context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_test_user():
    # Create a database session
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(DBUser).filter(DBUser.email == "Test@example.com").first()
        if existing_user:
            print("Test user already exists!")
            return
        
        # Hash the password
        hashed_password = pwd_context.hash("Test123")
        
        # Create new user
        new_user = DBUser(
            email="Test@example.com",
            full_name="Test User",
            hashed_password=hashed_password,
            is_active=True
        )
        
        # Add to database
        db.add(new_user)
        db.commit()
        print("Test user created successfully!")
    
    except Exception as e:
        db.rollback()
        print(f"Error creating test user: {e}")
    
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()
