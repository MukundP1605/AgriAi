import React, { useState } from 'react';
import axios from 'axios';

function Crop() {
  const [formData, setFormData] = useState({
    userId: '',
    location: '',
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

      // If your backend expects userId as int, convert here:
      const payload = {
        ...formData,
        userId: Number(formData.userId)
      };

      const response = await axios.post('http://127.0.0.1:8000/predict-crop', payload);
      // Fix here: use response.data.crop instead of .prediction
      setPrediction(response.data.crop || 'No prediction returned');
    } catch (error) {
      console.error('Prediction failed:', error);
      setPrediction('Error occurred during prediction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crop-container" style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Crop Prediction</h2>
      <form onSubmit={handleSubmit} className="crop-form">
        <div className="form-row">
          <label>User ID</label>
          <input
            type="text"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label>Soil Quality</label>
          <input
            type="text"
            name="soil_quality"
            value={formData.soil_quality}
            onChange={handleChange}
            required
          />
        </div>

        {['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'].map((field) => (
          <div className="form-row" key={field}>
            <label>{field.toUpperCase()}</label>
            <input
              type="number"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              required
            />
          </div>
        ))}

        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing Data...' : 'Get Crop Recommendation'}
        </button>
      </form>

      {prediction && (
        <div
          className="result-box"
          style={{
            marginTop: 20,
            padding: 15,
            border: '1px solid green',
            borderRadius: 5,
            backgroundColor: '#e6ffe6'
          }}
        >
          <h3>Recommended Crop</h3>
          <p>{prediction}</p>
        </div>
      )}
    </div>
  );
}

export default Crop;
