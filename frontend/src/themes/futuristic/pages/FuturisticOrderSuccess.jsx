// Raw Data Interface - Order Success Management System
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';

const FuturisticOrderSuccess = () => {
  const { currentUser } = useContext(AuthContext);
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  // Core state for data processing
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Core API functions
  const fetchOrderDetails = async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/marketplace/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Order fetch failed: ${response.status}`);
      }

      const result = await response.json();
      setOrderDetails(result.order || null);
    } catch (error) {
      console.error('Order fetch failed:', error);
      setErrors({ order: 'Failed to load order details' });
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async () => {
    if (!orderId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/marketplace/orders/${orderId}/invoice`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Invoice download failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Invoice download failed:', error);
      setErrors({ download: 'Failed to download invoice' });
    }
  };

  const trackOrder = async () => {
    if (!orderId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/marketplace/orders/${orderId}/tracking`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Tracking fetch failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Tracking Info:', result);
      // You could set this to state if needed
    } catch (error) {
      console.error('Tracking fetch failed:', error);
      setErrors({ tracking: 'Failed to get tracking information' });
    }
  };

  // Navigation functions
  const goToOrderHistory = () => {
    navigate('/order-history');
  };

  const goToMarketplace = () => {
    navigate('/marketplace');
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  // Auto-fetch order details on load
  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  // Raw data output - no UI, just JSON
  return (
    <div>
      <h1>Order Success Management System - Raw Data Interface</h1>
      
      {/* Current User */}
      <div>
        <h2>Current User</h2>
        <pre>{JSON.stringify(currentUser, null, 2)}</pre>
      </div>

      {/* Order ID */}
      <div>
        <h2>Order ID</h2>
        <pre>{JSON.stringify({ orderId }, null, 2)}</pre>
      </div>

      {/* Order Details */}
      {orderDetails && (
        <div>
          <h2>Order Details</h2>
          <pre>{JSON.stringify(orderDetails, null, 2)}</pre>
        </div>
      )}

      {/* Actions */}
      <div>
        <h2>Available Actions</h2>
        <button onClick={downloadInvoice} disabled={!orderDetails}>
          Download Invoice
        </button>
        <button onClick={trackOrder} disabled={!orderDetails}>
          Track Order
        </button>
        <button onClick={goToOrderHistory}>
          View Order History
        </button>
        <button onClick={goToMarketplace}>
          Continue Shopping
        </button>
        <button onClick={goToDashboard}>
          Go to Dashboard
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

      {/* Success Message */}
      {orderDetails && !loading && (
        <div>
          <h2>Success Information</h2>
          <pre>{JSON.stringify({
            success: true,
            message: 'Order placed successfully!',
            orderId: orderId,
            status: orderDetails.status,
            total: orderDetails.total_amount,
            estimatedDelivery: orderDetails.estimated_delivery
          }, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default FuturisticOrderSuccess;
