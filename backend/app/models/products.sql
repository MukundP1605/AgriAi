-- Predefined products list for AgriAI marketplace

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    image_url VARCHAR(255),
    stock_quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE KEY user_product (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    shipping_address TEXT,
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert sample products
INSERT INTO products (name, description, price, category, image_url, stock_quantity) VALUES
('Organic Fertilizer', 'Premium organic fertilizer for all types of crops', 29.99, 'Fertilizers', '/images/products/organic-fertilizer.jpg', 100),
('Neem Oil Spray', 'Natural pest control solution made from neem oil', 19.99, 'Pesticides', '/images/products/neem-oil.jpg', 75),
('Soil pH Testing Kit', 'Accurate testing kit for measuring soil pH levels', 15.99, 'Tools', '/images/products/ph-kit.jpg', 50),
('High-Yield Tomato Seeds', 'Premium tomato seeds with high germination rate', 5.99, 'Seeds', '/images/products/tomato-seeds.jpg', 200),
('Drip Irrigation System', 'Water-efficient irrigation system for small farms', 89.99, 'Equipment', '/images/products/drip-irrigation.jpg', 30),
('Crop Cover Fabric', 'Protective fabric to shield crops from pests and frost', 34.99, 'Equipment', '/images/products/crop-cover.jpg', 60),
('Organic Composting Bin', 'Easy-to-use bin for creating organic compost', 49.99, 'Tools', '/images/products/compost-bin.jpg', 40),
('Plant Growth Stimulator', 'Organic growth stimulator for faster crop development', 24.99, 'Fertilizers', '/images/products/growth-stimulator.jpg', 85),
('Garden Pruning Shears', 'Sharp, durable pruning shears for precise cuts', 17.99, 'Tools', '/images/products/pruning-shears.jpg', 70),
('Crop Rotation Guide Book', 'Comprehensive guide on effective crop rotation techniques', 12.99, 'Books', '/images/products/crop-rotation-book.jpg', 25),
('Moisture Meter', 'Digital soil moisture meter for precise irrigation', 22.99, 'Tools', '/images/products/moisture-meter.jpg', 55),
('Organic Pest Trap', 'Non-toxic pest trap for common garden insects', 9.99, 'Pesticides', '/images/products/pest-trap.jpg', 120);
