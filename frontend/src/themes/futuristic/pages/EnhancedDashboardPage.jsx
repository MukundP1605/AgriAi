import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardComponent from '../components/Dashboard/EnhancedDashboard';

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-700">
          <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Enhanced Dashboard
          </h1>
          
          <DashboardComponent />
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboardPage;
