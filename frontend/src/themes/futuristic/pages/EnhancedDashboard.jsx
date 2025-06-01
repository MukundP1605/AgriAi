import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

const EnhancedDashboard = () => {
  const auth = useAuth();
  const { currentUser } = auth || {};
  const [dashboardData, setDashboardData] = useState({
    totalRecommendations: 0,
    totalDetections: 0,
    recentActivity: [],
    popularCrops: [],
    diseaseStats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/user/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
    setLoading(false);
  };

  const exportData = async () => {
    try {
      const response = await fetch('/api/user/export', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agriai_data_${currentUser?.email}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1>Enhanced Dashboard</h1>
      
      <div>
        <h2>Overview</h2>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px'}}>
          <div style={{border: '1px solid #ccc', padding: '10px'}}>
            <h3>Crop Recommendations</h3>
            <p style={{fontSize: '24px'}}>{dashboardData.totalRecommendations}</p>
          </div>
          <div style={{border: '1px solid #ccc', padding: '10px'}}>
            <h3>Disease Detections</h3>
            <p style={{fontSize: '24px'}}>{dashboardData.totalDetections}</p>
          </div>
          <div style={{border: '1px solid #ccc', padding: '10px'}}>
            <h3>Total Sessions</h3>
            <p style={{fontSize: '24px'}}>{dashboardData.recentActivity.length}</p>
          </div>
        </div>
      </div>

      <div>
        <h2>Recent Activity</h2>
        {dashboardData.recentActivity.length === 0 ? (
          <p>No recent activity</p>
        ) : (
          <div>
            {dashboardData.recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} style={{border: '1px solid #ccc', margin: '5px 0', padding: '10px'}}>
                <strong>{activity.action}</strong> - {new Date(activity.timestamp).toLocaleString()}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2>Popular Crops</h2>
        {dashboardData.popularCrops.length === 0 ? (
          <p>No crop data available</p>
        ) : (
          <ul>
            {dashboardData.popularCrops.map((crop, index) => (
              <li key={index}>{crop.name}: {crop.count} recommendations</li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2>Disease Statistics</h2>
        {dashboardData.diseaseStats.length === 0 ? (
          <p>No disease detection data</p>
        ) : (
          <ul>
            {dashboardData.diseaseStats.map((disease, index) => (
              <li key={index}>{disease.name}: {disease.count} detections</li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2>Actions</h2>
        <button onClick={exportData}>Export My Data</button>
        <button onClick={fetchDashboardData}>Refresh Dashboard</button>
      </div>

      <div>
        <h2>Raw Data</h2>
        <details>
          <summary>View Raw Dashboard Data</summary>
          <pre style={{fontSize: '12px'}}>{JSON.stringify(dashboardData, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
