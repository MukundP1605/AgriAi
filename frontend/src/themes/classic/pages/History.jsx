import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const History = () => {
  const { currentUser, isAuthenticated } = useAuth();
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
        setScanHistory(scanData);
      }

      // Fetch crop history
      const cropResponse = await fetch(`http://127.0.0.1:8000/api/user/history/crop-plans?days=${filterOptions.dateRange}&sort_by=${filterOptions.sortBy}&sort_order=${filterOptions.sortOrder}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (cropResponse.ok) {
        const cropData = await cropResponse.json();
        setCropHistory(cropData);
      }
    } catch (error) {
      console.error('Error fetching history data:', error);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilterOptions({ ...filterOptions, ...newFilters });
    fetchHistoryData();
  };

  const exportData = async (dataType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/user/history/export/${dataType}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dataType}_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto mt-12 p-8 mb-12">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-700">Loading history...</h2>
          </div>
        </div>
      </div>
    );
  }

  const DashboardView = () => (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Scans</p>
              <p className="text-3xl font-bold text-emerald-700">{dashboardData?.total_scans || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                +{dashboardData?.scans_this_month || 0} this month
              </p>
            </div>
            <div className="text-emerald-600 text-3xl">🔍</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Crop Plans</p>
              <p className="text-3xl font-bold text-blue-700">{dashboardData?.total_crop_plans || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                +{dashboardData?.crop_plans_this_month || 0} this month
              </p>
            </div>
            <div className="text-blue-600 text-3xl">🌾</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Chat Sessions</p>
              <p className="text-3xl font-bold text-purple-700">{dashboardData?.total_chats || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                Avg. {dashboardData?.avg_session_duration || '0'} min/session
              </p>
            </div>
            <div className="text-purple-600 text-3xl">💬</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-xl border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-3xl font-bold text-amber-700">{dashboardData?.success_rate || 0}%</p>
              <p className="text-xs text-gray-500 mt-1">Disease detection accuracy</p>
            </div>
            <div className="text-amber-600 text-3xl">✅</div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Recent Activity</h3>
          <div className="space-y-3">
            {dashboardData?.recent_activity?.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-sm">
                    {activity.type === 'scan' ? '🔍' : activity.type === 'crop' ? '🌾' : '💬'}
                  </div>
                  <span className="text-gray-700">{activity.description}</span>
                </div>
                <span className="text-sm text-gray-500">{activity.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Detected Issues */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Most Common Issues</h3>
          <div className="space-y-3">
            {dashboardData?.top_diseases?.map((disease, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{disease.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-red-500 rounded-full" 
                      style={{ width: `${disease.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{disease.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ScanHistoryView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-700">Disease Scan History</h3>
        <button
          onClick={() => exportData('scans')}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition duration-300"
        >
          Export Data
        </button>
      </div>
      
      <div className="grid gap-4">
        {scanHistory.map((scan, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-emerald-500">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-semibold text-gray-800">{scan.disease_result}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    scan.confidence > 0.8 ? 'bg-green-100 text-green-700' :
                    scan.confidence > 0.6 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {(scan.confidence * 100).toFixed(1)}% confidence
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{scan.treatment_recommendation}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>📷 {scan.image_name}</span>
                  <span>📅 {new Date(scan.created_at).toLocaleDateString()}</span>
                  {scan.location && <span>📍 {scan.location}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const CropHistoryView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-700">Crop Recommendation History</h3>
        <button
          onClick={() => exportData('crops')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Export Data
        </button>
      </div>
      
      <div className="grid gap-4">
        {cropHistory.map((crop, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-semibold text-gray-800">{crop.recommended_crop}</h4>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {crop.season} Season
                  </span>
                </div>
                <p className="text-gray-600 mb-2">Expected yield: {crop.expected_yield}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>📍 {crop.location}</span>
                  <span>📅 {new Date(crop.created_at).toLocaleDateString()}</span>
                  {crop.estimated_profit && <span>💰 ${crop.estimated_profit}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="max-w-7xl mx-auto mt-12 p-8 min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Activity Dashboard</h2>
          <button
            onClick={() => navigate('/profile')}
            className="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition duration-300"
          >
            Back to Profile
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'scans', label: 'Disease Scans', icon: '🔍' },
            { id: 'crops', label: 'Crop Plans', icon: '🌾' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition duration-300 ${
                activeTab === tab.id
                  ? 'bg-white text-emerald-700 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Filter Controls */}
        {(activeTab === 'scans' || activeTab === 'crops') && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <select
                value={filterOptions.dateRange}
                onChange={(e) => handleFilterChange({ dateRange: e.target.value })}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="365">Last year</option>
              </select>
              
              <select
                value={filterOptions.sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="date">Sort by Date</option>
                <option value="confidence">Sort by Confidence</option>
                <option value="name">Sort by Name</option>
              </select>
              
              <select
                value={filterOptions.sortOrder}
                onChange={(e) => handleFilterChange({ sortOrder: e.target.value })}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </select>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'scans' && <ScanHistoryView />}
          {activeTab === 'crops' && <CropHistoryView />}
        </div>
      </div>
    </div>  );
};

export default function HistoryPage() {
  return (
    <div className="flex-grow">
      <History />
        <Footer />
    </div>
  );
}
