import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';

const CropYieldRecorder = ({ sessionId }) => {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    harvest_date: formatDateForInput(new Date()),
    quantity: '',
    unit: 'kg',
    quality_grade: 'good',
    sale_price: '',
    notes: ''
  });

  // Helper function to format date for input
  function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  }

  // Helper function to format error messages
  function formatErrorMessage(error) {
    if (!error) return 'An unknown error occurred';
    
    if (typeof error === 'object') {
      if (error.message) return error.message;
      if (error.msg) return error.msg;
      if (error.detail) return error.detail;
      
      // Handle validation errors
      if (error.type && error.loc && error.msg) {
        return `Validation error: ${error.msg}`;
      }
      
      try {
        return JSON.stringify(error);
      } catch (e) {
        return 'An error occurred';
      }
    }
    return error;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Format data for API
      const apiData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        harvest_date: formData.harvest_date || null
      };

      const token = getToken();
      const response = await axios.post(
        `http://127.0.0.1:8000/api/crop-management/harvest-record/${sessionId}`,
        apiData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setSuccess(true);
      // Reset form data or keep selected fields
      setFormData({
        ...formData,
        notes: ''  // Only reset notes, keep other values for convenience
      });
    } catch (err) {
      console.error('Error recording yield:', err);
      const errorMessage = err.response?.data?.detail || 
                           formatErrorMessage(err.response?.data) || 
                           'Failed to record yield data. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg shadow-cyan-500/5 p-6">
      <h3 className="text-lg font-medium text-cyan-400 mb-4 flex items-center">
        <span className="text-lg mr-2">📝</span>
        Yield Metrics Recorder
      </h3>
      
      {error && (
        <div className="bg-red-900/30 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-900/30 border-l-4 border-green-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-400">Yield data successfully integrated into analytics system!</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="harvest_date" className="block text-sm font-medium text-cyan-300 mb-1">
              Harvest Date
            </label>
            <input
              type="date"
              id="harvest_date"
              name="harvest_date"
              value={formData.harvest_date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-800/60 border border-gray-600 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-cyan-300 mb-1">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                className="w-full px-3 py-2 bg-gray-800/60 border border-gray-600 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-cyan-300 mb-1">
                Unit
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800/60 border border-gray-600 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="ton">Metric Tons</option>
                <option value="lb">Pounds (lb)</option>
                <option value="count">Count/Number</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quality_grade" className="block text-sm font-medium text-cyan-300 mb-1">
                Quality Rating
              </label>
              <select
                id="quality_grade"
                name="quality_grade"
                value={formData.quality_grade}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800/60 border border-gray-600 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="excellent">Premium Grade</option>
                <option value="good">Standard Grade</option>
                <option value="average">Commercial Grade</option>
                <option value="poor">Processing Grade</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="sale_price" className="block text-sm font-medium text-cyan-300 mb-1">
                Sale Price (per unit)
              </label>
              <input
                type="number"
                id="sale_price"
                name="sale_price"
                value={formData.sale_price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 bg-gray-800/60 border border-gray-600 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="Optional"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-cyan-300 mb-1">
              Analysis Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 bg-gray-800/60 border border-gray-600 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Optional data points and observations..."
            ></textarea>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full px-4 py-2 text-white font-medium rounded-lg ${
                isLoading
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/20'
              }`}
            >
              {isLoading ? 'Processing...' : 'Record Yield Metrics'}
            </button>
          </div>
        </div>
      </form>
      
      {success && (
        <div className="mt-4 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-300">
          <p className="flex items-center">
            <svg className="h-5 w-5 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Your harvest data has been recorded. You can now access analytics and reports for this crop session.
          </p>
        </div>
      )}
    </div>
  );
};

export default CropYieldRecorder;
