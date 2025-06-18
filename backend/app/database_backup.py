from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Float, ForeignKey, Numeric, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from datetime import datetime


# 🔧 DB Setup
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://Mukund:1605@localhost/agriai"
engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class DiseaseLog(Base):
    __tablename__ = "disease_logs"

    id = Column(Integer, primary_key=True, index=True)
    # Matching the actual database schema
    image_name = Column(String(255), nullable=False)
    predicted_class = Column(String(100), nullable=False)  # This is what's actually in the database
    timestamp = Column(DateTime, default=datetime.utcnow)

# 📦 Crop Prediction Table
class CropPrediction(Base):
    __tablename__ = 'crop_predictions'
    id = Column(Integer, primary_key=True, index=True)
    soil_condition = Column(String, index=True)
    weather = Column(String, index=True)
    region = Column(String, index=True)
    prediction = Column(String)

# 👤 User Data Table
class UserData(Base):
    __tablename__ = 'user_data'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    location = Column(String)
    soil_quality = Column(String)
    crop_history = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

# 🛒 Marketplace Products Table
class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    price = Column(Numeric(10, 2), nullable=False)
    category = Column(String(50), nullable=False)
    image_url = Column(String(255))
    stock_quantity = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship with cart items
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")

# 🛒 Cart Items Table
class CartItem(Base):
    __tablename__ = "cart_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship with product
    product = relationship("Product", back_populates="cart_items")

# 🛒 Orders Table
class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String(20), default="pending", nullable=False)
    shipping_address = Column(Text)
    payment_method = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship with order items
    order_items = relationship("OrderItem", back_populates="order")

# 🛒 Order Items Table
class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price_at_purchase = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    order = relationship("Order", back_populates="order_items")
    product = relationship("Product", back_populates="order_items")

# 🧪 Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 💾 Save function
def save_crop_prediction(soil_condition: str, weather: str, region: str, prediction: str, db: Session):
    db_prediction = CropPrediction(
        soil_condition=soil_condition,
        weather=weather,
        region=region,
        prediction=prediction
    )
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    return db_prediction

# 🌱 Crop Session Table - For crop lifecycle tracking
class CropSession(Base):
    __tablename__ = "crop_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    crop_name = Column(String(100), nullable=False)
    land_area = Column(Float, nullable=False)  # in acres/hectares
    sowing_date = Column(DateTime, nullable=False)
    expected_harvest_date = Column(DateTime, nullable=True)
    actual_harvest_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="active")  # active, completed, abandoned
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    lifecycle_stages = relationship("LifecycleStage", back_populates="crop_session", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="crop_session", cascade="all, delete-orphan")
    farm_inputs = relationship("FarmInput", back_populates="crop_session", cascade="all, delete-orphan")
    crop_yield = relationship("CropYield", back_populates="crop_session", uselist=False, cascade="all, delete-orphan")

# 🌿 Lifecycle Stage Table
class LifecycleStage(Base):
    __tablename__ = "lifecycle_stages"
    
    id = Column(Integer, primary_key=True, index=True)
    crop_session_id = Column(Integer, ForeignKey("crop_sessions.id"))
    stage_name = Column(String(50), nullable=False)  # sowing, growth, maturity, harvest
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    description = Column(Text, nullable=True)
    completed = Column(Boolean, default=False)
    
    crop_session = relationship("CropSession", back_populates="lifecycle_stages")

# ⏰ Reminder Table
class Reminder(Base):
    __tablename__ = "reminders"
    
    id = Column(Integer, primary_key=True, index=True)
    crop_session_id = Column(Integer, ForeignKey("crop_sessions.id"))
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    reminder_date = Column(DateTime, nullable=False)
    reminder_type = Column(String(50), nullable=False)  # watering, fertilizing, spraying, harvest, etc.
    completed = Column(Boolean, default=False)
    
    crop_session = relationship("CropSession", back_populates="reminders")

# 🐛 Pest/Disease Alert Table
class PestDiseaseAlert(Base):
    __tablename__ = "pest_disease_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    region = Column(String(100), nullable=False)
    crop_type = Column(String(100), nullable=False)
    alert_type = Column(String(50), nullable=False)  # pest, disease
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(String(50), nullable=False)  # low, medium, high
    created_at = Column(DateTime, default=datetime.utcnow)
    active = Column(Boolean, default=True)

# 🚜 Farm Input Table
class FarmInput(Base):
    __tablename__ = "farm_inputs"
    
    id = Column(Integer, primary_key=True, index=True)
    crop_session_id = Column(Integer, ForeignKey("crop_sessions.id"))
    input_type = Column(String(50), nullable=False)  # fertilizer, pesticide, water, labor, tools, etc.
    name = Column(String(100), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)  # kg, liters, hours, etc.
    cost = Column(Float, nullable=False)
    application_date = Column(DateTime, nullable=False)
    notes = Column(Text, nullable=True)
    
    crop_session = relationship("CropSession", back_populates="farm_inputs")

# 📊 Crop Yield Table
class CropYield(Base):
    __tablename__ = "crop_yields"
    
    id = Column(Integer, primary_key=True, index=True)
    crop_session_id = Column(Integer, ForeignKey("crop_sessions.id"), unique=True)
    yield_amount = Column(Float, nullable=False)
    yield_unit = Column(String(20), nullable=False)  # kg, tons, etc.
    quality_rating = Column(Integer, nullable=True)  # 1-5 rating
    harvest_date = Column(DateTime, nullable=False)
    notes = Column(Text, nullable=True)
    
    crop_session = relationship("CropSession", back_populates="crop_yield")

# 📝 Report Table
class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    report_type = Column(String(50), nullable=False)  # fertilizer, productivity, cost, etc.
    title = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    generated_date = Column(DateTime, default=datetime.utcnow)
