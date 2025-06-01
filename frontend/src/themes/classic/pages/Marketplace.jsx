import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, currentUser } = useAuth();

  useEffect(() => {    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          selectedCategory 
            ? `/api/marketplace/products?category=${selectedCategory}` 
            : '/api/marketplace/products'
        );
        console.log('Products response:', response.data);
        // Ensure we're setting an array
        setProducts(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        setProducts([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/marketplace/products/categories');
        console.log('Categories response:', response.data);
        // Ensure we're setting an array
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories([]); // Set to empty array on error
      }
    };

    fetchProducts();
    fetchCategories();
  }, [selectedCategory]);

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/login?redirect=marketplace';
      return;
    }    try {
      await axios.post(`/api/marketplace/cart`, {
        user_id: currentUser.id,
        product_id: productId,
        quantity: 1
      });
      
      // Show success message
      alert('Product added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add product to cart. Please try again.');
    }
  };
  return (
    <div className="container mx-auto py-8 px-4 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          AgriAI <span className="text-green-600">Marketplace</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Discover premium agricultural products, tools, and equipment to enhance your farming operations
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Shop by Category</h2>
        <div className="flex flex-wrap gap-3">
          <button
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              selectedCategory === '' 
                ? 'bg-green-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 border border-gray-200'
            }`}
            onClick={() => setSelectedCategory('')}
          >
            All Products
          </button>
            {Array.isArray(categories) && categories.length > 0 ? (
            categories.map((category) => (
              <button
                key={category}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category 
                    ? 'bg-green-600 text-white shadow-lg' 
                    : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 border border-gray-200'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))
          ) : (
            // Default categories if API fails
            ['Fertilizers', 'Pesticides', 'Tools', 'Seeds', 'Equipment'].map((category) => (
              <button
                key={category}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category 
                    ? 'bg-green-600 text-white shadow-lg' 
                    : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 border border-gray-200'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading products...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8 text-red-600">
          <p>{error}</p>
        </div>
      )}      {/* Products Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.isArray(products) && products.length > 0 ? (
            products.map((product) => (              <div 
                key={product.id} 
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl group"
              >
                <div className="p-5">
                  <div className="mb-3 flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-green-600 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        {product.category}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.stock_quantity > 10 
                        ? 'bg-green-100 text-green-800' 
                        : product.stock_quantity > 0 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl font-bold text-green-600">
                      ${typeof product.price === 'number' 
                        ? product.price.toFixed(2) 
                        : parseFloat(product.price).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                        !isAuthenticated || product.stock_quantity === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md transform hover:-translate-y-0.5'
                      }`}
                      disabled={!isAuthenticated || product.stock_quantity === 0}
                    >
                      {!isAuthenticated ? 'Login to Buy' : product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    
                    <Link
                      to={`/marketplace/product/${product.id}`}
                      className="px-3 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No products available</h3>
              <p className="text-gray-500">Please check back later or try a different category.</p>
            </div>
          )}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No products found for this category.</p>
        </div>
      )}      {/* Floating Cart Button */}
      {isAuthenticated && (
        <div className="fixed bottom-6 right-6 z-50">
          <Link 
            to="/cart" 
            className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 flex items-center justify-center group hover:scale-110 relative"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13h10M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              ?
            </span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
