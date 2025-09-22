import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const CropYieldRecorder = ({ sessionId }) => {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [harvestRecords, setHarvestRecords] = useState([]);
  const [formData, setFormData] = useState({
    harvest_date: '',
    quantity: '',
    unit: 'kg',
    quality_grade: 'good',
    sale_price: '',
    notes: ''
  });

  const fetchHarvestRecords = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = getToken();
      const response = await axios.get(
        `http://127.0.0.1:8000/api/crop-management/harvest-records/${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setHarvestRecords(response.data || []);
      return true;
    } catch (err) {
      console.error('Error fetching harvest records:', err);
      // Don't set error state here as this might be a first-time use
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHarvestRecords();
  }, [sessionId]);
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

  // Helper function to format date for input
  function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
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
      
      // Refresh harvest records
      await fetchHarvestRecords();
      
      // Reset form but preserve the date for convenience
      setFormData({
        harvest_date: formData.harvest_date,
        quantity: '',
        unit: 'kg',
        quality_grade: 'good',
        sale_price: '',
        notes: ''
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getQualityGradeLabel = (grade) => {
    const gradeLabels = {
      'excellent': 'Excellent',
      'good': 'Good',
      'average': 'Average',
      'poor': 'Poor'
    };
    
    return gradeLabels[grade] || grade.charAt(0).toUpperCase() + grade.slice(1);
  };

  const getQualityGradeColor = (grade) => {
    const gradeColors = {
      'excellent': 'bg-green-100 text-green-800',
      'good': 'bg-emerald-100 text-emerald-800',
      'average': 'bg-yellow-100 text-yellow-800',
      'poor': 'bg-orange-100 text-orange-800'
    };
    
    return gradeColors[grade] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Record Harvest Yield</h3>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">Harvest yield recorded successfully!</p>
            </div>
          </div>
        </div>
      )}
      
      {harvestRecords.length > 0 ? (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Previous Records:</h4>
          <div className="space-y-3">
            {harvestRecords.map((record) => (
              <div key={record.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Harvested on {formatDate(record.harvest_date)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {record.quantity} {record.unit}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getQualityGradeColor(record.quality_grade)}`}>
                      {getQualityGradeLabel(record.quality_grade)}
                    </span>
                    {record.sale_price && (
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formatCurrency(record.sale_price)}
                      </p>
                    )}
                  </div>
                </div>
                
                {record.notes && (
                  <p className="text-xs text-gray-500 mt-2 border-t border-gray-200 pt-2">
                    {record.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 mt-4 pt-4"></div>
        </div>
      ) : null}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="harvest_date" className="block text-sm font-medium text-gray-700 mb-1">
              Harvest Date
            </label>
            <input
              type="date"
              id="harvest_date"
              name="harvest_date"
              value={formData.harvest_date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="ton">Tons</option>
                <option value="lb">Pounds (lb)</option>
                <option value="count">Count/Number</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quality_grade" className="block text-sm font-medium text-gray-700 mb-1">
                Quality
              </label>
              <select
                id="quality_grade"
                name="quality_grade"
                value={formData.quality_grade}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="average">Average</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="sale_price" className="block text-sm font-medium text-gray-700 mb-1">
                Sale Price (INR)
              </label>
              <input
                type="number"
                id="sale_price"
                name="sale_price"
                value={formData.sale_price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Optional"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Optional notes about the harvest..."
            ></textarea>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full px-4 py-2 text-white font-medium rounded-lg ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isLoading ? 'Recording...' : 'Record Harvest Yield'}
            </button>
          </div>
        </div>
      </form>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>
          <span className="font-medium">Note:</span> Recording a harvest will mark this crop session as complete. 
          You can still add additional harvest records later if needed.
        </p>
      </div>
    </div>
  );
};

export default CropYieldRecorder;
