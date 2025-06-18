import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';
import CropInitializationForm from './CropInitializationForm';
import CropLifecycleStages from './CropLifecycleStages';
import CropReminderScheduler from './CropReminderScheduler';
import PestAlertViewer from './PestAlertViewer';
import HarvestPredictor from './HarvestPredictor';
import FarmInputTracker from './FarmInputTracker';
import CropYieldRecorder from './CropYieldRecorder';
import ReportsGenerator from './ReportsGenerator';
import CropGraphicalView from './CropGraphicalView';
import CropComparisonTool from './CropComparisonTool';
import FarmAnalytics from './FarmAnalytics';
import AdvancedCharts from './AdvancedCharts';
import DetailedReports from './DetailedReports';
import AnalyticsPDFExport from './AnalyticsPDFExport.jsx';
import PersonalizedInsights from './PersonalizedInsights';

const CropManagementDashboard = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, getToken } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Function to fetch sessions
  const fetchSessions = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return { success: false, error: 'Authentication required' };    }
    
    try {
      const token = getToken();
      const response = await axios.get(
        'http://127.0.0.1:8000/api/crop-management/sessions',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error fetching crop sessions:', err);
      return {
        success: false,
        error: err.response?.data?.detail || 'Failed to fetch crop sessions'
      };
    }
  };
  
  // Function to fetch a specific session
  const fetchSession = async (id) => {
    if (!isAuthenticated) {
      navigate('/login');
      return { success: false, error: 'Authentication required' };
    }
      try {
      const token = getToken();
      const response = await axios.get(
        `http://127.0.0.1:8000/api/crop-management/sessions/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error(`Error fetching crop session ${id}:`, err);
      return {
        success: false,
        error: err.response?.data?.detail || 'Failed to fetch crop session'
      };
    }
  };
    // Display error message in a user-friendly way
  const displayError = (errorMsg) => {
    if (!errorMsg) return 'An unknown error occurred';
    
    // If errorMsg is an object, try to get error message in different ways
    if (typeof errorMsg === 'object') {
      if (errorMsg.message) return errorMsg.message;
      if (errorMsg.msg) return errorMsg.msg;
      return JSON.stringify(errorMsg);
    }
    
    return errorMsg;
  };
  
  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch all sessions
        const sessionsResult = await fetchSessions();
        
        if (sessionsResult.success) {
          setSessions(sessionsResult.data);
          
          // If sessionId is provided, fetch that specific session
          if (sessionId) {
            const sessionResult = await fetchSession(sessionId);
            
            if (sessionResult.success) {
              setCurrentSession(sessionResult.data);
            } else {
              setError(sessionResult.error);
            }
          }
        } else {
          setError(sessionsResult.error);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [isAuthenticated, navigate, getToken, sessionId]);
  
  // Select a session
  const handleSessionSelect = (selectedSessionId) => {
    navigate(`/crop-management/session/${selectedSessionId}`);
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black/90 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-black/90 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/30 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>              <div className="ml-3">
                <p className="text-sm text-red-400">{displayError(error)}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  // Render start new session page if no session is selected
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-black/90 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Advanced Crop Management
              </span>
            </h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Session List */}
            <div className="lg:col-span-1">
              <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6 mb-6">
                <h2 className="text-xl font-bold text-cyan-400 mb-4">Your Crop Sessions</h2>
                
                {sessions.length === 0 ? (
                  <p className="text-gray-400">No crop sessions found. Start a new one!</p>
                ) : (
                  <div className="space-y-3">
                    {sessions.map(session => (
                      <button
                        key={session.id}
                        onClick={() => handleSessionSelect(session.id)}
                        className="w-full flex items-start p-3 bg-gray-900/50 hover:bg-cyan-900/30 border border-gray-800 hover:border-cyan-800 rounded-lg transition-all text-left"
                      >
                        <div className="flex-shrink-0 bg-cyan-900/50 text-cyan-500 p-2 rounded-full">
                          🌾
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-cyan-300">
                            {session.crop_name.charAt(0).toUpperCase() + session.crop_name.slice(1)}
                          </p>
                          <p className="text-xs text-gray-400">
                            Sowed: {new Date(session.sowing_date).toLocaleDateString()}
                          </p>
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              session.status === 'active' ? 'bg-green-900/50 text-green-400' :
                              session.status === 'completed' ? 'bg-blue-900/50 text-blue-400' :
                              'bg-gray-800 text-gray-400'
                            }`}>
                              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <button
                    onClick={() => navigate('/crop-management')}
                    className="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all"
                  >
                    + Initialize New Crop Tracking
                  </button>
                </div>
              </div>
            </div>
            
            {/* New Session Form */}
            <div className="lg:col-span-2">
              <CropInitializationForm />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render session dashboard
  return (
    <div className="min-h-screen bg-black/90 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {currentSession?.crop_name.charAt(0).toUpperCase() + currentSession?.crop_name.slice(1)} Tracking
              </span>
            </h1>
            <p className="text-gray-400">
              Sowing Date: {new Date(currentSession?.sowing_date).toLocaleDateString()} | 
              Land Size: {currentSession?.land_size} {currentSession?.land_size_unit}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/crop-management')}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Switch Session
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all"
            >
              Refresh Data
            </button>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-1 bg-gray-900/70 backdrop-blur-sm rounded-lg p-1 border border-gray-800 min-w-max">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-cyan-400 hover:bg-gray-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('lifecycle')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'lifecycle'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-cyan-400 hover:bg-gray-800'
              }`}
            >
              Lifecycle Stages
            </button>
            <button
              onClick={() => setActiveTab('reminders')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'reminders'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-cyan-400 hover:bg-gray-800'
              }`}
            >
              Reminders
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'alerts'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-cyan-400 hover:bg-gray-800'
              }`}
            >
              Pest Alerts
            </button>
            <button
              onClick={() => setActiveTab('inputs')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'inputs'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-cyan-400 hover:bg-gray-800'
              }`}
            >
              Farm Inputs
            </button>
            <button
              onClick={() => setActiveTab('harvest')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'harvest'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-cyan-400 hover:bg-gray-800'
              }`}
            >
              Harvest
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'reports'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-cyan-400 hover:bg-gray-800'
              }`}
            >
              Reports
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-cyan-400 hover:bg-gray-800'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center">
                <span className="text-lg mr-2">📊</span>
                Session Overview
              </h2>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-emerald-900/30 rounded-lg p-4 border border-emerald-500/30">
                  <h3 className="text-sm font-medium text-emerald-400 mb-1">Crop Status</h3>
                  <p className="text-2xl font-bold text-emerald-300">
                    {currentSession?.status.charAt(0).toUpperCase() + currentSession?.status.slice(1)}
                  </p>
                </div>
                
                <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
                  <h3 className="text-sm font-medium text-blue-400 mb-1">Current Stage</h3>
                  <p className="text-2xl font-bold text-blue-300">
                    Loading...
                  </p>
                </div>
                
                <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/30">
                  <h3 className="text-sm font-medium text-purple-400 mb-1">Estimated Harvest</h3>
                  <p className="text-2xl font-bold text-purple-300">
                    Loading...
                  </p>
                </div>
              </div>
              
              <p className="text-gray-300 mb-4">
                Select a module above to manage different aspects of your crop tracking session.
              </p>
              
              {/* Jump Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                <button
                  onClick={() => setActiveTab('lifecycle')}
                  className="p-4 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-cyan-800 hover:bg-cyan-900/20 transition-all"
                >
                  <div className="text-lg mb-2">🌱</div>
                  <h3 className="text-sm font-medium text-cyan-300">Lifecycle Stages</h3>
                  <p className="text-xs text-gray-400 mt-1">View and manage growth stages</p>
                </button>
                
                <button
                  onClick={() => setActiveTab('reminders')}
                  className="p-4 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-cyan-800 hover:bg-cyan-900/20 transition-all"
                >
                  <div className="text-lg mb-2">🔔</div>
                  <h3 className="text-sm font-medium text-cyan-300">Reminders</h3>
                  <p className="text-xs text-gray-400 mt-1">Schedule and track tasks</p>
                </button>
                
                <button
                  onClick={() => setActiveTab('inputs')}
                  className="p-4 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-cyan-800 hover:bg-cyan-900/20 transition-all"
                >
                  <div className="text-lg mb-2">📝</div>
                  <h3 className="text-sm font-medium text-cyan-300">Farm Inputs</h3>
                  <p className="text-xs text-gray-400 mt-1">Record fertilizer, irrigation, etc.</p>
                </button>
                
                <button
                  onClick={() => setActiveTab('reports')}
                  className="p-4 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-cyan-800 hover:bg-cyan-900/20 transition-all"
                >
                  <div className="text-lg mb-2">📊</div>
                  <h3 className="text-sm font-medium text-cyan-300">Reports & Analytics</h3>
                  <p className="text-xs text-gray-400 mt-1">View insights and performance</p>
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'lifecycle' && (
            <CropLifecycleStages sessionId={sessionId} />
          )}
          
          {activeTab === 'reminders' && (
            <CropReminderScheduler sessionId={sessionId} />
          )}
          
          {activeTab === 'alerts' && (
            <PestAlertViewer sessionId={sessionId} />
          )}
          
          {activeTab === 'inputs' && (
            <FarmInputTracker sessionId={sessionId} />
          )}
          
          {activeTab === 'harvest' && (
            <div>
              <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center">
                <span className="text-lg mr-2">🌾</span>
                Harvest Management
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <HarvestPredictor sessionId={sessionId} />
                <CropYieldRecorder sessionId={sessionId} />
              </div>
            </div>
          )}
            {activeTab === 'reports' && (
            <ReportsGenerator sessionId={sessionId} />
          )}
            {activeTab === 'analytics' && (
            <div>
              <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center">
                <span className="text-lg mr-2">📈</span>
                Crop Analytics
              </h2>
              
              <div className="space-y-8">
                <FarmAnalytics sessionId={sessionId} />
                <DetailedReports sessionId={sessionId} />
                <AdvancedCharts sessionId={sessionId} />
                <PersonalizedInsights sessionId={sessionId} />
                <AnalyticsPDFExport sessionId={sessionId} />
                <CropGraphicalView sessionId={sessionId} />
                <CropComparisonTool sessionId={sessionId} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropManagementDashboard;
