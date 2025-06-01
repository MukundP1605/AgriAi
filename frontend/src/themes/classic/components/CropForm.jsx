import React, { useState } from 'react';
import axios from 'axios';

// 🟩 Crop Prediction Form
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex items-center">
        <span className="mr-2">🌾</span> Crop Prediction Form
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.keys(formData).map((key) => (
          <div key={key} className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {key.toUpperCase()}:
            </label>
            <input
              type={['location', 'soil_quality'].includes(key) ? 'text' : 'number'}
              name={key}
              value={formData[key]}
              onChange={handleChange}
              required
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        ))}
        <div className="pt-4">
          <button 
            type="submit" 
            className="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            Predict Crop
          </button>
        </div>
      </form>

      {predictedCrop && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <h3 className="text-lg font-medium text-green-800 dark:text-green-200 flex items-center">
            <span className="mr-2">✅</span> Predicted Crop: {predictedCrop}
          </h3>
        </div>
      )}
    </div>
  );
};

// 🟦 User Data Submission Form
const UserDataForm = () => {
  const [location, setLocation] = useState('');
  const [soilQuality, setSoilQuality] = useState('');
  const [userId, setUserId] = useState('1'); // Default user_id for now

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/save-user-data', {
        method: 'POST',
        body: JSON.stringify({
          user_id: parseInt(userId),
          location: location,
          soil_quality: soilQuality
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      alert(data.message || 'User data submitted successfully!');
    } catch (err) {
      alert('Error submitting user data');
      console.error(err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex items-center">
        <span className="mr-2">👤</span> User Data Form
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">User ID:</label>
          <input
            type="number"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Location:</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Soil Quality:</label>
          <input
            type="text"
            value={soilQuality}
            onChange={(e) => setSoilQuality(e.target.value)}
            required
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Submit User Data
          </button>
        </div>
      </form>
    </div>
  );
};

// 🔄 Export both for use elsewhere if needed
export { CropForm, UserDataForm };

// ✅ Default export of combined forms page
const AgriAIFormsPage = () => (
  <div className="container mx-auto px-4 py-8 max-w-4xl">
    <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white flex items-center justify-center">
      <span className="mr-2">🌿</span> AgriAI Forms
    </h1>
    <UserDataForm />
    <div className="my-8 border-t border-gray-200 dark:border-gray-700"></div>
    <CropForm />
  </div>
);

export default AgriAIFormsPage;
