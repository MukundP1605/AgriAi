import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';

const CropInitializationForm = () => {
  const navigate = useNavigate();
  const { isAuthenticated, getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
    crop_name: '',
    sowing_date: '',
    land_area: '',
    expected_harvest_date: '',
    status: 'active',
    location: '',
    soil_type: '',
    additional_notes: ''
  });
  
  const soilTypes = [
    { value: 'clay', label: 'Clay' },
    { value: 'sandy', label: 'Sandy' },
    { value: 'silty', label: 'Silty' },
    { value: 'peaty', label: 'Peaty' },
    { value: 'chalky', label: 'Chalky' },
    { value: 'loamy', label: 'Loamy' },
  ];
  
  const cropOptions = [
    { value: 'rice', label: 'Rice' },
    { value: 'wheat', label: 'Wheat' },
    { value: 'corn', label: 'Corn' },
    { value: 'maize', label: 'Maize' },
    { value: 'potato', label: 'Potato' },
    { value: 'tomato', label: 'Tomato' },
    { value: 'soybean', label: 'Soybean' },
    { value: 'cotton', label: 'Cotton' },
  ];
    // Make sure we convert dates to the right format for the input field
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
    const initializeCrop = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return { success: false, error: 'Authentication required' };
    }
    
    try {
      const token = getToken();
      
      // Format the data for API
      const apiData = {
        ...formData,
        // Ensure land_area is a number
        land_area: parseFloat(formData.land_area),
        // If dates are empty strings, set them to null
        sowing_date: formData.sowing_date || null,
        expected_harvest_date: formData.expected_harvest_date || null
      };
      
      // Initialize crop session
      const response = await axios.post(
        'http://127.0.0.1:8000/api/crop-management/initialize',
        apiData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.id) {
        return {
          success: true,
          sessionId: response.data.id,
          sessionData: response.data
        };
      } else {
        return {
          success: false,
          error: 'Failed to initialize crop session'
        };
      }
    } catch (err) {
      console.error('Error initializing crop session:', err);
      return {
        success: false,
        error: err.response?.data?.detail || 'Failed to initialize crop session'
      };
    }
  };
    // Format error message for display
  const formatErrorMessage = (error) => {
    if (!error) return 'An unknown error occurred';
    
    // If error is an object with message property
    if (typeof error === 'object') {
      if (error.message) return error.message;
      if (error.msg) return error.msg;
      
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
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await initializeCrop();
      
      if (result.success) {
        // Navigate to the crop management dashboard with the session ID
        navigate(`/crop-management/session/${result.sessionId}`);
      } else {
        setError(formatErrorMessage(result.error));
      }
    } catch (err) {
      console.error('Error in form submission:', err);
      setError(formatErrorMessage(err) || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6 mb-8">
      <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center">
        <span className="text-lg mr-2">🌱</span>
        Initialize Crop Tracking
      </h2>
        {error && (
        <div className="bg-red-900/30 text-red-400 border border-red-500/50 p-3 rounded-lg mb-6">
          {typeof error === 'object' ? JSON.stringify(error) : error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Crop Selection */}
          <div>
            <label htmlFor="crop_name" className="block text-sm font-medium text-cyan-300 mb-1">
              Crop Type *
            </label>
            <select
              id="crop_name"
              name="crop_name"
              required
              value={formData.crop_name}
              onChange={handleChange}
              className="w-full p-3 bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="">Select a crop</option>
              {cropOptions.map(crop => (
                <option key={crop.value} value={crop.value}>
                  {crop.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Sowing Date */}
          <div>
            <label htmlFor="sowing_date" className="block text-sm font-medium text-cyan-300 mb-1">
              Sowing Date *
            </label>
            <input              type="date"
              id="sowing_date"
              name="sowing_date"
              required
              value={formatDateForInput(formData.sowing_date)}
              onChange={handleChange}
              className="w-full p-3 bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
            {/* Land Area */}
          <div>
            <label htmlFor="land_area" className="block text-sm font-medium text-cyan-300 mb-1">
              Land Area *
            </label>
            <input
              type="number"
              id="land_area"
              name="land_area"
              required
              min="0.01"
              step="0.01"
              value={formData.land_area}
              onChange={handleChange}
              placeholder="E.g., 2.5 (in hectares)"
              className="w-full p-3 bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          
          {/* Expected Harvest Date */}
          <div>
            <label htmlFor="expected_harvest_date" className="block text-sm font-medium text-cyan-300 mb-1">
              Expected Harvest Date
            </label>
            <input              type="date"
              id="expected_harvest_date"
              name="expected_harvest_date"
              value={formatDateForInput(formData.expected_harvest_date)}
              onChange={handleChange}
              className="w-full p-3 bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          
          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-cyan-300 mb-1">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="E.g., North Field, Block A"
              className="w-full p-3 bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          
          {/* Soil Type */}
          <div>
            <label htmlFor="soil_type" className="block text-sm font-medium text-cyan-300 mb-1">
              Soil Type
            </label>
            <select
              id="soil_type"
              name="soil_type"
              value={formData.soil_type}
              onChange={handleChange}
              className="w-full p-3 bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="">Select soil type</option>
              {soilTypes.map(soil => (
                <option key={soil.value} value={soil.value}>
                  {soil.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Additional Notes */}
        <div>
          <label htmlFor="additional_notes" className="block text-sm font-medium text-cyan-300 mb-1">
            Additional Notes
          </label>
          <textarea
            id="additional_notes"
            name="additional_notes"
            rows="3"
            value={formData.additional_notes}
            onChange={handleChange}
            placeholder="Any additional information about this crop session..."
            className="w-full p-3 bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          ></textarea>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg shadow-lg shadow-cyan-500/20 hover:from-cyan-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Initializing...
              </span>
            ) : (
              'Initialize Crop Tracking'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CropInitializationForm;
