import React from 'react';
import UserProfile from '../components/Profile/UserProfile';
import EnhancedDashboard from '../components/Dashboard/EnhancedDashboard';

const TestEnhancedFeatures = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Enhanced AgriAI Features Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Component */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">User Profile Component</h2>
            <UserProfile />
          </div>
          
          {/* Dashboard Component */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Enhanced Dashboard Component</h2>
            <EnhancedDashboard />
          </div>
        </div>
      </div>
    </div>
  );
};

const Footer = () => (
  <footer className="w-full mt-12 py-6 bg-emerald-50 border-t border-emerald-100 text-center text-gray-500 text-sm">
    © {new Date().getFullYear()} AgriAI. All rights reserved.
  </footer>
);

export default TestEnhancedFeatures;
