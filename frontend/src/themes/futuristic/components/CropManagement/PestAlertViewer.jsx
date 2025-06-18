import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';

const PestAlertViewer = ({ sessionId }) => {
  const { getToken } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = getToken();
      const response = await axios.get(
        `http://127.0.0.1:8000/api/crop-management/pest-alerts/${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setAlerts(response.data);
      return true;
    } catch (err) {
      console.error('Error fetching pest alerts:', err);
      setError(err.response?.data?.detail || 'Failed to fetch pest alerts. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [sessionId]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchAlerts();
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'border-red-500 bg-red-900/30';
      case 'medium':
        return 'border-orange-500 bg-orange-900/30';
      case 'low':
        return 'border-yellow-500 bg-yellow-900/30';
      default:
        return 'border-gray-700 bg-gray-800/50';
    }
  };

  const getSeverityTextColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-orange-400';
      case 'low':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  if (isLoading && !isRefreshing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-cyan-400 flex items-center">
          <span className="text-lg mr-2">🛡️</span>
          Pest & Disease Scanner
        </h2>
        <div>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className={`px-4 py-2 rounded-lg transition-all ${
              isRefreshing
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/20'
            }`}
          >
            {isRefreshing ? 'Scanning...' : 'Scan for Threats'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-6 text-center">
          <div className="text-3xl mb-3">🌿</div>
          <h3 className="text-lg font-medium text-blue-300 mb-2">No Threats Detected</h3>
          <p className="text-blue-400">
            Your crop appears to be healthy. Automated monitoring systems will continue scanning for potential pest and disease threats.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`border rounded-lg p-5 backdrop-blur-sm ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <span className="mr-2">{alert.severity === 'high' ? '⚠️' : '🔍'}</span>
                    <span className={getSeverityTextColor(alert.severity)}>{alert.name}</span>
                  </h3>
                  <p className="text-sm text-gray-300 mb-3">{alert.description}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  alert.severity.toLowerCase() === 'high' ? 'bg-red-900/50 text-red-300 border border-red-500/50' :
                  alert.severity.toLowerCase() === 'medium' ? 'bg-orange-900/50 text-orange-300 border border-orange-500/50' :
                  'bg-yellow-900/50 text-yellow-300 border border-yellow-500/50'
                }`}>
                  {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} Threat Level
                </span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-700">
                <h4 className="text-sm font-medium text-cyan-400 mb-2">Recommended Action:</h4>
                <p className="text-sm text-gray-300">{alert.recommended_action}</p>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                Detected on: {new Date(alert.detection_date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-5">
        <h3 className="text-lg font-medium text-cyan-400 mb-3 flex items-center">
          <span className="text-lg mr-2">🔬</span>
          Advanced Threat Prevention Protocols
        </h3>
        <ul className="list-disc list-inside space-y-2 text-cyan-300">
          <li>Implement automated crop scanning on a daily basis</li>
          <li>Maintain optimal plant spacing for improved airflow patterns</li>
          <li>Deploy strategic crop rotation algorithms to disrupt pest cycles</li>
          <li>Utilize companion planting matrices for enhanced pest resistance</li>
          <li>Establish perimeter monitoring systems to detect early invasions</li>
        </ul>
      </div>
    </div>
  );
};

export default PestAlertViewer;
