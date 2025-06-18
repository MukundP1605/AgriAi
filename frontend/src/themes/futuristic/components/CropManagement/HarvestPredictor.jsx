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
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getConfidenceGradient = (score) => {
    if (score >= 0.8) return 'from-green-500 to-emerald-700';
    if (score >= 0.6) return 'from-yellow-500 to-amber-700';
    return 'from-orange-500 to-red-700';
  };

  const getConfidenceText = (score) => {
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Moderate';
    return 'Variable';
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
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-medium text-cyan-400 mb-4 flex items-center">
          <span className="text-lg mr-2">📊</span>
          Harvest Prediction Algorithm
        </h3>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-medium text-cyan-400 mb-4 flex items-center">
          <span className="text-lg mr-2">📊</span>
          Harvest Prediction Algorithm
        </h3>
        <div className="bg-red-900/30 border-l-4 border-red-500 p-4">
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
        <div className="mt-4">
          <button
            onClick={refreshPrediction}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
          >
            Recalculate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg shadow-cyan-500/5 p-6">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-lg font-medium text-cyan-400 flex items-center">
          <span className="text-lg mr-2">📊</span>
          Harvest Prediction Algorithm
        </h3>
        <button
          onClick={refreshPrediction}
          className="text-cyan-500 text-sm hover:text-cyan-400 transition-colors"
        >
          Recalculate
        </button>
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-center mb-6">
          <div className="flex flex-col items-center">
            <div className="relative h-36 w-36 flex items-center justify-center">
              <svg className="absolute" width="144" height="144" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="12"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  strokeDasharray="339.292"
                  strokeDashoffset={339.292 * (1 - prediction.confidence_score)}
                  transform="rotate(-90 60 60)"
                >
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" className={`stop-color-start ${
                        prediction.confidence_score >= 0.8 ? 'text-green-500' :
                        prediction.confidence_score >= 0.6 ? 'text-yellow-500' : 'text-orange-500'
                      }`} />
                      <stop offset="100%" className={`stop-color-end ${
                        prediction.confidence_score >= 0.8 ? 'text-emerald-700' :
                        prediction.confidence_score >= 0.6 ? 'text-amber-700' : 'text-red-700'
                      }`} />
                    </linearGradient>
                  </defs>
                </circle>
              </svg>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent
                  ${getConfidenceGradient(prediction.confidence_score)}">
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
          <div className="bg-emerald-900/20 rounded-lg p-4 text-center border border-emerald-500/30">
            <div className="text-sm text-emerald-400 mb-1">Predicted Harvest Date</div>
            <div className="text-lg font-semibold text-emerald-300">
              {formatDate(prediction.predicted_harvest_date)}
            </div>
          </div>
          
          <div className="bg-blue-900/20 rounded-lg p-4 text-center border border-blue-500/30">
            <div className="text-sm text-blue-400 mb-1">Expected Completion</div>
            <div className="text-lg font-semibold text-blue-300">
              {formatDate(prediction.expected_end_date)}
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 mt-4 border border-gray-700">
          <h4 className="text-sm font-medium text-cyan-400 mb-2">Analysis Parameters:</h4>
          <ul className="list-disc list-inside space-y-1">
            {prediction.factors.map((factor, index) => (
              <li key={index} className="text-sm text-gray-300">{factor}</li>
            ))}
          </ul>
        </div>
        
        <div className="mt-4 text-sm text-gray-400">
          <p>
            <span className="font-medium text-cyan-400">System Note:</span> Predictions are dynamically calculated based on 
            environmental telemetry, growth metrics, and historical data patterns. Accuracy increases as more data points are collected.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HarvestPredictor;
