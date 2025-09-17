import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Crop() {
  const auth = useAuth();
  console.log('Auth context in Crop:', auth); // Debug log
  
  // Defensive destructuring with default values
  const { currentUser, isAuthenticated } = auth || {};
  
  const [formData, setFormData] = useState({
    userId: currentUser?.id || '',
    location: currentUser?.location || '',
    soil_quality: '',
    N: '',
    P: '',
    K: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: ''
  });

  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction('');
    try {
      console.log('Form Data:', formData);      const payload = {
        ...formData,
        userId: Number(formData.userId)
      };
      
      const response = await axios.post('http://127.0.0.1:8000/predict-crop', payload);
      const prediction = response.data.crop || 'No prediction returned';
      setPrediction(prediction);
      
      // Save crop plan record for authenticated users
      if (isAuthenticated && currentUser?.email) {
        try {
          // Prepare the crop plan data
          const cropPlanData = {
            crop: prediction,
            location: formData.location,
            soil_nutrients: {
              n: formData.N,
              p: formData.P,
              k: formData.K,
              ph: formData.ph
            },
            climate: {
              temperature: formData.temperature,
              humidity: formData.humidity,
              rainfall: formData.rainfall
            }
          };
          
          // Send the crop plan data to the backend API
          await axios.post('http://127.0.0.1:8000/api/user/history/save-crop-plan-enhanced', cropPlanData, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
        } catch (error) {
          console.error("Error saving crop plan history:", error);
        }
      }
    } catch (error) {
      console.error('Prediction failed:', error);
      setPrediction('Error occurred during prediction.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            🌾 Smart Crop <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Prediction</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Get AI-powered crop recommendations based on your soil and environmental conditions
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <span className="mr-3 text-3xl">📍</span>
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User ID
                    </label>
                    <input
                      type="text"
                      name="userId"
                      value={formData.userId}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white/50"
                      placeholder="Enter your user ID"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white/50"
                      placeholder="e.g., Maharashtra, India"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soil Quality
                  </label>
                  <input
                    type="text"
                    name="soil_quality"
                    value={formData.soil_quality}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white/50"
                    placeholder="e.g., Sandy loam, Clay, Silt"
                  />
                </div>
              </div>

              {/* Soil Nutrients */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <span className="mr-3 text-3xl">🧪</span>
                  Soil Nutrients (NPK)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { key: 'N', label: 'Nitrogen (N)', unit: 'kg/ha', placeholder: 'e.g., 50' },
                    { key: 'P', label: 'Phosphorus (P)', unit: 'kg/ha', placeholder: 'e.g., 30' },
                    { key: 'K', label: 'Potassium (K)', unit: 'kg/ha', placeholder: 'e.g., 40' }
                  ].map((nutrient) => (
                    <div key={nutrient.key} className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {nutrient.label}
                        <span className="text-xs text-gray-500 ml-1">({nutrient.unit})</span>
                      </label>
                      <input
                        type="number"
                        name={nutrient.key}
                        value={formData[nutrient.key]}
                        onChange={handleChange}
                        required
                        step="0.1"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white/50"
                        placeholder={nutrient.placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Environmental Conditions */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <span className="mr-3 text-3xl">🌤️</span>
                  Environmental Conditions
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { key: 'temperature', label: 'Temperature', unit: '°C', placeholder: 'e.g., 25' },
                    { key: 'humidity', label: 'Humidity', unit: '%', placeholder: 'e.g., 65' },
                    { key: 'ph', label: 'Soil pH', unit: '', placeholder: 'e.g., 6.5' },
                    { key: 'rainfall', label: 'Annual Rainfall', unit: 'mm', placeholder: 'e.g., 1200' }
                  ].map((field) => (
                    <div key={field.key} className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                        {field.unit && <span className="text-xs text-gray-500 ml-1">({field.unit})</span>}
                      </label>
                      <input
                        type="number"
                        name={field.key}
                        value={formData[field.key]}
                        onChange={handleChange}
                        required
                        step="0.1"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white/50"
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-lg rounded-2xl hover:from-emerald-700 hover:to-green-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Analyzing Your Data...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="mr-3 text-xl">🤖</span>
                      Get AI Crop Recommendation
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Results Section */}
        {prediction && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <h3 className="text-lg font-medium">
                Recommended Crop
              </h3>
            </div>
            <div className="mt-3 text-center">
              <span className="text-2xl font-bold text-green-600">{prediction}</span>
            </div>
          </div>
        )}
      </div>
    </div>  );
}

export default Crop;
