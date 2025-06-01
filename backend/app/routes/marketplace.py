from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

from app.database import get_db, Product as ProductModel, CartItem as CartItemModel, Order as OrderModel, OrderItem as OrderItemModel
from app.schemas.marketplace import (
    Product as ProductSchema,
    CartItem as CartItemSchema,
    CartSummary,
    AddToCartRequest,
    OrderCreate,
    Order as OrderSchema,
    CheckoutRequest,
    CheckoutResponse
)

router = APIRouter()

# GET all products
@router.get("/products", response_model=List[ProductSchema])
def get_products(
    skip: int = 0, 
    limit: int = 100, 
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all products with optional filtering by category"""
    query = db.query(ProductModel)
    
    if category:
        query = query.filter(ProductModel.category == category)
    
    products = query.offset(skip).limit(limit).all()
    return products

# GET all product categories
@router.get("/products/categories", response_model=List[str])
def get_product_categories(db: Session = Depends(get_db)):
    """Get all unique product categories"""
    categories = db.query(ProductModel.category).distinct().all()
    return [category[0] for category in categories]

# GET product by ID
@router.get("/products/{product_id}", response_model=ProductSchema)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product by ID"""
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# GET user's cart
@router.get("/cart", response_model=CartSummary)
def get_cart(user_id: int, db: Session = Depends(get_db)):
    """Get the current user's shopping cart"""
    cart_items = db.query(CartItemModel).filter(CartItemModel.user_id == user_id).all()
    
    # Calculate total amount
    total_amount = Decimal('0.00')
    for item in cart_items:
        product = db.query(ProductModel).filter(ProductModel.id == item.product_id).first()
        if product:
            total_amount += product.price * item.quantity
    
    return CartSummary(
        items=cart_items,
        total_amount=total_amount,
        item_count=len(cart_items)
    )

# POST add item to cart
@router.post("/cart", response_model=CartItemSchema)
def add_to_cart(
    request: AddToCartRequest,
    db: Session = Depends(get_db)
):
    """Add a product to the user's cart"""
    # Check if product exists
    product = db.query(ProductModel).filter(ProductModel.id == request.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if product is in stock
    if product.stock_quantity < request.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock available")
    
    # Check if item already in cart
    cart_item = db.query(CartItemModel).filter(
        CartItemModel.user_id == request.user_id, 
        CartItemModel.product_id == request.product_id
    ).first()
    
    if cart_item:
        # Update existing cart item
        cart_item.quantity += request.quantity
        cart_item.updated_at = datetime.utcnow()
    else:
        # Create new cart item
        cart_item = CartItemModel(
            user_id=request.user_id,
            product_id=request.product_id,
            quantity=request.quantity
        )
        db.add(cart_item)
    
    db.commit()
    db.refresh(cart_item)
    return cart_item

# PUT update cart item
@router.put("/cart/{cart_item_id}", response_model=CartItemSchema)
def update_cart_item(
    cart_item_id: int, 
    quantity: int, 
    user_id: int,
    db: Session = Depends(get_db)
):
    """Update the quantity of an item in the cart"""
    cart_item = db.query(CartItemModel).filter(
        CartItemModel.id == cart_item_id,
        CartItemModel.user_id == user_id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    # Check if product has enough stock
    product = db.query(ProductModel).filter(ProductModel.id == cart_item.product_id).first()
    if product.stock_quantity < quantity:
        raise HTTPException(status_code=400, detail="Not enough stock available")
    
    if quantity <= 0:
        # Remove item from cart if quantity is 0 or negative
        db.delete(cart_item)
    else:
        # Update quantity
        cart_item.quantity = quantity
        cart_item.updated_at = datetime.utcnow()
    
    db.commit()
    
    if quantity <= 0:
        return {"message": "Item removed from cart"}
    
    db.refresh(cart_item)
    return cart_item

# DELETE remove item from cart
@router.delete("/cart/{cart_item_id}")
def remove_from_cart(cart_item_id: int, user_id: int, db: Session = Depends(get_db)):
    """Remove an item from the cart"""
    cart_item = db.query(CartItemModel).filter(
        CartItemModel.id == cart_item_id,
        CartItemModel.user_id == user_id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    db.delete(cart_item)
    db.commit()
    
    return {"message": "Item removed from cart"}

# POST checkout
@router.post("/checkout", response_model=CheckoutResponse)
def checkout(
    checkout_data: CheckoutRequest,
    user_id: int,
    db: Session = Depends(get_db)
):
    """Process checkout and create an order from the cart items"""
    # Get user's cart
    cart_items = db.query(CartItemModel).filter(CartItemModel.user_id == user_id).all()
    
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate total amount and validate stock
    total_amount = Decimal('0.00')
    order_items_data = []
    
    for cart_item in cart_items:
        product = db.query(ProductModel).filter(ProductModel.id == cart_item.product_id).first()
        
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with ID {cart_item.product_id} not found")
        
        if product.stock_quantity < cart_item.quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Not enough stock for {product.name}. Available: {product.stock_quantity}"
            )
        
        item_total = product.price * cart_item.quantity
        total_amount += item_total
        
        order_items_data.append({
            "product_id": product.id,
            "quantity": cart_item.quantity,
            "price_at_purchase": product.price
        })
    
    # Create order
    new_order = OrderModel(
        user_id=user_id,
        total_amount=total_amount,
        status="pending",
        shipping_address=checkout_data.shipping_address,
        payment_method=checkout_data.payment_method
    )
    
    db.add(new_order)
    db.flush()  # Flush to get the order ID
    
    # Create order items
    for item_data in order_items_data:
        order_item = OrderItemModel(
            order_id=new_order.id,
            product_id=item_data["product_id"],
            quantity=item_data["quantity"],
            price_at_purchase=item_data["price_at_purchase"]
        )
        db.add(order_item)
        
        # Update product stock
        product = db.query(ProductModel).filter(ProductModel.id == item_data["product_id"]).first()
        product.stock_quantity -= item_data["quantity"]
    
    # Clear the cart
    for cart_item in cart_items:
        db.delete(cart_item)
    
    db.commit()
    
    return CheckoutResponse(
        order_id=new_order.id,
        status=new_order.status,
        total_amount=new_order.total_amount,
        message="Order created successfully"
    )

# GET order history
@router.get("/orders", response_model=List[OrderSchema])
def get_orders(user_id: int, db: Session = Depends(get_db)):
    """Get the user's order history"""
    orders = db.query(OrderModel).filter(OrderModel.user_id == user_id).all()
    return orders

# GET specific order
@router.get("/orders/{order_id}", response_model=OrderSchema)
def get_order(order_id: int, user_id: int, db: Session = Depends(get_db)):
    """Get a specific order by ID"""
    order = db.query(OrderModel).filter(
        OrderModel.id == order_id,
        OrderModel.user_id == user_id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return order
