import os
import sys

# Get the absolute path to the backend directory (one level up from app)
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
# Add the backend directory to the Python path
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
# Change the working directory to the backend directory
os.chdir(backend_dir)

try:
    # Make sure the parent directory is in the path
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    from app.database import SessionLocal
    from app.models.users import DBUser
    from passlib.context import CryptContext

    # Password hasher
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    # Create DB session
    db = SessionLocal()    # User info
    email = "test@example.com"
    full_name = "Test User"
    raw_password = "test123"

    # Check if user already exists
    existing_user = db.query(DBUser).filter(DBUser.email == email).first()
    if existing_user:
        print("❗User already exists.")
    else:
        hashed_password = pwd_context.hash(raw_password)
        new_user = DBUser(email=email, full_name=full_name, password=hashed_password)
        db.add(new_user)
        db.commit()
        print("✅ Test user created successfully.")

    db.close()
except Exception as e:
    print(f"Error: {e}")
