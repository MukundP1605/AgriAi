import React, { useState } from 'react';
import axios from 'axios';

const CropForm = () => {
  const [formData, setFormData] = useState({
    N: '',
    P: '',
    K: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: '',
    location: '',
    soil_quality: ''
  });

  const [predictedCrop, setPredictedCrop] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8000/predict-crop', formData);
      setPredictedCrop(response.data.crop);
    } catch (error) {
      console.error('Prediction failed:', error);
      alert('Prediction failed: ' + (error.response?.data?.detail || error.message));
    }
  };

  return (
    <div>
      <h2>🌾 Crop Prediction Form</h2>
      <form onSubmit={handleSubmit}>
        {Object.keys(formData).map((key) => (
          <div key={key}>
            <label>
              {key.toUpperCase()}:
            </label>
            <input
              type={['location', 'soil_quality'].includes(key) ? 'text' : 'number'}
              name={key}
              value={formData[key]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
        <div>
          <button type="submit">
            Predict Crop
          </button>
        </div>
      </form>
      
      {predictedCrop && (
        <div>
          <h3>🌱 Prediction Result</h3>
          <p>Recommended Crop: <strong>{predictedCrop}</strong></p>
        </div>
      )}
    </div>
  );
};

export default CropForm;
