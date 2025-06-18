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
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading && !isRefreshing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Pest & Disease Alerts</h2>
        <div>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isRefreshing
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isRefreshing ? 'Refreshing...' : 'Check for New Alerts'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="text-3xl mb-3">🌿</div>
          <h3 className="text-lg font-medium text-blue-800 mb-2">No Pest Alerts Detected</h3>
          <p className="text-blue-600">
            Your crop appears to be healthy. We'll continue monitoring for potential pest and disease threats.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`border rounded-lg p-5 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <span className="mr-2">{alert.severity === 'high' ? '⚠️' : '🐛'}</span>
                    {alert.name}
                  </h3>
                  <p className="text-sm mb-3">{alert.description}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  alert.severity.toLowerCase() === 'high' ? 'bg-red-200 text-red-800' :
                  alert.severity.toLowerCase() === 'medium' ? 'bg-orange-200 text-orange-800' :
                  'bg-yellow-200 text-yellow-800'
                }`}>
                  {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} Severity
                </span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium mb-2">Recommended Action:</h4>
                <p className="text-sm">{alert.recommended_action}</p>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                Detected on: {new Date(alert.detection_date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-5">
        <h3 className="text-lg font-medium text-green-800 mb-3">Best Practices for Pest Prevention</h3>
        <ul className="list-disc list-inside space-y-2 text-green-700">
          <li>Regularly inspect your crops for signs of pests or diseases</li>
          <li>Maintain proper spacing between plants for good air circulation</li>
          <li>Use crop rotation to break pest cycles</li>
          <li>Consider companion planting to repel common pests</li>
          <li>Keep the area around your crops clean and free of debris</li>
        </ul>
      </div>
    </div>
  );
};

export default PestAlertViewer;
