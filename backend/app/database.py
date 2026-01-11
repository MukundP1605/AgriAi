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

# Note: Crop management models moved to app/models/crop_management.py to avoid duplicates# Updated 2026-07-13 19:26:08
# Updated 2026-07-13 19:26:22
# Updated 2026-07-13 19:26:27
# Updated 2026-07-13 19:32:45
# Updated 2026-07-13 19:32:52
# Updated 2026-07-13 19:32:53
# Updated 2026-07-13 19:33:03
# Updated 2026-07-13 19:33:10
# Updated 2026-07-13 19:33:15
