import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const History = () => {
  const auth = useAuth();
  const { currentUser, isAuthenticated } = auth || {};
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [cropHistory, setCropHistory] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    dateRange: '30',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchDashboardData();
      fetchHistoryData();
    }
  }, [isAuthenticated, navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/user/history/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch scan history
      const scanResponse = await fetch(`http://127.0.0.1:8000/api/user/history/scans?days=${filterOptions.dateRange}&sort_by=${filterOptions.sortBy}&sort_order=${filterOptions.sortOrder}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (scanResponse.ok) {
        const scanData = await scanResponse.json();
        setScanHistory(scanData.scans || []);
      }

      // Fetch crop prediction history
      const cropResponse = await fetch(`http://127.0.0.1:8000/api/user/history/crops?days=${filterOptions.dateRange}&sort_by=${filterOptions.sortBy}&sort_order=${filterOptions.sortOrder}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (cropResponse.ok) {
        const cropData = await cropResponse.json();
        setCropHistory(cropData.predictions || []);
      }
    } catch (error) {
      console.error('Error fetching history data:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilterOptions(prev => ({ ...prev, [key]: value }));
  };

  const exportHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/user/history/export', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'agriai-history.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting history:', error);
    }
  };

  const clearHistory = async (type) => {
    if (!window.confirm(`Are you sure you want to clear all ${type} history?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/user/history/${type}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        if (type === 'scans') {
          setScanHistory([]);
        } else if (type === 'crops') {
          setCropHistory([]);
        }
        alert(`${type} history cleared successfully!`);
      }
    } catch (error) {
      console.error(`Error clearing ${type} history:`, error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Activity History & Dashboard</h1>
      
      <div>
        <button 
          onClick={() => setActiveTab('dashboard')}
          style={{ backgroundColor: activeTab === 'dashboard' ? '#ccc' : 'white' }}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('scans')}
          style={{ backgroundColor: activeTab === 'scans' ? '#ccc' : 'white' }}
        >
          Disease Scans
        </button>
        <button 
          onClick={() => setActiveTab('crops')}
          style={{ backgroundColor: activeTab === 'crops' ? '#ccc' : 'white' }}
        >
          Crop Predictions
        </button>
      </div>

      {activeTab === 'dashboard' && dashboardData && (
        <div>
          <h2>Dashboard Overview</h2>
          <div>
            <div>
              <h3>Total Scans</h3>
              <p>{dashboardData.total_scans || 0}</p>
            </div>
            <div>
              <h3>Recent Activity</h3>
              <p>{dashboardData.recent_activity || 0}</p>
            </div>
            <div>
              <h3>Success Rate</h3>
              <p>{dashboardData.success_rate || 0}%</p>
            </div>
          </div>
          <button onClick={exportHistory}>Export History</button>
        </div>
      )}

      {activeTab === 'scans' && (
        <div>
          <h2>Disease Scan History</h2>
          
          <div>
            <label>Date Range: </label>
            <select 
              value={filterOptions.dateRange} 
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
            
            <label>Sort by: </label>
            <select 
              value={filterOptions.sortBy} 
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="date">Date</option>
              <option value="confidence">Confidence</option>
              <option value="disease">Disease</option>
            </select>
            
            <label>Order: </label>
            <select 
              value={filterOptions.sortOrder} 
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
            
            <button onClick={() => clearHistory('scans')}>Clear History</button>
          </div>

          <div>
            {scanHistory.length > 0 ? (
              scanHistory.map((scan, index) => (
                <div key={index} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                  <p><strong>Date:</strong> {new Date(scan.created_at).toLocaleString()}</p>
                  <p><strong>Disease:</strong> {scan.disease_name}</p>
                  <p><strong>Confidence:</strong> {scan.confidence}%</p>
                  <p><strong>Treatment:</strong> {scan.treatment}</p>
                  {scan.image_url && (
                    <img src={scan.image_url} alt="Scan" style={{ maxWidth: '200px' }} />
                  )}
                </div>
              ))
            ) : (
              <p>No scan history found.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'crops' && (
        <div>
          <h2>Crop Prediction History</h2>
          
          <div>
            <button onClick={() => clearHistory('crops')}>Clear History</button>
          </div>

          <div>
            {cropHistory.length > 0 ? (
              cropHistory.map((prediction, index) => (
                <div key={index} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                  <p><strong>Date:</strong> {new Date(prediction.created_at).toLocaleString()}</p>
                  <p><strong>Recommended Crop:</strong> {prediction.crop_name}</p>
                  <p><strong>Confidence:</strong> {prediction.confidence}%</p>
                  <p><strong>Location:</strong> {prediction.location}</p>
                  <p><strong>Soil Type:</strong> {prediction.soil_quality}</p>
                </div>
              ))
            ) : (
              <p>No crop prediction history found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
