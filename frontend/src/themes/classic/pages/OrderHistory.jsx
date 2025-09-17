import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      navigate('/login?redirect=order-history');
      return;
    }
      const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/marketplace/orders?user_id=${currentUser.id}`);
        // Ensure response.data is an array
        const ordersData = Array.isArray(response.data) ? response.data : [];
        setOrders(ordersData);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your order history. Please try again later.');
        setOrders([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, currentUser, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }
  if (!Array.isArray(orders) || orders.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold text-green-700 mb-4">Order History</h1>
        <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
        <Link to="/marketplace" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-green-700 mb-6 text-center">Order History</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-5 bg-gray-50 p-4 border-b border-gray-200 font-semibold">
          <div className="col-span-1">Order #</div>
          <div className="col-span-1">Date</div>
          <div className="col-span-1">Total</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Actions</div>
        </div>
          {Array.isArray(orders) && orders.map((order) => (
          <div key={order.id} className="grid grid-cols-5 p-4 border-b border-gray-200 items-center">
            <div className="col-span-1 font-medium">#{order.id}</div>
            <div className="col-span-1">{new Date(order.created_at).toLocaleDateString()}</div>
            <div className="col-span-1">${Number(order.total_amount || 0).toFixed(2)}</div>
            <div className="col-span-1">
              <span className={`px-2 py-1 rounded-full text-xs ${
                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <div className="col-span-1">
              <Link 
                to={`/order-success/${order.id}`} 
                className="text-green-600 hover:underline"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-6">
        <Link to="/marketplace" className="text-green-600 hover:underline">
          Back to Marketplace
        </Link>
      </div>
    </div>
  );
};

export default OrderHistory;
