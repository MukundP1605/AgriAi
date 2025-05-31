import React, { useState } from 'react';
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import { useAuth } from '../context/AuthContext';

const DiseaseUpload = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { currentUser, isAuthenticated } = useAuth();

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
      // For smaller images, we can use them directly without compression
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
        const newFile = new File(
          [compressedFile], 
          file.name, // Keep original filename
          { type: compressedFile.type }
        );
        
        setSelectedImage(newFile);
        setPreview(URL.createObjectURL(newFile));
      }
    } catch (error) {
      console.error("Error processing image:", error);
      alert('Error processing image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      alert('Please select an image first.');
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedImage);
      
      // Get the auth token if user is authenticated
      const headers = {
        'Content-Type': 'multipart/form-data'
      };
      
      if (isAuthenticated) {
        const token = localStorage.getItem('token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      
      console.log("Sending image for analysis...");
      const response = await axios.post('http://127.0.0.1:8000/predict-disease', formData, {
        headers: headers
      });      
      console.log("Response:", response.data);
      setResult(response.data);
      
      // Save scan record for authenticated users
      if (isAuthenticated && currentUser?.email) {
        try {          // Record the scan in the backend
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            🔬 Plant Disease <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Detection</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Upload a photo of your plant to get instant AI-powered disease identification and treatment recommendations
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-8 md:p-12">
            {/* Upload Section */}            <div className="mb-8">
              <label className="group relative block">
                <div className="border-2 border-dashed border-gray-300 group-hover:border-blue-400 transition-colors duration-300 rounded-2xl p-12 text-center cursor-pointer bg-gradient-to-br from-blue-50/50 to-cyan-50/50 group-hover:from-blue-100/50 group-hover:to-cyan-100/50">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Upload Plant Image
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Drag and drop your image here, or click to browse
                      </p>
                      <p className="text-sm text-gray-400">
                        Supports: JPG, JPEG, PNG (Max 5MB)
                      </p>
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>
            </div>
              {preview && (
              <div className="mb-8">
                <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
                  <img
                    src={preview}
                    alt="Plant Preview"
                    className="w-full h-80 object-cover rounded-xl shadow-lg"
                  />
                  <button 
                    onClick={() => {
                      setPreview(null);
                      setSelectedImage(null);
                      setResult(null);
                    }}
                    className="absolute top-6 right-6 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !selectedImage}
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing Image...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>🔬</span>
                  <span>Detect Disease</span>
                </div>
              )}
            </button>            {result && !result.error && (
              <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white text-xl">✅</span>
                  </div>
                  <h3 className="text-2xl font-bold text-green-800">
                    Analysis Complete
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-green-100">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Disease Detected:</span>
                      <span className="text-green-800 font-bold text-lg">{result.predicted_class}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-green-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-700">Confidence Level:</span>
                      <span className="text-green-800 font-bold">{result.confidence.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${result.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-green-100">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="mr-2">💊</span>
                      Treatment Recommendation:
                    </h4>
                    <p className="text-gray-600 leading-relaxed bg-white p-4 rounded-lg border border-green-50">
                      {result.treatment}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {result?.error && (
              <div className="mt-8 p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-200 shadow-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-800 mb-1">Analysis Failed</h3>
                    <p className="text-red-600">{result.error}</p>
                  </div>
                </div>              </div>
            )}          </div>        </div>
      </div>
    </div>
  );
};

export default DiseaseUpload;
