import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EnhancedDashboard from '../components/Dashboard/EnhancedDashboard';
import CropManagementDashboard from '../components/CropManagement/CropManagementDashboard';
import FarmAnalytics from '../components/CropManagement/FarmAnalytics';
import AlertManagement from '../components/Alerts/AlertManagement';
import UserProfile from '../components/Profile/UserProfile';
import Footer from '../components/Footer';

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
  }

  return (
    <div className="flex-grow bg-black/90 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 mb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Advanced AgriAI Dashboard
            </span>
          </h1>
          <p className="text-gray-400">Comprehensive view of your agricultural activities and insights</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-1 bg-gray-900/70 backdrop-blur-sm rounded-lg p-1 border border-gray-800 min-w-max">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-cyan-400 hover:bg-gray-800'
              }`}
            >
              📊 Dashboard Analytics
            </button>
            <button
              onClick={() => setActiveTab('crops')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'crops'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-cyan-400 hover:bg-gray-800'
              }`}
            >
              🌾 Crop Management
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'alerts'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-cyan-400 hover:bg-gray-800'
              }`}
            >
              🐛 Pest & Disease Alerts
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-cyan-400 hover:bg-gray-800'
              }`}
            >
              👤 User Profile
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6">
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center">
                <span className="text-lg mr-2">📊</span>
                Dashboard Analytics
              </h2>
              <EnhancedDashboard />
            </div>
          )}
          
          {activeTab === 'crops' && (
            <div>
              <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center">
                <span className="text-lg mr-2">🌾</span>
                Crop Management
              </h2>
              <CropManagementDashboard />
            </div>
          )}
          
          {activeTab === 'alerts' && (
            <div>
              <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center">
                <span className="text-lg mr-2">🐛</span>
                Pest & Disease Alert Management
              </h2>
              <AlertManagement />
            </div>
          )}
          
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center">
                <span className="text-lg mr-2">👤</span>
                User Profile Management
              </h2>
              <UserProfile />
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default EnhancedDashboardPage;
