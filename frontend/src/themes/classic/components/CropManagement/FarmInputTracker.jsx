import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const FarmInputTracker = ({ sessionId }) => {
  const { getToken } = useAuth();
  const [inputs, setInputs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    type: 'fertilizer',
    name: '',
    quantity: '',
    unit: 'kg',
    application_date: '',
    cost: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [filterType, setFilterType] = useState('all');

  const fetchInputs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = getToken();
      const response = await axios.get(
        `http://127.0.0.1:8000/api/crop-management/farm-inputs/${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setInputs(response.data);
      
      // Calculate total cost
      const total = response.data.reduce((sum, input) => sum + input.cost, 0);
      setTotalCost(total);
      
      return true;
    } catch (err) {
      console.error('Error fetching farm inputs:', err);
      setError(err.response?.data?.detail || 'Failed to fetch farm inputs. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInputs();
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
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Format data for API
      const apiData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        cost: parseFloat(formData.cost),
        application_date: formData.application_date || null
      };

      const token = getToken();
      await axios.post(
        `http://127.0.0.1:8000/api/crop-management/farm-inputs/${sessionId}`,
        apiData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setSuccess(true);
      setFormData({
        type: 'fertilizer',
        name: '',
        quantity: '',
        unit: 'kg',
        application_date: formatDateForInput(new Date()), // Keep today's date for convenience
        cost: '',
        notes: ''
      });
      
      // Refresh the inputs list
      await fetchInputs();
        // Close the modal
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
      }, 1500);
      
    } catch (err) {
      console.error('Error adding farm input:', err);
      const errorMessage = err.response?.data?.detail || 
                          formatErrorMessage(err.response?.data) || 
                          'Failed to add farm input. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputTypeLabel = (type) => {
    const typeLabels = {
      'fertilizer': 'Fertilizer',
      'irrigation': 'Irrigation',
      'pesticide': 'Pesticide',
      'labor': 'Labor',
      'seed': 'Seed',
      'other': 'Other'
    };
    
    return typeLabels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getInputTypeIcon = (type) => {
    const typeIcons = {
      'fertilizer': '🧪',
      'irrigation': '💧',
      'pesticide': '🐛',
      'labor': '👨‍🌾',
      'seed': '🌱',
      'other': '📦'
    };
    
    return typeIcons[type] || '📝';
  };

  const getInputTypeColor = (type) => {
    const typeColors = {
      'fertilizer': 'bg-green-100 text-green-800 border-green-200',
      'irrigation': 'bg-blue-100 text-blue-800 border-blue-200',
      'pesticide': 'bg-orange-100 text-orange-800 border-orange-200',
      'labor': 'bg-purple-100 text-purple-800 border-purple-200',
      'seed': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'other': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return typeColors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
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

  const filteredInputs = filterType === 'all'
    ? inputs
    : inputs.filter(input => input.type === filterType);

  if (isLoading && inputs.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Farm Input Tracker</h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
        >
          + Add New Input
        </button>
      </div>

      {error && !isSubmitting && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
          <h3 className="text-sm font-medium text-emerald-800 mb-1">Total Cost</h3>
          <p className="text-2xl font-bold text-emerald-700">
            {formatCurrency(totalCost)}
          </p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h3 className="text-sm font-medium text-blue-800 mb-1">Total Inputs</h3>
          <p className="text-2xl font-bold text-blue-700">
            {inputs.length}
          </p>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
          <h3 className="text-sm font-medium text-indigo-800 mb-1">Fertilizer Inputs</h3>
          <p className="text-2xl font-bold text-indigo-700">
            {inputs.filter(input => input.type === 'fertilizer').length}
          </p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <h3 className="text-sm font-medium text-purple-800 mb-1">Irrigation Inputs</h3>
          <p className="text-2xl font-bold text-purple-700">
            {inputs.filter(input => input.type === 'irrigation').length}
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filterType === 'all'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        
        <button
          onClick={() => setFilterType('fertilizer')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filterType === 'fertilizer'
              ? 'bg-green-600 text-white'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          Fertilizer
        </button>
        
        <button
          onClick={() => setFilterType('irrigation')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filterType === 'irrigation'
              ? 'bg-blue-600 text-white'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          Irrigation
        </button>
        
        <button
          onClick={() => setFilterType('pesticide')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filterType === 'pesticide'
              ? 'bg-orange-600 text-white'
              : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
          }`}
        >
          Pesticide
        </button>
        
        <button
          onClick={() => setFilterType('labor')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filterType === 'labor'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          }`}
        >
          Labor
        </button>
        
        <button
          onClick={() => setFilterType('seed')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filterType === 'seed'
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
          }`}
        >
          Seed
        </button>
        
        <button
          onClick={() => setFilterType('other')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filterType === 'other'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Other
        </button>
      </div>

      {/* Farm Inputs List */}
      {filteredInputs.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="text-3xl mb-3">🧰</div>
          <h3 className="text-lg font-medium text-blue-800 mb-2">No Inputs Recorded</h3>
          <p className="text-blue-600">
            You haven't recorded any farm inputs yet. Add your first input by clicking the button above.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInputs.map((input) => (
            <div 
              key={input.id} 
              className={`border rounded-lg p-5 ${getInputTypeColor(input.type)}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <span className="mr-2">{getInputTypeIcon(input.type)}</span>
                    {input.name}
                  </h3>
                  <div className="flex items-center mb-3">
                    <span className="text-sm bg-white bg-opacity-50 px-2 py-0.5 rounded-full mr-2">
                      {getInputTypeLabel(input.type)}
                    </span>
                    <span className="text-sm text-gray-600">
                      Applied on {formatDate(input.application_date)}
                    </span>
                  </div>
                </div>
                <span className="font-bold">
                  {formatCurrency(input.cost)}
                </span>
              </div>
              
              <div className="mt-2 flex items-center text-sm">
                <span className="font-medium mr-1">Quantity:</span>
                <span>{input.quantity} {input.unit}</span>
              </div>
              
              {input.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-700">{input.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Input Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Add Farm Input
                    </h3>
                    <div className="mt-4">
                      {error && isSubmitting && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
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
                        <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-green-700">Input added successfully!</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                              Input Type
                            </label>
                            <select
                              id="type"
                              name="type"
                              value={formData.type}
                              onChange={handleChange}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                            >
                              <option value="fertilizer">Fertilizer</option>
                              <option value="irrigation">Irrigation</option>
                              <option value="pesticide">Pesticide</option>
                              <option value="labor">Labor</option>
                              <option value="seed">Seed</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                              Name/Description
                            </label>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                              placeholder={formData.type === 'fertilizer' ? 'e.g., NPK 15-15-15' : 
                                         formData.type === 'irrigation' ? 'e.g., Drip Irrigation' :
                                         formData.type === 'pesticide' ? 'e.g., Insecticide Spray' :
                                         formData.type === 'labor' ? 'e.g., Weeding' :
                                         formData.type === 'seed' ? 'e.g., Hybrid Seed' : 'e.g., Mulching Material'}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                                Unit
                              </label>
                              <input
                                type="text"
                                id="unit"
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                required
                                placeholder="kg, L, hours, etc."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="application_date" className="block text-sm font-medium text-gray-700 mb-1">
                                Application Date
                              </label>
                              <input
                                type="date"
                                id="application_date"
                                name="application_date"
                                value={formData.application_date}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                                Cost (INR)
                              </label>
                              <input
                                type="number"
                                id="cost"
                                name="cost"
                                value={formData.cost}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
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
                              rows="2"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder="Optional notes about the input..."
                            ></textarea>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
                    isSubmitting ? 'bg-gray-300 text-gray-500' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  } text-base font-medium focus:outline-none sm:ml-3 sm:w-auto sm:text-sm`}
                >
                  {isSubmitting ? 'Adding...' : 'Add Input'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmInputTracker;
