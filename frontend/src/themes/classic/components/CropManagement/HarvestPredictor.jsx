import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';

const HarvestPredictor = ({ sessionId }) => {
  const { getToken } = useAuth();
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchHarvestPrediction = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = getToken();
        const response = await axios.get(
          `http://127.0.0.1:8000/api/crop-management/harvest-prediction/${sessionId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        setPrediction(response.data);
      } catch (err) {
        console.error('Error fetching harvest prediction:', err);
        setError(err.response?.data?.detail || 'Failed to fetch harvest prediction. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHarvestPrediction();
  }, [sessionId, getToken, refreshKey]);

  const refreshPrediction = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  const getConfidenceColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getConfidenceText = (score) => {
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Medium';
    return 'Low';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Harvest Prediction</h3>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Harvest Prediction</h3>
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
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
        <div className="mt-4">
          <button
            onClick={refreshPrediction}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-lg font-medium text-gray-900">Harvest Prediction</h3>
        <button
          onClick={refreshPrediction}
          className="text-emerald-600 text-sm hover:text-emerald-800"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-center mb-6">
          <div className="flex flex-col items-center">
            <div className="relative h-32 w-32 flex items-center justify-center">
              <svg className="absolute" width="128" height="128" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="12"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke={
                    prediction.confidence_score >= 0.8 ? '#059669' :
                    prediction.confidence_score >= 0.6 ? '#ca8a04' : '#f97316'
                  }
                  strokeWidth="12"
                  strokeDasharray="339.292"
                  strokeDashoffset={339.292 * (1 - prediction.confidence_score)}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">
                  {Math.round(prediction.confidence_score * 100)}%
                </div>
                <div className={`text-sm font-medium ${getConfidenceColor(prediction.confidence_score)}`}>
                  {getConfidenceText(prediction.confidence_score)} Confidence
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-50 rounded-lg p-4 text-center">
            <div className="text-sm text-emerald-800 mb-1">Predicted Harvest Date</div>
            <div className="text-lg font-semibold text-emerald-700">
              {formatDate(prediction.predicted_harvest_date)}
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-sm text-blue-800 mb-1">Expected Completion</div>
            <div className="text-lg font-semibold text-blue-700">
              {formatDate(prediction.expected_end_date)}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Factors Considered:</h4>
          <ul className="list-disc list-inside space-y-1">
            {prediction.factors.map((factor, index) => (
              <li key={index} className="text-sm text-gray-600">{factor}</li>
            ))}
          </ul>
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          <p>
            <span className="font-medium">Note:</span> Harvest predictions are estimates and may vary based on actual 
            weather conditions, management practices, and other environmental factors.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HarvestPredictor;
