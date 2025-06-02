// Raw Data Interface - Marketplace Management System
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';

const FuturisticMarketplace = () => {
  const { currentUser } = useContext(AuthContext);
  
  // Core state for data processing
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'name'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [cart, setCart] = useState([]);

  // Core API functions
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);

      const response = await fetch(`/api/marketplace/products?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Products fetch failed: ${response.status}`);
      }

      const result = await response.json();
      setProducts(result.products || []);
    } catch (error) {
      console.error('Products fetch failed:', error);
      setErrors({ products: 'Failed to load products' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/marketplace/categories', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Categories fetch failed: ${response.status}`);
      }

      const result = await response.json();
      setCategories(result.categories || []);
    } catch (error) {
      console.error('Categories fetch failed:', error);
      setErrors({ categories: 'Failed to load categories' });
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/marketplace/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity
        })
      });

      if (!response.ok) {
        throw new Error(`Add to cart failed: ${response.status}`);
      }

      const result = await response.json();
      setCart(result.cart || []);
    } catch (error) {
      console.error('Add to cart failed:', error);
      setErrors({ cart: 'Failed to add item to cart' });
    }
  };

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/marketplace/cart', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Cart fetch failed: ${response.status}`);
      }

      const result = await response.json();
      setCart(result.cart || []);
    } catch (error) {
      console.error('Cart fetch failed:', error);
      setErrors({ cart: 'Failed to load cart' });
    }
  };

  // Auto-fetch data on load and filter changes
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchCart();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  // Filter handlers
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'name'
    });
  };

  // Raw data output - no UI, just JSON
  return (
    <div>
      <h1>Marketplace Management System - Raw Data Interface</h1>
        {/* Current User */}
      <div>
        <h2>Current User</h2>
        <pre>{JSON.stringify(currentUser, null, 2)}</pre>
      </div>

      {/* Filters */}
      <div>
        <h2>Filters</h2>
        <pre>{JSON.stringify(filters, null, 2)}</pre>
        
        <h3>Filter Controls</h3>
        <input
          type="text"
          placeholder="Search products"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={(e) => handleFilterChange('minPrice', e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
        />
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
        >
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="rating">Rating</option>
          <option value="created_at">Date Added</option>
        </select>
        <button onClick={clearFilters}>Clear Filters</button>
      </div>

      {/* Categories */}
      <div>
        <h2>Available Categories</h2>
        <pre>{JSON.stringify(categories, null, 2)}</pre>
      </div>

      {/* Products */}
      <div>
        <h2>Products ({products.length} items)</h2>
        <pre>{JSON.stringify(products, null, 2)}</pre>
        
        <h3>Add to Cart Actions</h3>
        {products.map(product => (
          <div key={product.id}>
            <p>{product.name} - ${product.price}</p>
            <button onClick={() => addToCart(product.id, 1)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* Cart */}
      <div>
        <h2>Shopping Cart ({cart.length} items)</h2>
        <pre>{JSON.stringify(cart, null, 2)}</pre>
      </div>

      {/* Errors Display */}
      {Object.keys(errors).length > 0 && (
        <div>
          <h2>Errors</h2>
          <pre>{JSON.stringify(errors, null, 2)}</pre>
        </div>
      )}

      {/* Loading State */}
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default FuturisticMarketplace;
