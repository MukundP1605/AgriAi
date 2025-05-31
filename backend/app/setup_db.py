from app.database import Base, engine, SessionLocal
from app.models.users import DBUser
from app.utils.auth import get_password_hash
from datetime import datetime

def setup_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create a test user if it doesn't exist
    db = SessionLocal()
    try:
        # Check if test user exists
        test_user = db.query(DBUser).filter(DBUser.email == "test@agriai.com").first()
        
        if not test_user:
            # Create test user
            hashed_password = get_password_hash("password123")
            test_user = DBUser(
                email="test@agriai.com",
                full_name="Test User",
                hashed_password=hashed_password,
                location="Test Location, India",
                farm_type="small",
                created_at=datetime.now().isoformat()
            )
            
            db.add(test_user)
            db.commit()
            db.refresh(test_user)
            print(f"✅ Test user created: {test_user.email}")
        else:
            print(f"ℹ️ Test user already exists: {test_user.email}")
            
    finally:
        db.close()

if __name__ == "__main__":
    print("Setting up database and creating test user...")
    setup_db()
    print("Done!")
