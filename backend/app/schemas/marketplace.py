from pydantic import BaseModel, Field
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

# Product Schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal
    category: str
    image_url: Optional[str] = None
    stock_quantity: int = 0

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Cart Item Schemas
class CartItemBase(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemCreate(CartItemBase):
    pass

class AddToCartRequest(BaseModel):
    user_id: int
    product_id: int
    quantity: int = 1

class CartItem(CartItemBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    product: Product

    class Config:
        from_attributes = True

# Cart Summary Schema
class CartSummary(BaseModel):
    items: List[CartItem]
    total_amount: Decimal
    item_count: int

# Order Schemas
class OrderBase(BaseModel):
    shipping_address: str
    payment_method: str

class OrderCreate(OrderBase):
    pass

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price_at_purchase: Decimal

class OrderItem(OrderItemBase):
    id: int
    order_id: int
    created_at: datetime
    product: Product

    class Config:
        from_attributes = True

class Order(OrderBase):
    id: int
    user_id: int
    total_amount: Decimal
    status: str
    created_at: datetime
    updated_at: datetime
    order_items: List[OrderItem]

    class Config:
        from_attributes = True

# Checkout Schema
class CheckoutRequest(BaseModel):
    shipping_address: str
    payment_method: str

class CheckoutResponse(BaseModel):
    order_id: int
    status: str
    total_amount: Decimal
    message: str
