import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserProfile from '../components/Profile/UserProfile';
import EnhancedDashboard from '../components/Dashboard/EnhancedDashboard';
import CropManagementDashboard from '../components/CropManagement/CropManagementDashboard';
import FarmAnalytics from '../components/CropManagement/FarmAnalytics';
import AlertManagement from '../components/Alerts/AlertManagement';
import WeatherWidget from '../components/Weather/WeatherWidget';
import WeatherForecast from '../components/Weather/WeatherForecast';
import WeatherInsights from '../components/Weather/WeatherInsights';

// import './EnhancedDashboard.css'; // Optional: Import custom styles for the dashboard
const EnhancedDashboardPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }  return (
    <div className="flex-grow bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 py-8 mb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Advanced AgriAI Dashboard</h1>
          <p className="text-gray-600">Comprehensive view of your agricultural activities and insights</p>
        </div>        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              📊 Dashboard Analytics
            </button>
            <button
              onClick={() => setActiveTab('crops')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'crops'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              🌾 Crop Management
            </button>
            <button
              onClick={() => setActiveTab('weather')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'weather'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              🌤️ Weather & Insights
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'alerts'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              🐛 Pest & Disease Alerts
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'profile'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              👤 User Profile
            </button>
          </div>
        </div>        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {activeTab === 'dashboard' && (
            <div className="p-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Dashboard Analytics</h2>
              <EnhancedDashboard />
            </div>
          )}
          
          {activeTab === 'crops' && (
            <div className="p-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Crop Management</h2>
              <CropManagementDashboard />
            </div>
          )}
          
          {activeTab === 'weather' && (
            <div className="p-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Weather & Agricultural Insights</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <WeatherWidget />
                <WeatherForecast />
              </div>
              <WeatherInsights />
            </div>
          )}
          
          {activeTab === 'alerts' && (
            <div className="p-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Pest & Disease Alert Management</h2>
              <AlertManagement />
            </div>
          )}
          
          {activeTab === 'profile' && (
            <div className="p-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">User Profile Management</h2>
              <UserProfile />
            </div>
          )}
        </div>
      </div>   
    </div>
  );
};

export default EnhancedDashboardPage;
