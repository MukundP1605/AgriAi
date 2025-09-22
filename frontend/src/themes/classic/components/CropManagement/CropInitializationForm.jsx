import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

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
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
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
        // Navigate to the crop management dashboard with the session ID
        navigate(`/crop-management/session/${response.data.id}`);
      }
    } catch (err) {
      console.error('Error initializing crop session:', err);
      setError(formatErrorMessage(err.response?.data?.detail) || 'Failed to initialize crop session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Start New Crop Session</h2>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6">
          {typeof error === 'object' ? JSON.stringify(error) : error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Crop Selection */}
          <div>
            <label htmlFor="crop_name" className="block text-sm font-medium text-gray-700 mb-1">
              Crop Type *
            </label>
            <select
              id="crop_name"
              name="crop_name"
              required
              value={formData.crop_name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
            <label htmlFor="sowing_date" className="block text-sm font-medium text-gray-700 mb-1">
              Sowing Date *
            </label>
            <input
              type="date"
              id="sowing_date"
              name="sowing_date"
              required
              value={formatDateForInput(formData.sowing_date)}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          {/* Land Area */}
          <div>
            <label htmlFor="land_area" className="block text-sm font-medium text-gray-700 mb-1">
              Land Area (in hectares) *
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
              placeholder="E.g., 2.5"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          {/* Expected Harvest Date */}
          <div>
            <label htmlFor="expected_harvest_date" className="block text-sm font-medium text-gray-700 mb-1">
              Expected Harvest Date
            </label>
            <input
              type="date"
              id="expected_harvest_date"
              name="expected_harvest_date"
              value={formatDateForInput(formData.expected_harvest_date)}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="E.g., North Field, Block A"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          {/* Soil Type */}
          <div>
            <label htmlFor="soil_type" className="block text-sm font-medium text-gray-700 mb-1">
              Soil Type
            </label>
            <select
              id="soil_type"
              name="soil_type"
              value={formData.soil_type}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
          <label htmlFor="additional_notes" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            id="additional_notes"
            name="additional_notes"
            rows="3"
            value={formData.additional_notes || ''}
            onChange={handleChange}
            placeholder="Any additional information about this crop session..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          ></textarea>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Initializing...' : 'Start Crop Session'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CropInitializationForm;
