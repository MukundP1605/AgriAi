import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

function Crop() {
  const auth = useAuth();
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
      console.log('Form Data:', formData);
      const payload = {
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
            },
            soil_quality: formData.soil_quality
          };
          
          // Send the crop plan data to the backend
          await axios.post('http://127.0.0.1:8000/api/user/history/save-crop-plan-enhanced', cropPlanData, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
        } catch (error) {
          console.error("Error saving crop plan history:", error);
        }
      }
    } catch (error) {
      console.error('Crop prediction failed:', error);
      alert('Prediction failed: ' + (error.response?.data?.detail || error.message));
    }
    setLoading(false);
  };

  return (
    <div>
      <h1>🌾 Crop Prediction</h1>
      <p>Get AI-powered crop recommendations based on your soil and climate conditions.</p>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Location:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter your location"
            required
          />
        </div>

        <div>
          <label>Soil Quality:</label>
          <select name="soil_quality" value={formData.soil_quality} onChange={handleChange} required>
            <option value="">Select soil quality</option>
            <option value="poor">Poor</option>
            <option value="average">Average</option>
            <option value="good">Good</option>
            <option value="excellent">Excellent</option>
          </select>
        </div>

        <div>
          <label>Nitrogen (N):</label>
          <input
            type="number"
            name="N"
            value={formData.N}
            onChange={handleChange}
            placeholder="Nitrogen content in soil"
            required
          />
        </div>

        <div>
          <label>Phosphorus (P):</label>
          <input
            type="number"
            name="P"
            value={formData.P}
            onChange={handleChange}
            placeholder="Phosphorus content in soil"
            required
          />
        </div>

        <div>
          <label>Potassium (K):</label>
          <input
            type="number"
            name="K"
            value={formData.K}
            onChange={handleChange}
            placeholder="Potassium content in soil"
            required
          />
        </div>

        <div>
          <label>Temperature (°C):</label>
          <input
            type="number"
            name="temperature"
            value={formData.temperature}
            onChange={handleChange}
            placeholder="Average temperature"
            required
          />
        </div>

        <div>
          <label>Humidity (%):</label>
          <input
            type="number"
            name="humidity"
            value={formData.humidity}
            onChange={handleChange}
            placeholder="Humidity percentage"
            required
          />
        </div>

        <div>
          <label>pH Level:</label>
          <input
            type="number"
            step="0.1"
            name="ph"
            value={formData.ph}
            onChange={handleChange}
            placeholder="Soil pH level"
            required
          />
        </div>

        <div>
          <label>Rainfall (mm):</label>
          <input
            type="number"
            name="rainfall"
            value={formData.rainfall}
            onChange={handleChange}
            placeholder="Annual rainfall"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Predicting...' : 'Get Crop Recommendation'}
        </button>
      </form>

      {prediction && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd' }}>
          <h2>Recommended Crop:</h2>
          <p><strong>{prediction}</strong></p>
        </div>
      )}
    </div>
  );
}

export default Crop;
