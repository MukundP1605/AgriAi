import React, { useState, useEffect } from 'react';
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../../../context/WeatherContext';

const DiseaseUpload = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weatherRiskAssessment, setWeatherRiskAssessment] = useState(null);
  
  const auth = useAuth();
  const { getCurrentWeather, weatherData, getAgriculturalInsights } = useWeather();
  console.log('Auth context in Disease:', auth); // Debug log
  
  // Defensive destructuring with default values
  const { currentUser, isAuthenticated } = auth || {};

  // Generate weather-based disease risk assessment
  useEffect(() => {
    if (weatherData) {
      const currentWeather = getCurrentWeather();
      const insights = getAgriculturalInsights();
      
      if (currentWeather) {
        const temperature = parseInt(currentWeather.temperature.replace('°C', ''));
        const humidity = parseInt(currentWeather.humidity.replace('%', ''));
        
        let riskLevel = 'low';
        let riskFactors = [];
        
        // High humidity increases fungal disease risk
        if (humidity > 80) {
          riskLevel = 'high';
          riskFactors.push('High humidity (>80%) promotes fungal growth');
        } else if (humidity > 60) {
          riskLevel = 'medium';
          riskFactors.push('Moderate humidity may support some fungal diseases');
        }
        
        // Temperature effects
        if (temperature > 30) {
          riskFactors.push('High temperature stress may weaken plant immunity');
        } else if (temperature < 10) {
          riskFactors.push('Low temperatures may slow plant recovery');
        }
        
        // Include relevant weather insights
        const diseaseInsights = insights.filter(insight =>
          insight.category === 'risk_management' || 
          insight.category === 'humidity' ||
          insight.category === 'temperature'
        );
        
        setWeatherRiskAssessment({
          riskLevel,
          riskFactors,
          currentConditions: {
            temperature: currentWeather.temperature,
            humidity: currentWeather.humidity,
            description: currentWeather.description
          },
          insights: diseaseInsights
        });
      }
    }
  }, [weatherData, getCurrentWeather, getAgriculturalInsights]);

  // Constants for file validation
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Invalid file type. Only JPG, JPEG, PNG are allowed.');
      e.target.value = ''; // Clear the input
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      alert('File is too large. Maximum allowed size is 5MB.');
      e.target.value = ''; // Clear the input
      return;
    }

    try {
      // Compress image if needed
      if (file.size <= 1 * 1024 * 1024) { // If less than 1MB
        setSelectedImage(file);
        setPreview(URL.createObjectURL(file));
      } else {
        // Compress the image
        const options = {
          maxSizeMB: 1,  // Max size of 1MB after compression
          maxWidthOrHeight: 1920,  // Max width or height
          useWebWorker: true,
          fileType: 'image/jpeg'
        };
        
        try {
          const compressedFile = await imageCompression(file, options);
          
          // Create a new File object with the original name
          const newFile = new File(
            [compressedFile], 
            file.name.replace(/\.[^/.]+$/, '.jpg'), // Change extension to jpg
            { type: compressedFile.type }
          );
          
          setSelectedImage(newFile);
          setPreview(URL.createObjectURL(newFile));
        } catch (compressionError) {
          console.error('Compression failed:', compressionError);
          alert('Failed to compress image. Please try a smaller file.');
        }
      }
    } catch (error) {
      console.error("Error processing image:", error);
      alert('Failed to process image. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      alert('Please select an image first');
      return;
    }

    setLoading(true);
    setResult(null);
    
    const formData = new FormData();
    formData.append('file', selectedImage);

    // Add weather context if available
    if (weatherRiskAssessment) {
      formData.append('weather_context', JSON.stringify({
        temperature: weatherRiskAssessment.currentConditions.temperature,
        humidity: weatherRiskAssessment.currentConditions.humidity,
        riskLevel: weatherRiskAssessment.riskLevel
      }));
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/predict-disease', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const predictionResult = response.data;
      setResult(predictionResult);

      // Save disease analysis record for authenticated users
      if (isAuthenticated && currentUser?.email) {
        try {
          const diseaseHistoryData = {
            result: predictionResult.predicted_class || predictionResult.disease || predictionResult.class || 'Unknown',
            confidence: predictionResult.confidence || 0,
            image_name: selectedImage.name,
            treatment_recommendation: predictionResult.treatment,
            weather_conditions: weatherRiskAssessment ? {
              temperature: weatherRiskAssessment.currentConditions.temperature,
              humidity: weatherRiskAssessment.currentConditions.humidity,
              risk_level: weatherRiskAssessment.riskLevel
            } : null
          };

          await axios.post('http://127.0.0.1:8000/api/user/history/save-scan-enhanced', diseaseHistoryData, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
        } catch (error) {
          console.error("Error saving disease analysis history:", error);
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        setResult({ 
          error: error.response.data.detail || 'Server error occurred',
          status: error.response.status 
        });
      } else if (error.request) {
        setResult({ 
          error: 'No response from server. Please check if the backend is running.',
          status: 'Connection Error' 
        });
      } else {
        setResult({ 
          error: 'Request failed: ' + error.message,
          status: 'Request Error' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setPreview(null);
    setResult(null);
    // Clear the file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
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
            Upload an image of your plant leaf to detect diseases using advanced AI technology
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Upload Section */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <span className="mr-3 text-3xl">📸</span>
                  Upload Plant Image
                </h3>
                
                <div className="border-2 border-dashed border-blue-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors bg-blue-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="imageInput"
                  />
                  <label
                    htmlFor="imageInput"
                    className="cursor-pointer flex flex-col items-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📁</span>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports: JPG, JPEG, PNG (Max: 5MB)
                      </p>
                    </div>
                  </label>
                </div>

                {/* Image Preview */}
                {preview && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Image Preview:</h4>
                    <div className="flex justify-center">
                      <div className="relative">
                        <img
                          src={preview}
                          alt="Preview"
                          className="max-w-md max-h-64 object-contain rounded-xl shadow-lg"
                        />
                        <button
                          type="button"
                          onClick={resetForm}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={!selectedImage || loading}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-lg rounded-2xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Analyzing Image...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="mr-3 text-xl">🤖</span>
                      Detect Disease
                    </div>
                  )}
                </button>

                {selectedImage && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-4 bg-gray-500 text-white font-medium rounded-2xl hover:bg-gray-600 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>

            {/* Results Section */}
            {result && (
              <div className="mt-8 p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="mr-3 text-2xl">📊</span>
                  Analysis Results
                </h3>
                
                {result.error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium">Error: {result.error}</p>
                    {result.status && <p className="text-red-600 text-sm">Status: {result.status}</p>}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Debug Information (remove in production) */}
                    {import.meta.env.DEV && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs">
                        <h5 className="font-medium text-gray-700 mb-2">Debug - API Response:</h5>
                        <pre className="text-gray-600 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-2">Detected Disease:</h4>
                        <p className="text-lg text-blue-600 font-medium">
                          {result.predicted_class || result.disease || result.class || 'Unknown'}
                        </p>
                      </div>
                      
                      {result.confidence && (
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold text-gray-800 mb-2">Confidence:</h4>
                          <p className="text-lg text-green-600 font-medium">
                            {(() => {
                              const confidence = parseFloat(result.confidence);
                              // If confidence is already a percentage (>1), display as is
                              // If confidence is a decimal (<=1), multiply by 100
                              const displayValue = confidence > 1 ? confidence : confidence * 100;
                              // Cap at 100% maximum
                              const cappedValue = Math.min(displayValue, 100);
                              return cappedValue.toFixed(1);
                            })()}%
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Detailed Treatment Information */}
                    {result.treatment && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm">
                        <h4 className="font-bold text-green-800 mb-4 flex items-center text-xl">
                          <span className="mr-3 text-2xl">🌿</span>
                          Treatment & Management Plan
                        </h4>
                        
                        <div className="space-y-4">
                          {/* Primary Treatment */}
                          <div className="bg-white rounded-lg p-4 border border-green-100">
                            <h5 className="font-semibold text-green-700 mb-2 flex items-center">
                              <span className="mr-2">💊</span>
                              Primary Treatment:
                            </h5>
                            <p className="text-green-800 leading-relaxed">{result.treatment}</p>
                          </div>

                          {/* Additional Treatment Details Based on Disease */}
                          {result.predicted_class && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Prevention Measures */}
                              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                <h5 className="font-semibold text-blue-700 mb-2 flex items-center">
                                  <span className="mr-2">🛡️</span>
                                  Prevention:
                                </h5>
                                <ul className="text-blue-800 text-sm space-y-1">
                                  {result.predicted_class.includes('Bacterial') && (
                                    <>
                                      <li>• Avoid overhead watering</li>
                                      <li>• Improve air circulation</li>
                                      <li>• Remove infected plant debris</li>
                                      <li>• Disinfect tools between plants</li>
                                    </>
                                  )}
                                  {result.predicted_class.includes('blight') && (
                                    <>
                                      <li>• Rotate crops annually</li>
                                      <li>• Avoid working with wet plants</li>
                                      <li>• Use disease-resistant varieties</li>
                                      <li>• Mulch to prevent soil splash</li>
                                    </>
                                  )}
                                  {result.predicted_class.includes('virus') && (
                                    <>
                                      <li>• Control insect vectors</li>
                                      <li>• Use virus-free seeds</li>
                                      <li>• Remove infected plants promptly</li>
                                      <li>• Avoid mechanical transmission</li>
                                    </>
                                  )}
                                  {result.predicted_class.includes('mite') && (
                                    <>
                                      <li>• Maintain proper humidity</li>
                                      <li>• Regular monitoring required</li>
                                      <li>• Avoid over-fertilization</li>
                                      <li>• Encourage beneficial insects</li>
                                    </>
                                  )}
                                  {result.predicted_class === 'healthy' && (
                                    <>
                                      <li>• Continue current care routine</li>
                                      <li>• Monitor for early symptoms</li>
                                      <li>• Maintain plant nutrition</li>
                                      <li>• Ensure proper watering</li>
                                    </>
                                  )}
                                </ul>
                              </div>

                              {/* Application Instructions */}
                              <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                                <h5 className="font-semibold text-amber-700 mb-2 flex items-center">
                                  <span className="mr-2">📋</span>
                                  Application Guide:
                                </h5>
                                <ul className="text-amber-800 text-sm space-y-1">
                                  {result.predicted_class.includes('Bacterial') && (
                                    <>
                                      <li>• Apply copper fungicide early morning</li>
                                      <li>• Spray every 7-10 days</li>
                                      <li>• Ensure complete leaf coverage</li>
                                      <li>• Stop 1 week before harvest</li>
                                    </>
                                  )}
                                  {result.predicted_class.includes('blight') && (
                                    <>
                                      <li>• Start treatment at first symptoms</li>
                                      <li>• Apply every 7-14 days</li>
                                      <li>• Spray in calm weather conditions</li>
                                      <li>• Cover both leaf surfaces</li>
                                    </>
                                  )}
                                  {result.predicted_class.includes('virus') && (
                                    <>
                                      <li>• No chemical cure available</li>
                                      <li>• Focus on vector control</li>
                                      <li>• Remove infected plants immediately</li>
                                      <li>• Prevent spread to healthy plants</li>
                                    </>
                                  )}
                                  {result.predicted_class.includes('mite') && (
                                    <>
                                      <li>• Apply neem oil weekly</li>
                                      <li>• Spray undersides of leaves</li>
                                      <li>• Use in early morning/evening</li>
                                      <li>• Repeat for 3-4 weeks</li>
                                    </>
                                  )}
                                  {result.predicted_class === 'healthy' && (
                                    <>
                                      <li>• No treatment needed</li>
                                      <li>• Continue monitoring</li>
                                      <li>• Maintain care routine</li>
                                      <li>• Check weekly for changes</li>
                                    </>
                                  )}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Timing and Frequency */}
                          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                            <h5 className="font-semibold text-purple-700 mb-2 flex items-center">
                              <span className="mr-2">⏰</span>
                              Treatment Schedule:
                            </h5>
                            <div className="text-purple-800 text-sm space-y-1">
                              {result.predicted_class === 'healthy' ? (
                                <p>• No treatment schedule needed - plant is healthy!</p>
                              ) : (
                                <>
                                  <p>• <strong>Immediate:</strong> Start treatment within 24-48 hours</p>
                                  <p>• <strong>Frequency:</strong> Every 7-14 days depending on severity</p>
                                  <p>• <strong>Duration:</strong> Continue for 2-3 weeks after symptoms disappear</p>
                                  <p>• <strong>Best Time:</strong> Early morning or late evening application</p>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Safety & Environmental Considerations */}
                          <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                            <h5 className="font-semibold text-red-700 mb-2 flex items-center">
                              <span className="mr-2">⚠️</span>
                              Safety Notes:
                            </h5>
                            <div className="text-red-800 text-sm space-y-1">
                              <p>• Always read and follow product label instructions</p>
                              <p>• Wear protective equipment when applying treatments</p>
                              <p>• Keep treatments away from children and pets</p>
                              <p>• Observe pre-harvest intervals for edible crops</p>
                              <p>• Consider organic alternatives when possible</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Weather Context in Results */}
                    {weatherRiskAssessment && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">Weather Analysis:</h4>
                        <p className="text-sm text-blue-700">
                          The current weather conditions (Risk Level: <strong>{weatherRiskAssessment.riskLevel}</strong>) 
                          may have contributed to disease development. Consider the weather recommendations above for prevention.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseUpload;