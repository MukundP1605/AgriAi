import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/marketplace/orders/${orderId}?user_id=${user.id}`);
        setOrder(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details. Please check your order history.');
      } finally {
        setLoading(false);
      }
    };

    if (user && orderId) {
      fetchOrder();
    }
  }, [orderId, user]);

  if (loading) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
        <Link to="/marketplace" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-16 px-4 max-w-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full text-green-600 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-green-700 mb-2">Order Successful!</h1>
        <p className="text-gray-600">Thank you for your purchase.</p>
      </div>

      {order && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Order #{order.id}</h2>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm capitalize">
              {order.status}
            </span>
          </div>

          <div className="border-t border-b border-gray-200 py-4 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Date</span>
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
            </div>            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-semibold">${Number(order.total_amount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Payment Method</span>
              <span className="capitalize">{order.payment_method.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping Address</span>
              <span className="text-right">{order.shipping_address}</span>
            </div>
          </div>

          <h3 className="font-semibold mb-3">Order Items</h3>
          <div className="space-y-3 mb-6">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">${(Number(item.price_at_purchase || 0) * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Questions about your order?</p>
              <Link to="/about" className="text-green-600 hover:underline text-sm">Contact Support</Link>
            </div>
            <Link to="/marketplace" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSuccess;
