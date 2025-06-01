#!/usr/bin/env python3
"""
Add sample products to the marketplace database
"""

from app.database import get_db, Product
from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import datetime

def add_sample_products():
    """Add sample products to the database"""
    db = next(get_db())
    
    # Check if products already exist
    existing_products = db.query(Product).count()
    if existing_products > 0:
        print(f"Products already exist ({existing_products} products). Skipping...")
        return
    
    sample_products = [
        {
            "name": "Organic Tomato Seeds",
            "description": "High-quality organic tomato seeds perfect for home gardening. Disease-resistant variety with excellent yield.",
            "price": Decimal("15.99"),
            "category": "Seeds",
            "image_url": "/images/products/tomato-seeds.jpg",
            "stock_quantity": 100
        },
        {
            "name": "Premium Fertilizer Mix",
            "description": "Nutrient-rich organic fertilizer blend suitable for all types of crops. Promotes healthy growth and higher yields.",
            "price": Decimal("29.99"),
            "category": "Fertilizers",
            "image_url": "/images/products/fertilizer.jpg",
            "stock_quantity": 50
        },
        {
            "name": "Garden Sprinkler System",
            "description": "Automated irrigation system for efficient water management. Easy to install and suitable for medium-sized farms.",
            "price": Decimal("149.99"),
            "category": "Tools",
            "image_url": "/images/products/sprinkler.jpg",
            "stock_quantity": 25
        },
        {
            "name": "Corn Seeds - Hybrid Variety",
            "description": "High-yield hybrid corn seeds with excellent disease resistance. Perfect for commercial farming.",
            "price": Decimal("45.00"),
            "category": "Seeds",
            "image_url": "/images/products/corn-seeds.jpg",
            "stock_quantity": 75
        },
        {
            "name": "Soil pH Test Kit",
            "description": "Professional soil testing kit to check pH levels and nutrient content. Essential for optimal crop growth.",
            "price": Decimal("24.99"),
            "category": "Tools",
            "image_url": "/images/products/ph-kit.jpg",
            "stock_quantity": 60
        },
        {
            "name": "Organic Pesticide Spray",
            "description": "Natural pest control solution safe for organic farming. Effective against common agricultural pests.",
            "price": Decimal("18.50"),
            "category": "Pesticides",
            "image_url": "/images/products/pesticide.jpg",
            "stock_quantity": 40
        },
        {
            "name": "Wheat Seeds - Premium Grade",
            "description": "High-quality wheat seeds with excellent germination rate. Suitable for various soil types.",
            "price": Decimal("35.00"),
            "category": "Seeds",
            "image_url": "/images/products/wheat-seeds.jpg",
            "stock_quantity": 80
        },
        {
            "name": "Smart Soil Moisture Sensor",
            "description": "IoT-enabled soil moisture sensor with real-time monitoring capabilities. Connect to your smartphone.",
            "price": Decimal("89.99"),
            "category": "Tools",
            "image_url": "/images/products/moisture-sensor.jpg",
            "stock_quantity": 30
        },
        {
            "name": "Vegetable Seed Collection",
            "description": "Complete collection of popular vegetable seeds including carrots, lettuce, peppers, and more.",
            "price": Decimal("39.99"),
            "category": "Seeds",
            "image_url": "/images/products/vegetable-collection.jpg",
            "stock_quantity": 45
        },
        {
            "name": "Greenhouse Starter Kit",
            "description": "Everything you need to start your own greenhouse. Includes structure, ventilation, and growing supplies.",
            "price": Decimal("299.99"),
            "category": "Tools",
            "image_url": "/images/products/greenhouse-kit.jpg",
            "stock_quantity": 15
        }
    ]
    
    try:
        for product_data in sample_products:
            product = Product(**product_data)
            db.add(product)
        
        db.commit()
        print(f"Successfully added {len(sample_products)} sample products to the database!")
        
        # Display added products
        print("\nAdded products:")
        for product_data in sample_products:
            print(f"- {product_data['name']} (${product_data['price']}) - {product_data['category']}")
            
    except Exception as e:
        db.rollback()
        print(f"Error adding products: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_products()
