from sqlalchemy import text
import os
from app.database import engine, Base, get_db, Product, CartItem, Order, OrderItem
from decimal import Decimal
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def setup_marketplace_tables():
    """Create the marketplace tables and populate with sample data if they don't exist."""
    try:
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Marketplace tables created successfully")
        
        # Check if products table is empty
        db = next(get_db())
        product_count = db.query(Product).count()
        
        if product_count == 0:
            # Load sample data from SQL file
            script_dir = os.path.dirname(os.path.abspath(__file__))
            sql_file_path = os.path.join(script_dir, "models", "products.sql")
            
            if os.path.exists(sql_file_path):
                with open(sql_file_path, 'r') as file:
                    sql_content = file.read()
                
                # Split SQL statements and execute each one
                statements = sql_content.split(';')
                for statement in statements:
                    if statement.strip():
                        db.execute(text(statement))
                
                db.commit()
                logger.info("✅ Sample marketplace data loaded successfully")
            else:
                logger.error(f"❌ SQL file not found at {sql_file_path}")
        else:
            logger.info("✅ Products table already contains data, skipping sample data import")
            
    except Exception as e:
        logger.error(f"❌ Error setting up marketplace tables: {e}")
        raise

if __name__ == "__main__":
    setup_marketplace_tables()
