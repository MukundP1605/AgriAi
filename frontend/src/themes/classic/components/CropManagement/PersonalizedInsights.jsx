import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  LightBulbIcon,
  StarIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  BeakerIcon,
  SunIcon,
  CloudIcon,
  SparklesIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const PersonalizedInsights = ({ sessionId }) => {
  const { getToken } = useAuth();
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeInsightType, setActiveInsightType] = useState('all');
  const [favoriteInsights, setFavoriteInsights] = useState([]);

  const insightTypes = [
    { id: 'all', name: 'All Insights', icon: LightBulbIcon },
    { id: 'optimization', name: 'Optimization', icon: ArrowTrendingUpIcon },
    { id: 'risk_management', name: 'Risk Management', icon: ShieldCheckIcon },
    { id: 'weather_tips', name: 'Weather Tips', icon: CloudIcon },
    { id: 'nutrition', name: 'Nutrition', icon: BeakerIcon },
    { id: 'financial', name: 'Financial', icon: CurrencyDollarIcon }
  ];

  const priorityColors = {
    high: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      badge: 'bg-red-100 text-red-800'
    },
    medium: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      badge: 'bg-yellow-100 text-yellow-800'
    },
    low: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      badge: 'bg-green-100 text-green-800'
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchPersonalizedInsights();
      loadFavoriteInsights();
    }
  }, [sessionId]);

  const fetchPersonalizedInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = getToken();
      const response = await axios.get(
        `http://127.0.0.1:8000/api/crop-management/insights/${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setInsights(response.data);
    } catch (err) {
      console.error('Error fetching personalized insights:', err);
      setError(err.response?.data?.detail || 'Failed to fetch personalized insights. Please ensure all data is recorded.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFavoriteInsights = () => {
    const saved = localStorage.getItem(`favorite_insights_${sessionId}`);
    if (saved) {
      setFavoriteInsights(JSON.parse(saved));
    }
  };

  const toggleFavorite = (insightId) => {
    const newFavorites = favoriteInsights.includes(insightId)
      ? favoriteInsights.filter(id => id !== insightId)
      : [...favoriteInsights, insightId];
    
    setFavoriteInsights(newFavorites);
    localStorage.setItem(`favorite_insights_${sessionId}`, JSON.stringify(newFavorites));
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'optimization':
        return ArrowTrendingUpIcon;
      case 'risk_management':
        return ShieldCheckIcon;
      case 'weather_tips':
        return CloudIcon;
      case 'nutrition':
        return BeakerIcon;
      case 'financial':
        return CurrencyDollarIcon;
      case 'timing':
        return CalendarIcon;
      case 'water_management':
        return SunIcon;
      case 'soil_health':
        return SparklesIcon;
      default:
        return LightBulbIcon;
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 75) return 'text-blue-600 bg-blue-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFilteredInsights = () => {
    if (!insights?.recommendations) return [];
    
    if (activeInsightType === 'all') {
      return insights.recommendations;
    }
    
    return insights.recommendations.filter(insight => insight.category === activeInsightType);
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center space-x-2 mb-6">
          <LightBulbIcon className="h-8 w-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Personalized Insights</h2>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center space-x-2 mb-6">
          <LightBulbIcon className="h-8 w-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Personalized Insights</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center space-x-2 mb-6">
          <LightBulbIcon className="h-8 w-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Personalized Insights</h2>
        </div>
        <div className="text-center text-gray-500 py-8">
          No personalized insights available
        </div>
      </div>
    );
  }

  const filteredInsights = getFilteredInsights();

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <LightBulbIcon className="h-8 w-8 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Personalized Insights</h2>
            <p className="text-gray-600">AI-powered recommendations tailored to your farming practices</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {filteredInsights.length} insight{filteredInsights.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Insights</p>
              <p className="text-xl font-bold text-blue-800">{insights.total_insights}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-green-600 font-medium">High Priority</p>
              <p className="text-xl font-bold text-green-800">{insights.high_priority_count}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-purple-600 font-medium">Avg Confidence</p>
              <p className="text-xl font-bold text-purple-800">{insights.avg_confidence}%</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <StarIcon className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-orange-600 font-medium">Favorites</p>
              <p className="text-xl font-bold text-orange-800">{favoriteInsights.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {insightTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveInsightType(type.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeInsightType === type.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <type.icon className="h-5 w-5" />
              <span>{type.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInsights.map((insight, index) => {
          const IconComponent = getInsightIcon(insight.category);
          const priority = priorityColors[insight.priority] || priorityColors.low;
          const isFavorite = favoriteInsights.includes(insight.id);

          return (
            <div
              key={insight.id || index}
              className={`${priority.bg} ${priority.border} border-l-4 p-6 rounded-lg transition-all duration-300 hover:shadow-lg`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                    <IconComponent className={`h-6 w-6 ${priority.icon}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${priority.badge}`}>
                        {insight.priority} priority
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConfidenceColor(insight.confidence)}`}>
                        {insight.confidence}% confidence
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => toggleFavorite(insight.id)}
                  className={`p-2 rounded-full transition-colors ${
                    isFavorite 
                      ? 'text-yellow-500 hover:text-yellow-600' 
                      : 'text-gray-400 hover:text-yellow-500'
                  }`}
                >
                  <StarIcon className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <p className="text-gray-700 leading-relaxed">{insight.description}</p>

                {/* Action Steps */}
                {insight.action_steps && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Recommended Actions:</h4>
                    <ul className="space-y-1">
                      {insight.action_steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start space-x-2 text-sm text-gray-600">
                          <span className="text-green-600 mt-1">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Expected Impact */}
                {insight.expected_impact && (
                  <div className="bg-white bg-opacity-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-gray-900">Expected Impact:</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{insight.expected_impact}</p>
                  </div>
                )}

                {/* Timing */}
                {insight.timing && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4" />
                    <span>Best timing: {insight.timing}</span>
                  </div>
                )}

                {/* Resource Requirements */}
                {insight.resources_needed && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Resources needed:</span> {insight.resources_needed}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Generated: {formatDate(insight.generated_at)}</span>
                  {insight.source && <span>Source: {insight.source}</span>}
                </div>
                
                {insight.learn_more_url && (
                  <a
                    href={insight.learn_more_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <InformationCircleIcon className="h-4 w-4" />
                    <span>Learn More</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredInsights.length === 0 && (
        <div className="text-center py-12">
          <LightBulbIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No insights available</h3>
          <p className="text-gray-500 mb-6">
            {activeInsightType === 'all' 
              ? 'No personalized insights have been generated yet.' 
              : `No insights available for ${insightTypes.find(t => t.id === activeInsightType)?.name}.`}
          </p>
          <button
            onClick={fetchPersonalizedInsights}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
          >
            <FireIcon className="h-4 w-4" />
            <span>Generate New Insights</span>
          </button>
        </div>
      )}

      {/* AI Disclaimer */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">AI-Generated Insights</p>
            <p>
              These insights are generated by AI based on your farming data and best practices. 
              Always consult with agricultural experts for critical decisions and verify recommendations 
              with local conditions and regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedInsights;
