import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const FarmAnalytics = ({ sessionId }) => {
  const { getToken } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingAnalytics, setSavingAnalytics] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    if (sessionId) {
      fetchAnalytics();
      fetchSavedAnalytics();
    }
  }, [sessionId]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = getToken();
      const response = await axios.get(
        `http://127.0.0.1:8000/api/crop-management/analytics/${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.detail || 'Failed to fetch analytics. Please ensure harvest data is recorded.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSavedAnalytics = async () => {
    try {
      const token = getToken();
      const response = await axios.get(
        `http://127.0.0.1:8000/api/crop-management/analytics/${sessionId}/saved`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.created_at) {
        setLastSaved(new Date(response.data.created_at));
      }
    } catch (err) {
      // Ignore if no saved analytics found
      console.log('No saved analytics found');
    }
  };

  const saveAnalytics = async () => {
    try {
      setSavingAnalytics(true);
      setError(null);
      
      const token = getToken();
      const response = await axios.post(
        `http://127.0.0.1:8000/api/crop-management/analytics/${sessionId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setLastSaved(new Date());
      // Refresh analytics data
      await fetchAnalytics();
    } catch (err) {
      console.error('Error saving analytics:', err);
      setError(err.response?.data?.detail || 'Failed to save analytics data.');
    } finally {
      setSavingAnalytics(false);
    }
  };

  const getROIColor = (roi) => {
    if (roi >= 100) return 'text-green-600 bg-green-50';
    if (roi >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getProfitColor = (profit) => {
    if (profit > 0) return 'text-green-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Farm Analytics</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Farm Analytics</h2>
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button 
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Farm Analytics</h2>
        <p className="text-gray-600">No analytics data available. Please record harvest data first.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Farm Analytics Dashboard</h2>
        <div className="flex items-center space-x-4">
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Last saved: {lastSaved.toLocaleDateString()} {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={saveAnalytics}
            disabled={savingAnalytics}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
          >
            {savingAnalytics ? 'Saving...' : 'Save Analytics'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Yield */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-600 text-sm font-medium">Total Yield</p>
              <p className="text-2xl font-bold text-emerald-800">
                {analytics.yield} {analytics.yield_unit}
              </p>
              <p className="text-sm text-emerald-600">
                {analytics.yield_per_area.toFixed(1)} {analytics.yield_unit}/area
              </p>
            </div>
            <div className="bg-emerald-200 p-3 rounded-full">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Cost */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Total Cost</p>
              <p className="text-2xl font-bold text-orange-800">
                {formatCurrency(analytics.total_cost)}
              </p>
              <p className="text-sm text-orange-600">Input expenses</p>
            </div>
            <div className="bg-orange-200 p-3 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Revenue</p>
              <p className="text-2xl font-bold text-blue-800">
                {formatCurrency(analytics.revenue)}
              </p>
              <p className="text-sm text-blue-600">Total sales</p>
            </div>
            <div className="bg-blue-200 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        {/* ROI */}
        <div className={`bg-gradient-to-br p-6 rounded-lg ${getROIColor(analytics.roi)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Return on Investment</p>
              <p className="text-2xl font-bold">
                {analytics.roi.toFixed(1)}%
              </p>
              <p className={`text-sm font-medium ${getProfitColor(analytics.profit)}`}>
                Profit: {formatCurrency(analytics.profit)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-white bg-opacity-50">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost Breakdown Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cost by Type */}
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">Cost by Input Type</h4>
            <div className="space-y-3">
              {Object.entries(analytics.cost_breakdown).map(([type, cost]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="capitalize text-gray-600">{type}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{formatCurrency(cost)}</span>
                    <span className="text-sm text-gray-500">
                      ({analytics.cost_percentage[type]?.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">Performance Metrics</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cost per {analytics.yield_unit}</span>
                <span className="font-medium">
                  {formatCurrency(analytics.total_cost / analytics.yield)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Revenue per {analytics.yield_unit}</span>
                <span className="font-medium">
                  {formatCurrency(analytics.revenue / analytics.yield)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Profit Margin</span>
                <span className={`font-medium ${getProfitColor(analytics.profit)}`}>
                  {((analytics.profit / analytics.revenue) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmAnalytics;
