// Raw Data Interface - Order History Management System
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';

const FuturisticOrderHistory = () => {
  const { currentUser } = useContext(AuthContext);
  
  // Core state for data processing
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'created_at'
  });

  // Core API functions
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);

      const response = await fetch(`/api/marketplace/orders?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Orders fetch failed: ${response.status}`);
      }

      const result = await response.json();
      setOrders(result.orders || []);
    } catch (error) {
      console.error('Orders fetch failed:', error);
      setErrors({ orders: 'Failed to load orders' });
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/marketplace/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Cancel order failed: ${response.status}`);
      }

      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error('Cancel order failed:', error);
      setErrors({ cancel: 'Failed to cancel order' });
    }
  };

  const downloadInvoice = async (orderId) => {
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

  // Auto-fetch orders on load and filter changes
  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  // Filter handlers
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'created_at'
    });
  };

  // Raw data output - no UI, just JSON
  return (
    <div>
      <h1>Order History Management System - Raw Data Interface</h1>
      
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
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => handleFilterChange('dateTo', e.target.value)}
        />
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
        >
          <option value="created_at">Date</option>
          <option value="total_amount">Amount</option>
          <option value="status">Status</option>
        </select>
        <button onClick={clearFilters}>Clear Filters</button>
      </div>

      {/* Orders */}
      <div>
        <h2>Orders ({orders.length} items)</h2>
        <pre>{JSON.stringify(orders, null, 2)}</pre>
        
        <h3>Order Actions</h3>
        {orders.map(order => (
          <div key={order.id}>
            <p>Order #{order.id} - Status: {order.status} - Total: ${order.total_amount}</p>
            {order.status === 'pending' && (
              <button onClick={() => cancelOrder(order.id)}>
                Cancel Order
              </button>
            )}
            <button onClick={() => downloadInvoice(order.id)}>
              Download Invoice
            </button>
          </div>
        ))}
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

export default FuturisticOrderHistory;
