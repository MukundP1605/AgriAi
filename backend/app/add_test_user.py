from app.database import SessionLocal
from app.models.users import DBUser
from passlib.context import CryptContext

# Password hasher
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Create DB session
db = SessionLocal()

# User info
email = "test@example.com"
raw_password = "test123"

# Check if user already exists
existing_user = db.query(DBUser).filter(DBUser.email == email).first()
if existing_user:
    print("❗User already exists.")
else:
    hashed_password = pwd_context.hash(raw_password)
    new_user = DBUser(email=email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    print("✅ Test user created successfully.")

db.close()
