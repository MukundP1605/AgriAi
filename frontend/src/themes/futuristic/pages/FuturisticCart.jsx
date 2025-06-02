// Raw Data Interface - Cart Management System
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';

const FuturisticCart = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Core state for data processing
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [totals, setTotals] = useState({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0
  });
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  // Core API functions
  const fetchCart = async () => {
    setLoading(true);
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
      setCartItems(result.items || []);
      calculateTotals(result.items || []);
    } catch (error) {
      console.error('Cart fetch failed:', error);
      setErrors({ cart: 'Failed to load cart' });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/marketplace/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          item_id: itemId,
          quantity: newQuantity
        })
      });

      if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`);
      }

      const result = await response.json();
      setCartItems(result.items || []);
      calculateTotals(result.items || []);
    } catch (error) {
      console.error('Update quantity failed:', error);
      setErrors({ update: 'Failed to update quantity' });
    }
  };

  const removeItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/marketplace/cart/remove/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Remove failed: ${response.status}`);
      }

      const result = await response.json();
      setCartItems(result.items || []);
      calculateTotals(result.items || []);
    } catch (error) {
      console.error('Remove item failed:', error);
      setErrors({ remove: 'Failed to remove item' });
    }
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/marketplace/cart/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Clear cart failed: ${response.status}`);
      }

      setCartItems([]);
      calculateTotals([]);
    } catch (error) {
      console.error('Clear cart failed:', error);
      setErrors({ clear: 'Failed to clear cart' });
    }
  };

  const checkout = async () => {
    if (!validateShippingAddress()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/marketplace/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shipping_address: shippingAddress,
          payment_method: 'cod' // For now, just cash on delivery
        })
      });

      if (!response.ok) {
        throw new Error(`Checkout failed: ${response.status}`);
      }

      const result = await response.json();
      // Navigate to order success page
      navigate(`/order-success/${result.order_id}`);
    } catch (error) {
      console.error('Checkout failed:', error);
      setErrors({ checkout: 'Checkout failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.18; // 18% GST
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
    const total = subtotal + tax + shipping;

    setTotals({
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2)
    });
  };

  const validateShippingAddress = () => {
    const newErrors = {};
    
    if (!shippingAddress.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    if (!shippingAddress.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!shippingAddress.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!shippingAddress.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto-fetch cart on load
  useEffect(() => {
    fetchCart();
  }, []);

  // Raw data output - no UI, just JSON
  return (
    <div>
      <h1>Cart Management System - Raw Data Interface</h1>
        {/* Current User */}
      <div>
        <h2>Current User</h2>
        <pre>{JSON.stringify(currentUser, null, 2)}</pre>
      </div>

      {/* Cart Items */}
      <div>
        <h2>Cart Items ({cartItems.length} items)</h2>
        <pre>{JSON.stringify(cartItems, null, 2)}</pre>
        
        <h3>Item Actions</h3>
        {cartItems.map(item => (
          <div key={item.id}>
            <p>{item.name} - Qty: {item.quantity} - ${item.price}</p>
            <input
              type="number"
              value={item.quantity}
              min="1"
              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
            />
            <button onClick={() => removeItem(item.id)}>Remove</button>
          </div>
        ))}
      </div>

      {/* Cart Totals */}
      <div>
        <h2>Cart Totals</h2>
        <pre>{JSON.stringify(totals, null, 2)}</pre>
      </div>

      {/* Shipping Address */}
      <div>
        <h2>Shipping Address</h2>
        <pre>{JSON.stringify(shippingAddress, null, 2)}</pre>
        
        <h3>Address Form</h3>
        <input
          type="text"
          placeholder="Street Address"
          value={shippingAddress.street}
          onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
        />
        <input
          type="text"
          placeholder="City"
          value={shippingAddress.city}
          onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
        />
        <input
          type="text"
          placeholder="State"
          value={shippingAddress.state}
          onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
        />
        <input
          type="text"
          placeholder="ZIP Code"
          value={shippingAddress.zipCode}
          onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
        />
        <input
          type="text"
          placeholder="Country"
          value={shippingAddress.country}
          onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
        />
      </div>

      {/* Actions */}
      <div>
        <h2>Cart Actions</h2>
        <button onClick={clearCart} disabled={cartItems.length === 0}>
          Clear Cart
        </button>
        <button onClick={checkout} disabled={loading || cartItems.length === 0}>
          {loading ? 'Processing...' : 'Checkout'}
        </button>
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

export default FuturisticCart;
