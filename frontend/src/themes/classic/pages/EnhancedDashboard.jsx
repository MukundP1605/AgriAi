import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserProfile from '../components/Profile/UserProfile';
import EnhancedDashboard from '../components/Dashboard/EnhancedDashboard';
// import './EnhancedDashboard.css'; // Optional: Import custom styles for the dashboard
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
  }  return (
    <div className="flex-grow bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 py-8 mb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Advanced AgriAI Dashboard</h1>
          <p className="text-gray-600">Comprehensive view of your agricultural activities and insights</p>
        </div>

        {/* Tab Navigation */}
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
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {activeTab === 'dashboard' && (
            <div className="p-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Dashboard Analytics</h2>
              <EnhancedDashboard />
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
  
      <Footer />
    </div>
  );
};

export default EnhancedDashboardPage;
