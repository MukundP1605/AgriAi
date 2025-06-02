// Raw Data Interface - Fertilizer Management System
import React, { useState, useRef, useEffect } from 'react';

const FuturisticFertilizer = () => {
  // Core state for data processing
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
  const [analysisResults, setAnalysisResults] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [marketplace, setMarketplace] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [fertilizerType, setFertilizerType] = useState('balanced');
  const fileInputRef = useRef(null);

  // Data validation
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
    }
    if (!soilData.field_size || parseFloat(soilData.field_size) <= 0) {
      newErrors.field_size = 'Field size must be greater than 0 hectares';
    }
    if (!soilData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Core API functions
  const analyzeSoil = async () => {
    if (!validateSoilData()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiData = {
        nitrogen: parseFloat(soilData.nitrogen),
        phosphorus: parseFloat(soilData.phosphorus),
        potassium: parseFloat(soilData.potassium),
        ph: parseFloat(soilData.ph),
        moisture: parseFloat(soilData.moisture),
        organic_matter: soilData.organic_matter ? parseFloat(soilData.organic_matter) : null,
        location: soilData.location,
        crop_type: soilData.crop_type,
        field_size: parseFloat(soilData.field_size)
      };

      const response = await fetch('/api/fertilizer/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setAnalysisResults(result);
    } catch (error) {
      console.error('Soil analysis failed:', error);
      setErrors({ general: 'Soil analysis failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrors({ file: 'Please upload a CSV file' });
      return;
    }

    setUploadedFile(file);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/fertilizer/upload-soil-data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      setSoilData(prev => ({
        ...prev,
        nitrogen: result.nitrogen || '',
        phosphorus: result.phosphorus || '',
        potassium: result.potassium || '',
        ph: result.ph || '',
        moisture: result.moisture || '',
        organic_matter: result.organic_matter || ''
      }));
    } catch (error) {
      console.error('File upload failed:', error);
      setErrors({ file: 'File upload failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const generateSchedule = async () => {
    if (!analysisResults) {
      setErrors({ schedule: 'Please analyze soil first' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/fertilizer/generate-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          analysis_id: analysisResults.analysis_id,
          fertilizer_type: fertilizerType,
          crop_type: soilData.crop_type,
          field_size: parseFloat(soilData.field_size)
        })
      });

      if (!response.ok) {
        throw new Error(`Schedule generation failed: ${response.status}`);
      }

      const result = await response.json();
      setSchedule(result);
    } catch (error) {
      console.error('Schedule generation failed:', error);
      setErrors({ schedule: 'Schedule generation failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketplace = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/marketplace/fertilizers', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Marketplace fetch failed: ${response.status}`);
      }

      const result = await response.json();
      setMarketplace(result.products || []);
    } catch (error) {
      console.error('Marketplace fetch failed:', error);
      setErrors({ marketplace: 'Failed to load marketplace data' });
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    if (!analysisResults) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/fertilizer/download-report/${analysisResults.analysis_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fertilizer-report-${analysisResults.analysis_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      setErrors({ download: 'Download failed. Please try again.' });
    }
  };

  // Auto-fetch marketplace data on load
  useEffect(() => {
    fetchMarketplace();
  }, []);

  // Raw data output - no UI, just JSON
  return (
    <div>
      <h1>Fertilizer Management System - Raw Data Interface</h1>
      
      {/* Soil Data Input */}
      <div>
        <h2>Soil Data Input</h2>
        <pre>{JSON.stringify(soilData, null, 2)}</pre>
      </div>

      {/* File Upload */}
      <div>
        <h2>File Upload</h2>
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          onChange={handleFileUpload}
        />
        {uploadedFile && <p>Uploaded: {uploadedFile.name}</p>}
      </div>

      {/* Manual Input Fields */}
      <div>
        <h2>Manual Data Entry</h2>
        <input
          type="number"
          placeholder="Nitrogen (mg/kg)"
          value={soilData.nitrogen}
          onChange={(e) => setSoilData({...soilData, nitrogen: e.target.value})}
        />
        <input
          type="number"
          placeholder="Phosphorus (mg/kg)"
          value={soilData.phosphorus}
          onChange={(e) => setSoilData({...soilData, phosphorus: e.target.value})}
        />
        <input
          type="number"
          placeholder="Potassium (mg/kg)"
          value={soilData.potassium}
          onChange={(e) => setSoilData({...soilData, potassium: e.target.value})}
        />
        <input
          type="number"
          placeholder="pH"
          value={soilData.ph}
          onChange={(e) => setSoilData({...soilData, ph: e.target.value})}
        />
        <input
          type="number"
          placeholder="Moisture (%)"
          value={soilData.moisture}
          onChange={(e) => setSoilData({...soilData, moisture: e.target.value})}
        />
        <input
          type="number"
          placeholder="Organic Matter (%)"
          value={soilData.organic_matter}
          onChange={(e) => setSoilData({...soilData, organic_matter: e.target.value})}
        />
        <input
          type="text"
          placeholder="Location"
          value={soilData.location}
          onChange={(e) => setSoilData({...soilData, location: e.target.value})}
        />
        <input
          type="number"
          placeholder="Field Size (hectares)"
          value={soilData.field_size}
          onChange={(e) => setSoilData({...soilData, field_size: e.target.value})}
        />
        <select
          value={soilData.crop_type}
          onChange={(e) => setSoilData({...soilData, crop_type: e.target.value})}
        >
          <option value="rice">Rice</option>
          <option value="wheat">Wheat</option>
          <option value="corn">Corn/Maize</option>
          <option value="cotton">Cotton</option>
          <option value="sugarcane">Sugarcane</option>
          <option value="soybean">Soybean</option>
          <option value="potato">Potato</option>
          <option value="tomato">Tomato</option>
          <option value="onion">Onion</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div>
        <h2>Actions</h2>
        <button onClick={analyzeSoil} disabled={loading}>
          {loading ? 'Processing...' : 'Analyze Soil'}
        </button>
        <button onClick={generateSchedule} disabled={loading || !analysisResults}>
          Generate Schedule
        </button>
        <button onClick={downloadReport} disabled={!analysisResults}>
          Download Report
        </button>
      </div>

      {/* Fertilizer Type Selection */}
      <div>
        <h2>Fertilizer Type</h2>
        <select
          value={fertilizerType}
          onChange={(e) => setFertilizerType(e.target.value)}
        >
          <option value="balanced">Balanced (NPK)</option>
          <option value="nitrogen">Nitrogen Rich</option>
          <option value="phosphorus">Phosphorus Rich</option>
          <option value="potassium">Potassium Rich</option>
          <option value="organic">Organic</option>
        </select>
      </div>

      {/* Errors Display */}
      {Object.keys(errors).length > 0 && (
        <div>
          <h2>Errors</h2>
          <pre>{JSON.stringify(errors, null, 2)}</pre>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResults && (
        <div>
          <h2>Analysis Results</h2>
          <pre>{JSON.stringify(analysisResults, null, 2)}</pre>
        </div>
      )}

      {/* Schedule Results */}
      {schedule && (
        <div>
          <h2>Fertilizer Schedule</h2>
          <pre>{JSON.stringify(schedule, null, 2)}</pre>
        </div>
      )}

      {/* Marketplace Data */}
      <div>
        <h2>Marketplace Fertilizers</h2>
        <pre>{JSON.stringify(marketplace, null, 2)}</pre>
      </div>

      {/* Loading State */}
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default FuturisticFertilizer;
