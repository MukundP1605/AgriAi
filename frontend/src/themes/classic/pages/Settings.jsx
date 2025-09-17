import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const Settings = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showConfirmChat, setShowConfirmChat] = useState(false);
  const [showConfirmDisease, setShowConfirmDisease] = useState(false);
  const [showConfirmCrop, setShowConfirmCrop] = useState(false);
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleClearChatHistory = () => {
    if (currentUser?.email) {
      localStorage.removeItem(`chat_history_${currentUser.email}`);
      setShowConfirmChat(false);
      alert('Chat history cleared successfully');
    }
  };
  
  const handleClearDiseaseScans = () => {
    if (currentUser?.email) {
      localStorage.removeItem(`disease_scans_${currentUser.email}`);
      setShowConfirmDisease(false);
      alert('Disease scan history cleared successfully');
    }
  };
  
  const handleClearCropPlans = () => {
    if (currentUser?.email) {
      localStorage.removeItem(`crop_plans_${currentUser.email}`);
      setShowConfirmCrop(false);
      alert('Crop planning history cleared successfully');
    }
  };
    // If no user is logged in, show a placeholder
  if (!currentUser) {
    return (
      <>
        <div className="max-w-4xl mx-auto mt-12 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-700">Loading settings...</h2>
          </div>
        </div>
        <Footer />
      </>
    );
  }  
  return (
    <>
      <div className="max-w-4xl mx-auto mt-12 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-emerald-700">Settings</h2>
          
          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium mb-4">Account</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-gray-500">{currentUser.email}</p>
                  </div>
                  <button 
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={() => alert('Email change not supported in this version')}
                  >
                    Change
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-gray-500">••••••••</p>
                  </div>
                  <button 
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={() => alert('Password change not supported in this version')}
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>
              <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium mb-4">Data & Privacy</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Chat History</p>
                    <p className="text-sm text-gray-500">Clear all your chat messages</p>
                  </div>
                  <button 
                    className="px-4 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    onClick={() => setShowConfirmChat(true)}
                  >
                    Clear
                  </button>
                </div>
                
                {showConfirmChat && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="mb-4 text-red-600">Are you sure you want to clear all chat history? This cannot be undone.</p>
                    <div className="flex space-x-4">
                      <button 
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        onClick={() => setShowConfirmChat(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        onClick={handleClearChatHistory}
                      >
                        Yes, Clear All
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Disease Scan History</p>
                    <p className="text-sm text-gray-500">Clear all your disease detection scans</p>
                  </div>
                  <button 
                    className="px-4 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    onClick={() => setShowConfirmDisease(true)}
                  >
                    Clear
                  </button>
                </div>
                
                {showConfirmDisease && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="mb-4 text-red-600">Are you sure you want to clear all disease scan history? This cannot be undone.</p>
                    <div className="flex space-x-4">
                      <button 
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        onClick={() => setShowConfirmDisease(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        onClick={handleClearDiseaseScans}
                      >
                        Yes, Clear All
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Crop Plan History</p>
                    <p className="text-sm text-gray-500">Clear all your crop planning recommendations</p>
                  </div>
                  <button 
                    className="px-4 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    onClick={() => setShowConfirmCrop(true)}
                  >
                    Clear
                  </button>
                </div>
                
                {showConfirmCrop && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="mb-4 text-red-600">Are you sure you want to clear all crop plan history? This cannot be undone.</p>
                    <div className="flex space-x-4">
                      <button 
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        onClick={() => setShowConfirmCrop(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        onClick={handleClearCropPlans}
                      >
                        Yes, Clear All
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium mb-4">Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Language</p>
                    <p className="text-sm text-gray-500">Currently set to English</p>
                  </div>
                  <select 
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg"
                    disabled
                  >
                    <option>English</option>
                    <option>Hindi</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-sm text-gray-500">Email notifications for important updates</p>
                  </div>
                  <div className="relative inline-block w-12 align-middle select-none">
                    <input 
                      type="checkbox" 
                      name="toggle" 
                      id="toggle" 
                      className="sr-only"
                      disabled
                    />
                    <label 
                      htmlFor="toggle" 
                      className="block h-6 rounded-full bg-gray-300 cursor-pointer"
                    >
                      <span
                        className="block h-6 w-6 rounded-full bg-white shadow"
                      ></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sign out from all devices</p>
                    <p className="text-sm text-gray-500">End all active sessions</p>
                  </div>
                  <button 
                    className="px-4 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Delete Account</p>
                    <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                  </div>
                  <button 
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    onClick={() => alert('Account deletion not supported in this version')}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    <Footer />
    </>  );
};

export default Settings;
