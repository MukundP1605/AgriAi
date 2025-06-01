import React, { useState } from 'react';
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import { useAuth } from '../../../context/AuthContext';

const Disease = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const auth = useAuth();
  const { currentUser, isAuthenticated } = auth || {};

  const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png'];
  const MAX_SIZE = 5 * 1024 * 1024;
  
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      alert('Invalid file type. Only JPG, JPEG, PNG are allowed.');
      setSelectedImage(null);
      setPreview(null);
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      alert('File is too large. Maximum allowed size is 5MB.');
      setSelectedImage(null);
      setPreview(null);
      return;
    }

    try {
      // For smaller images, use them directly without compression
      if (file.size <= 1 * 1024 * 1024) { // If less than 1MB
        setSelectedImage(file);
        setPreview(URL.createObjectURL(file));
      } else {
        // Image compression options
        const options = {
          maxSizeMB: 1,  // Max size of 1MB after compression
          maxWidthOrHeight: 500,  // Max width or height of 500px
          useWebWorker: true,  // Use Web Worker for compression
          fileType: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}` // Preserve file type
        };
        
        console.log("Compressing image...");
        const compressedFile = await imageCompression(file, options);
        console.log("Original file:", file);
        console.log("Compressed file:", compressedFile);
        
        // Create a new File object with the correct extension
        const finalFile = new File([compressedFile], file.name, {
          type: compressedFile.type,
          lastModified: Date.now(),
        });
        
        setSelectedImage(finalFile);
        setPreview(URL.createObjectURL(finalFile));
      }
    } catch (error) {
      console.error('Error compressing image:', error);
      alert('Error processing image. Please try a different image.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedImage) {
      alert('Please select an image first.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedImage);

      // Set headers
      const headers = {
        'Content-Type': 'multipart/form-data',
      };

      if (isAuthenticated) {
        headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
      }

      console.log("Sending image for analysis...");
      const response = await axios.post('http://127.0.0.1:8000/predict-disease', formData, {
        headers: headers
      });      
      
      console.log("Response:", response.data);
      setResult(response.data);
      
      // Save scan record for authenticated users
      if (isAuthenticated && currentUser?.email) {
        try {
          // Record the scan in the backend
          const scanData = {
            result: response.data.predicted_class || "Unknown",
            confidence: response.data.confidence || 0,
            image_name: selectedImage.name
          };
          
          // Send the scan data to the backend
          await axios.post('http://127.0.0.1:8000/api/user/history/save-scan-enhanced', scanData, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
        } catch (error) {
          console.error("Error saving scan history:", error);
        }
      }
    } catch (error) {
      console.error("Error during prediction:", error);
      setResult({ 
        error: "Failed to analyze image. Please try again or use a different image." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>🔬 Plant Disease Detection</h1>
      <p>Upload a photo of your plant to get instant AI-powered disease identification and treatment recommendations</p>

      <div>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <div style={{ 
                border: '2px dashed #ccc', 
                padding: '40px', 
                textAlign: 'center',
                cursor: 'pointer' 
              }}>
                {preview ? (
                  <img 
                    src={preview} 
                    alt="Preview" 
                    style={{ maxWidth: '300px', maxHeight: '300px' }}
                  />
                ) : (
                  <div>
                    <p>📸 Click to upload plant image</p>
                    <p>Supports: JPG, JPEG, PNG (Max: 5MB)</p>
                  </div>
                )}
              </div>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={!selectedImage || loading}
            style={{ 
              marginTop: '20px', 
              padding: '10px 20px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px'
            }}
          >
            {loading ? 'Analyzing...' : 'Analyze Plant'}
          </button>
        </form>

        {result && (
          <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd' }}>
            <h2>Analysis Results</h2>
            {result.error ? (
              <p style={{ color: 'red' }}>{result.error}</p>
            ) : (
              <div>
                <p><strong>Disease:</strong> {result.predicted_class}</p>
                <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%</p>
                {result.description && (
                  <div>
                    <h3>Description:</h3>
                    <p>{result.description}</p>
                  </div>
                )}
                {result.treatment && (
                  <div>
                    <h3>Treatment:</h3>
                    <p>{result.treatment}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Disease;
