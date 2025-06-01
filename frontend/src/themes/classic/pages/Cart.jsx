import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();

  // Checkout form state
  const [showCheckout, setShowCheckout] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  useEffect(() => {
    // Check if user is authenticated and has the necessary properties
    if (!isAuthenticated || !currentUser || !currentUser.id) {
      console.log('User not authenticated or user data incomplete:', { isAuthenticated, currentUser });
      navigate('/login?redirect=cart');
      return;
    }
    
    fetchCart();
  }, [isAuthenticated, currentUser, navigate]);

  const fetchCart = async () => {
    if (!currentUser || !currentUser.id) {
      console.error('Cannot fetch cart: user ID is missing');
      setError('User information is incomplete. Please log in again.');
      setLoading(false);
      return;
    }
      try {
      setLoading(true);
      const response = await axios.get(`/api/marketplace/cart?user_id=${currentUser.id}`);
      // Ensure cartItems is always an array
      const items = Array.isArray(response.data.items) ? response.data.items : [];
      setCartItems(items);
      setTotalAmount(response.data.total_amount || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load your cart. Please try again later.');
      setCartItems([]); // Set empty array on error
      setTotalAmount(0);
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        await axios.delete(`/api/marketplace/cart/${cartItemId}?user_id=${currentUser.id}`);
      } else {
        await axios.put(`/api/marketplace/cart/${cartItemId}?quantity=${newQuantity}&user_id=${currentUser.id}`);
      }
      await fetchCart();
    } catch (err) {
      console.error('Error updating cart:', err);
      alert('Failed to update cart. Please try again.');
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      await axios.delete(`/api/marketplace/cart/${cartItemId}?user_id=${currentUser.id}`);
      await fetchCart();
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Failed to remove item. Please try again.');
    }
  };
  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!shippingAddress) {
      alert('Please enter a shipping address');
      return;
    }
    
    try {
      setCheckoutLoading(true);
      const response = await axios.post(`/api/marketplace/checkout?user_id=${currentUser.id}`, {
        shipping_address: shippingAddress,
        payment_method: paymentMethod
      });
      
      // Redirect to order success page
      navigate(`/order-success/${response.data.order_id}`);
    } catch (err) {
      console.error('Checkout error:', err);
      alert(`Checkout failed: ${err.response?.data?.detail || 'Please try again later'}`);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Loading your cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-center text-red-600">
        <p>{error}</p>
        <button 
          onClick={fetchCart}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Try Again
        </button>
      </div>
    );
  }
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold text-green-700 mb-4">Your Cart</h1>
        <p className="text-gray-600 mb-6">Your cart is empty</p>
        <Link to="/marketplace" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-green-700 mb-6 text-center">Your Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">          {cartItems.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 border-b border-gray-200 py-4">
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-green-700">{item.product.name}</h3>
                <p className="text-gray-500 text-sm">{item.product.category}</p>
                <p className="text-green-600 font-bold">${Number(item.product.price || 0).toFixed(2)}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full"
                >
                  -
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full"
                >
                  +
                </button>
              </div>
                <div className="text-right">
                <p className="font-bold">${(Number(item.product.price || 0) * item.quantity).toFixed(2)}</p>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-600 text-sm hover:underline mt-1"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>${Number(totalAmount || 0).toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between mb-2">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          
          <div className="border-t border-gray-300 my-4"></div>
          
          <div className="flex justify-between font-bold text-lg mb-6">
            <span>Total</span>
            <span>${Number(totalAmount || 0).toFixed(2)}</span>
          </div>
          
          {!showCheckout ? (
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Proceed to Checkout
            </button>
          ) : (
            <form onSubmit={handleCheckout} className="mt-4">
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Shipping Address</label>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                  rows="3"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
                disabled={checkoutLoading}
              >
                {checkoutLoading ? 'Processing...' : 'Complete Order'}
              </button>
            </form>
          )}
          
          <Link to="/marketplace" className="block text-center text-green-600 mt-4 hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
