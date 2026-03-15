import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Download, 
  BarChart3, 
  Droplets, 
  Leaf,
  Calendar,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Fertilizer = () => {
  // State management
  const [activeTab, setActiveTab] = useState('soil-test');
  const [soilData, setSoilData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    ph: '',
    organic_matter: '',
    moisture: '',
    crop_type: 'rice',
    field_size: '',
    location: ''
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFilePath, setUploadedFilePath] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [marketplace, setMarketplace] = useState([]);
  const [fertilizerType, setFertilizerType] = useState('balanced');
  const [loading, setLoading] = useState(false);
  const [analyzingPdf, setAnalyzingPdf] = useState(false);
  const [errors, setErrors] = useState({});
  const [retryCount, setRetryCount] = useState(0);
  const [npkChartData, setNpkChartData] = useState(null);
  const [deficiencyChartData, setDeficiencyChartData] = useState(null);
    const fileInputRef = useRef(null);
  // Generate chart data from analysis results
  const generateChartData = (results) => {
    if (!results) return;

    // Extract NPK data from the correct nested structure
    const npkAnalysis = results.npk_analysis || {};
    const currentNPK = npkAnalysis.current_npk || {};
    const recommendedNPK = npkAnalysis.recommended_npk || {};
    
    console.log('🔍 Frontend Chart Data Generation:');
    console.log('NPK Analysis:', npkAnalysis);
    console.log('Current NPK:', currentNPK);
    console.log('Recommended NPK:', recommendedNPK);
    
    const npkData = {
      labels: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)'],
      datasets: [
        {
          label: 'Current Levels',
          data: [currentNPK.N || 0, currentNPK.P || 0, currentNPK.K || 0],
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 2,
        },
        {
          label: 'Recommended Levels',
          data: [recommendedNPK.N || 0, recommendedNPK.P || 0, recommendedNPK.K || 0],
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 2,
        },
      ],
    };

    console.log('📊 NPK Chart Data:', npkData);

    // Deficiency Analysis Chart - also from nested structure
    const deficiencyData = npkAnalysis.deficiency_analysis || {};
    const deficiencyLabels = Object.keys(deficiencyData);
    const deficiencyValues = deficiencyLabels.map(() => 1); // Equal segments for pie chart

    const deficiencyChart = {
      labels: deficiencyLabels.length > 0 ? deficiencyLabels : ['No deficiencies detected'],
      datasets: [
        {
          data: deficiencyValues.length > 0 ? deficiencyValues : [1],
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(168, 85, 247, 0.8)',
          ],
          borderColor: [
            'rgb(239, 68, 68)',
            'rgb(59, 130, 246)',
            'rgb(245, 158, 11)',
            'rgb(34, 197, 94)',
            'rgb(168, 85, 247)',
          ],
          borderWidth: 2,
        },
      ],
    };

    setNpkChartData(npkData);
    setDeficiencyChartData(deficiencyChart);
  };

  // Crop options
  const cropOptions = [
    { value: 'rice', label: 'Rice' },
    { value: 'wheat', label: 'Wheat' },
    { value: 'corn', label: 'Corn/Maize' },
    { value: 'cotton', label: 'Cotton' },
    { value: 'sugarcane', label: 'Sugarcane' },
    { value: 'soybean', label: 'Soybean' },
    { value: 'potato', label: 'Potato' },
    { value: 'tomato', label: 'Tomato' },
    { value: 'onion', label: 'Onion' }
  ];

  // Validation functions
  const validateSoilData = () => {
    const newErrors = {};
    
    if (!soilData.nitrogen || soilData.nitrogen < 0 || soilData.nitrogen > 300) {
      newErrors.nitrogen = 'Nitrogen must be between 0-300 mg/kg';
    }
    if (!soilData.phosphorus || soilData.phosphorus < 0 || soilData.phosphorus > 300) {
      newErrors.phosphorus = 'Phosphorus must be between 0-300 mg/kg';
    }
    if (!soilData.potassium || soilData.potassium < 0 || soilData.potassium > 300) {
      newErrors.potassium = 'Potassium must be between 0-300 mg/kg';
    }
    if (!soilData.ph || soilData.ph < 3.0 || soilData.ph > 10.0) {
      newErrors.ph = 'pH must be between 3.0-10.0';
    }
    if (!soilData.moisture || soilData.moisture < 0 || soilData.moisture > 100) {
      newErrors.moisture = 'Moisture must be between 0-100%';
    }    if (!soilData.field_size || parseFloat(soilData.field_size) <= 0) {
      newErrors.field_size = 'Field size must be greater than 0 hectares';
    }
    if (!soilData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };  // API calls
  const analyzeSoil = async () => {
    if (!validateSoilData()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');      // Transform frontend data to match backend schema
      const apiData = {
        nitrogen: parseFloat(soilData.nitrogen),
        phosphorus: parseFloat(soilData.phosphorus),
        potassium: parseFloat(soilData.potassium),
        ph: parseFloat(soilData.ph),
        moisture: parseFloat(soilData.moisture),
        organic_matter: soilData.organic_matter ? parseFloat(soilData.organic_matter) : null,
        location: soilData.location,
        crop_type: soilData.crop_type,
        area_size: soilData.field_size ? parseFloat(soilData.field_size) : null,
        organic_preference: "chemical" // Use valid enum value
      };
      
      console.log('Sending API data:', apiData);
      console.log('Token exists:', !!token);
      
      const response = await fetch('/api/fertilizer/fertilizer-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(apiData),
      });      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response:', errorData);
        console.error('Response status:', response.status);
        console.error('Response headers:', Object.fromEntries(response.headers.entries()));
        throw new Error(`Analysis failed: ${response.status} ${response.statusText} - ${errorData}`);
      }      const data = await response.json();
      console.log('API Response:', data);
      
      setAnalysisResults(data);
      setSchedule(data.application_schedule);
      setMarketplace(data.marketplace_matches || []);
      
      // Generate chart data from API response
      generateChartData(data);
      
      setActiveTab('results');
      setRetryCount(0);
    } catch (error) {
      console.error('Analysis error:', error);
      setErrors({ api: error.message });
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
      setErrors({ file: 'Please upload a PDF or image file' });
      return;
    }

    setUploadedFile(file);
    setLoading(true);    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/fertilizer/upload-soil-report', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setSoilData(prev => ({ ...prev, ...data.extracted_data }));
      setUploadedFilePath(data.file_path); // Store file path for analysis
      setErrors({});
    } catch (error) {
      console.error('Upload error:', error);
      setErrors({ file: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzePdf = async () => {
    if (!uploadedFilePath) {
      setErrors({ pdf: 'Please upload a soil report first' });
      return;
    }

    setAnalyzingPdf(true);
    setErrors({});

    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${backendUrl}/api/fertilizer/analyze-soil-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          file_path: uploadedFilePath,
          crop_type: soilData.crop_type || 'rice'
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Analysis failed: ${response.status} ${response.statusText} - ${errorData}`);
      }

      const data = await response.json();
      console.log('PDF Analysis Response:', data);
      
      // Update soil data with extracted values
      if (data.extracted_data) {
        setSoilData(prev => ({
          ...prev,
          nitrogen: data.extracted_data.nitrogen || prev.nitrogen,
          phosphorus: data.extracted_data.phosphorus || prev.phosphorus,
          potassium: data.extracted_data.potassium || prev.potassium,
          ph: data.extracted_data.ph || prev.ph,
          organic_matter: data.extracted_data.organic_matter || prev.organic_matter,
          moisture: data.extracted_data.moisture || prev.moisture,
          location: data.extracted_data.location || prev.location
        }));
      }
      
      // Set analysis results
      setAnalysisResults(data);
      setSchedule(data.application_schedule);
      setMarketplace(data.marketplace_matches || []);
      
      // Generate chart data
      generateChartData(data);
      
      // Switch to results tab
      setActiveTab('results');
      
    } catch (error) {
      console.error('PDF Analysis error:', error);
      setErrors({ pdf: error.message });
    } finally {
      setAnalyzingPdf(false);
    }
  };

  const downloadReport = async () => {
    if (!analysisResults) return;

    try {
      const token = localStorage.getItem('token');
      
      // Use absolute URL to ensure it goes to the backend
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/fertilizer/download-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          soil_data: soilData,
          analysis: analysisResults,
          schedule: schedule,
          marketplace: marketplace
        }),
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fertilizer-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      setErrors({ download: error.message });
    }
  };
  // Chart configurations - will be generated when analysis results are available

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2 flex items-center justify-center gap-3">
            <Leaf className="text-green-600" />
            Fertilizer Recommendation System
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get AI-powered fertilizer recommendations based on soil analysis, crop requirements, and optimal application schedules
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center mb-8 bg-white rounded-xl shadow-lg p-2">
          {[
            { id: 'soil-test', label: 'Soil Test', icon: FileText },
            { id: 'upload', label: 'Upload Report', icon: Upload },
            { id: 'results', label: 'Analysis Results', icon: BarChart3 },
            { id: 'schedule', label: 'Schedule', icon: Calendar },
            { id: 'marketplace', label: 'Products', icon: ShoppingCart }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                activeTab === id
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Error Display */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Please fix the following errors:</span>
            </div>
            <ul className="list-disc list-inside text-red-700 space-y-1">
              {Object.entries(errors).map(([key, message]) => (
                <li key={key}>{message}</li>
              ))}
            </ul>
            {retryCount > 0 && (
              <button
                onClick={analyzeSoil}
                className="mt-3 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Analysis ({retryCount}/3)
              </button>
            )}
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Soil Test Form */}
          {activeTab === 'soil-test' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="text-green-600 w-6 h-6" />
                <h2 className="text-2xl font-bold text-gray-800">Soil Test Input</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* NPK Values */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700">NPK Values (kg/ha)</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nitrogen (N)
                      </label>
                      <input
                        type="number"
                        value={soilData.nitrogen}
                        onChange={(e) => setSoilData(prev => ({ ...prev, nitrogen: e.target.value }))}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.nitrogen ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0-300"
                        min="0"
                        max="300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phosphorus (P)
                      </label>
                      <input
                        type="number"
                        value={soilData.phosphorus}
                        onChange={(e) => setSoilData(prev => ({ ...prev, phosphorus: e.target.value }))}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.phosphorus ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0-300"
                        min="0"
                        max="300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Potassium (K)
                      </label>
                      <input
                        type="number"
                        value={soilData.potassium}
                        onChange={(e) => setSoilData(prev => ({ ...prev, potassium: e.target.value }))}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.potassium ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0-300"
                        min="0"
                        max="300"
                      />
                    </div>
                  </div>
                </div>

                {/* Soil Properties */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700">Soil Properties</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        pH Level
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={soilData.ph}
                        onChange={(e) => setSoilData(prev => ({ ...prev, ph: e.target.value }))}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.ph ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="3.0-10.0"
                        min="3.0"
                        max="10.0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Organic Matter (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={soilData.organic_matter}
                        onChange={(e) => setSoilData(prev => ({ ...prev, organic_matter: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0-100"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Moisture (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={soilData.moisture}
                        onChange={(e) => setSoilData(prev => ({ ...prev, moisture: e.target.value }))}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.moisture ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0-100"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </div>

                {/* Farm Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700">Farm Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Crop Type
                      </label>
                      <select
                        value={soilData.crop_type}
                        onChange={(e) => setSoilData(prev => ({ ...prev, crop_type: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {cropOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field Size (hectares)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={soilData.field_size}
                        onChange={(e) => setSoilData(prev => ({ ...prev, field_size: e.target.value }))}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.field_size ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g., 2.5"
                        min="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={soilData.location}
                        onChange={(e) => setSoilData(prev => ({ ...prev, location: e.target.value }))}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.location ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="City, State/Region"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fertilizer Type Toggle */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Fertilizer Preference</h3>
                <div className="flex gap-4">
                  {[
                    { value: 'organic', label: 'Organic Only', icon: '🌿' },
                    { value: 'chemical', label: 'Chemical Only', icon: '⚗️' },
                    { value: 'balanced', label: 'Balanced Mix', icon: '⚖️' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setFertilizerType(option.value)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
                        fertilizerType === option.value
                          ? 'border-green-600 bg-green-50 text-green-800'
                          : 'border-gray-300 hover:border-green-300'
                      }`}
                    >
                      <span className="text-xl">{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Analyze Button */}
              <div className="flex justify-center pt-6">
                <button
                  onClick={analyzeSoil}
                  disabled={loading}
                  className="flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-lg font-semibold shadow-lg"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <BarChart3 className="w-6 h-6" />
                  )}
                  {loading ? 'Analyzing...' : 'Analyze Soil & Get Recommendations'}
                </button>
              </div>
            </div>
          )}

          {/* Upload Report Tab */}
          {activeTab === 'upload' && (
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Upload className="text-green-600 w-6 h-6" />
                <h2 className="text-2xl font-bold text-gray-800">Upload Soil Report</h2>
              </div>

              <div className="max-w-md mx-auto">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-green-500 cursor-pointer transition-colors"
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Click to upload soil test report</p>
                  <p className="text-sm text-gray-500">PDF or Image files only</p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {uploadedFile && (
                  <div className="mt-4 space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">File uploaded successfully</span>
                      </div>
                      <p className="text-green-600 text-sm mt-1">{uploadedFile.name}</p>
                    </div>
                    
                    {/* Analyze PDF Button */}
                    <button
                      onClick={handleAnalyzePdf}
                      disabled={analyzingPdf || !uploadedFilePath}
                      className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {analyzingPdf ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Analyzing PDF Report...
                        </>
                      ) : (
                        <>
                          <BarChart3 className="w-5 h-5" />
                          Analyze PDF & Get Fertilizer Recommendations
                        </>
                      )}
                    </button>
                    
                    <p className="text-sm text-gray-600 text-center">
                      Our AI will extract soil data from your report and provide personalized fertilizer recommendations
                    </p>
                    
                    {/* PDF Analysis Error */}
                    {errors.pdf && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-800">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Analysis Error</span>
                        </div>
                        <p className="text-red-700 text-sm mt-1">{errors.pdf}</p>
                      </div>
                    )}
                    
                    {/* PDF Analysis Success */}
                    {analysisResults && !errors.pdf && uploadedFile && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-800">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Analysis Complete!</span>
                        </div>
                        <p className="text-blue-700 text-sm mt-1">
                          Fertilizer recommendations are ready. Check the Results tab.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analysis Results Tab */}
          {activeTab === 'results' && analysisResults && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 className="text-green-600 w-6 h-6" />
                  <h2 className="text-2xl font-bold text-gray-800">Analysis Results</h2>
                </div>
                <button
                  onClick={downloadReport}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Download className="w-4 h-4" />
                  Download PDF Report
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-8 h-8" />
                    <h3 className="text-xl font-bold">Soil Health</h3>
                  </div>
                  <p className="text-3xl font-bold mb-2">{analysisResults.confidence_score}%</p>
                  <p className="text-green-100">Overall Confidence</p>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <Droplets className="w-8 h-8" />
                    <h3 className="text-xl font-bold">Primary Need</h3>
                  </div>                  <p className="text-2xl font-bold mb-2">
                    {(() => {
                      const currentNPK = analysisResults.npk_analysis?.current_npk || {};
                      const recommendedNPK = analysisResults.npk_analysis?.recommended_npk || {};
                      
                      // Calculate deficiencies
                      const nDeficiency = Math.max(0, (recommendedNPK.N || 0) - (currentNPK.N || 0));
                      const pDeficiency = Math.max(0, (recommendedNPK.P || 0) - (currentNPK.P || 0));
                      const kDeficiency = Math.max(0, (recommendedNPK.K || 0) - (currentNPK.K || 0));
                      
                      const maxDeficiency = Math.max(nDeficiency, pDeficiency, kDeficiency);
                      
                      if (maxDeficiency === nDeficiency && nDeficiency > 0) return 'Nitrogen';
                      if (maxDeficiency === pDeficiency && pDeficiency > 0) return 'Phosphorus';
                      if (maxDeficiency === kDeficiency && kDeficiency > 0) return 'Potassium';
                      return 'Balanced';
                    })()}
                  </p>
                  <p className="text-blue-100">Highest Deficiency</p>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-8 h-8" />
                    <h3 className="text-xl font-bold">Applications</h3>
                  </div>
                  <p className="text-3xl font-bold mb-2">{schedule?.length || 0}</p>
                  <p className="text-purple-100">Recommended Phases</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">NPK Levels Comparison</h3>
                  {npkChartData && <Bar data={npkChartData} />}
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Nutrient Deficiencies</h3>
                  {deficiencyChartData && <Pie data={deficiencyChartData} />}
                </div>
              </div>              {/* AI Recommendations */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-yellow-800 mb-3">AI Recommendations</h3>
                <div className="space-y-2">
                  {analysisResults.npk_analysis?.deficiency_analysis && 
                    Object.entries(analysisResults.npk_analysis.deficiency_analysis).map(([nutrient, analysis], index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-yellow-800">
                          <span className="font-semibold">{nutrient}:</span> {analysis}
                        </p>
                      </div>
                    ))
                  }
                  {analysisResults.recommendations_summary && (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-yellow-800">{analysisResults.recommendations_summary}</p>
                    </div>
                  )}
                  {(!analysisResults.npk_analysis?.deficiency_analysis || 
                    Object.keys(analysisResults.npk_analysis.deficiency_analysis).length === 0) && 
                   !analysisResults.recommendations_summary && (
                    <p className="text-yellow-700 italic">No specific recommendations available at this time.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && schedule && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="text-green-600 w-6 h-6" />
                <h2 className="text-2xl font-bold text-gray-800">Application Schedule</h2>
              </div>

              <div className="space-y-4">
                {schedule.map((phase, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-800 capitalize">
                        {phase.phase} Phase
                      </h3>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {phase.timing}
                      </span>
                    </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-red-50 rounded-lg p-4">
                        <p className="text-sm text-red-600 font-medium">Nitrogen</p>
                        <p className="text-2xl font-bold text-red-800">
                          {(() => {
                            const ratio = phase.npk_ratio?.split('-') || ['0', '0', '0'];
                            const totalRatio = parseInt(ratio[0]) + parseInt(ratio[1]) + parseInt(ratio[2]);
                            const nPercentage = parseInt(ratio[0]) / totalRatio;
                            return (phase.quantity_per_hectare * nPercentage).toFixed(1);
                          })()} kg/ha
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Phosphorus</p>
                        <p className="text-2xl font-bold text-blue-800">
                          {(() => {
                            const ratio = phase.npk_ratio?.split('-') || ['0', '0', '0'];
                            const totalRatio = parseInt(ratio[0]) + parseInt(ratio[1]) + parseInt(ratio[2]);
                            const pPercentage = parseInt(ratio[1]) / totalRatio;
                            return (phase.quantity_per_hectare * pPercentage).toFixed(1);
                          })()} kg/ha
                        </p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <p className="text-sm text-yellow-600 font-medium">Potassium</p>
                        <p className="text-2xl font-bold text-yellow-800">
                          {(() => {
                            const ratio = phase.npk_ratio?.split('-') || ['0', '0', '0'];
                            const totalRatio = parseInt(ratio[0]) + parseInt(ratio[1]) + parseInt(ratio[2]);
                            const kPercentage = parseInt(ratio[2]) / totalRatio;
                            return (phase.quantity_per_hectare * kPercentage).toFixed(1);
                          })()} kg/ha
                        </p>
                      </div>                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 font-medium">NPK Ratio</p>
                          <p className="text-lg font-bold text-gray-800">{phase.npk_ratio}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Total Quantity</p>
                          <p className="text-lg font-bold text-gray-800">{phase.quantity_per_hectare?.toFixed(1)} kg/ha</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-gray-600"><span className="font-medium">Method:</span> {phase.application_method}</p>
                      {phase.notes && (
                        <p className="text-gray-600"><span className="font-medium">Notes:</span> {phase.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Marketplace Tab */}
          {activeTab === 'marketplace' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <ShoppingCart className="text-green-600 w-6 h-6" />
                <h2 className="text-2xl font-bold text-gray-800">Recommended Products</h2>
              </div>

              {marketplace.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {marketplace.map((product, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-gray-800">{product.name}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                          {product.match_percentage}% match
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">NPK:</span> {product.npk_ratio}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Type:</span> {product.fertilizer_type}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Price:</span> ₹{product.price_per_kg}/kg
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Available:</span> {product.available_quantity} kg
                        </p>
                      </div>

                      <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No products available. Please complete soil analysis first.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Fertilizer;
