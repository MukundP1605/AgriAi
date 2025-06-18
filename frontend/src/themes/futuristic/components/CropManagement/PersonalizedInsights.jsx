import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';
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
      bg: 'bg-gradient-to-br from-red-900/20 to-pink-900/20',
      border: 'border-red-400/50',
      icon: 'text-red-400',
      badge: 'bg-red-500/20 text-red-300 border border-red-400/30'
    },
    medium: {
      bg: 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20',
      border: 'border-yellow-400/50',
      icon: 'text-yellow-400',
      badge: 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
    },
    low: {
      bg: 'bg-gradient-to-br from-green-900/20 to-emerald-900/20',
      border: 'border-green-400/50',
      icon: 'text-green-400',
      badge: 'bg-green-500/20 text-green-300 border border-green-400/30'
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
    if (confidence >= 90) return 'text-green-300 bg-green-500/20 border border-green-400/30';
    if (confidence >= 75) return 'text-cyan-300 bg-cyan-500/20 border border-cyan-400/30';
    if (confidence >= 60) return 'text-yellow-300 bg-yellow-500/20 border border-yellow-400/30';
    return 'text-red-300 bg-red-500/20 border border-red-400/30';
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
      <div className="p-6 bg-gradient-to-br from-slate-900 to-purple-900 rounded-lg shadow-2xl border border-cyan-500/30">
        <div className="flex items-center space-x-2 mb-6">
          <LightBulbIcon className="h-8 w-8 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">Personalized Insights</h2>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-900 to-purple-900 rounded-lg shadow-2xl border border-cyan-500/30">
        <div className="flex items-center space-x-2 mb-6">
          <LightBulbIcon className="h-8 w-8 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">Personalized Insights</h2>
        </div>
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-900 to-purple-900 rounded-lg shadow-2xl border border-cyan-500/30">
        <div className="flex items-center space-x-2 mb-6">
          <LightBulbIcon className="h-8 w-8 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">Personalized Insights</h2>
        </div>
        <div className="text-center text-gray-400 py-8">
          No personalized insights available
        </div>
      </div>
    );
  }

  const filteredInsights = getFilteredInsights();

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 to-purple-900 rounded-lg shadow-2xl border border-cyan-500/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <LightBulbIcon className="h-8 w-8 text-cyan-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Personalized Insights</h2>
            <p className="text-gray-300">AI-powered recommendations tailored to your farming practices</p>
          </div>
        </div>
        <div className="text-sm text-gray-400">
          {filteredInsights.length} insight{filteredInsights.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 p-4 rounded-lg border border-blue-500/30 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-sm text-blue-300 font-medium">Total Insights</p>
              <p className="text-xl font-bold text-blue-200">{insights.total_insights}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 p-4 rounded-lg border border-green-500/30 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-sm text-green-300 font-medium">High Priority</p>
              <p className="text-xl font-bold text-green-200">{insights.high_priority_count}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 p-4 rounded-lg border border-purple-500/30 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <ArrowTrendingUpIcon className="h-8 w-8 text-purple-400" />
            <div>
              <p className="text-sm text-purple-300 font-medium">Avg Confidence</p>
              <p className="text-xl font-bold text-purple-200">{insights.avg_confidence}%</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/30 p-4 rounded-lg border border-orange-500/30 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <StarIcon className="h-8 w-8 text-orange-400" />
            <div>
              <p className="text-sm text-orange-300 font-medium">Favorites</p>
              <p className="text-xl font-bold text-orange-200">{favoriteInsights.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-600/50 mb-6">
        <nav className="-mb-px flex space-x-8">
          {insightTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveInsightType(type.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeInsightType === type.id
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
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
              className={`${priority.bg} ${priority.border} border-l-4 p-6 rounded-lg transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 backdrop-blur-sm`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-slate-800/50 shadow-lg border border-cyan-500/30`}>
                    <IconComponent className={`h-6 w-6 ${priority.icon}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{insight.title}</h3>
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
                      ? 'text-yellow-400 hover:text-yellow-300' 
                      : 'text-gray-500 hover:text-yellow-400'
                  }`}
                >
                  <StarIcon className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <p className="text-gray-200 leading-relaxed">{insight.description}</p>

                {/* Action Steps */}
                {insight.action_steps && (
                  <div>
                    <h4 className="font-medium text-white mb-2">Recommended Actions:</h4>
                    <ul className="space-y-1">
                      {insight.action_steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start space-x-2 text-sm text-gray-300">
                          <span className="text-cyan-400 mt-1">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Expected Impact */}
                {insight.expected_impact && (
                  <div className="bg-slate-800/30 p-3 rounded-lg border border-cyan-500/20">
                    <div className="flex items-center space-x-2">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-cyan-400" />
                      <span className="font-medium text-white">Expected Impact:</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{insight.expected_impact}</p>
                  </div>
                )}

                {/* Timing */}
                {insight.timing && (
                  <div className="flex items-center space-x-2 text-sm text-gray-300">
                    <ClockIcon className="h-4 w-4" />
                    <span>Best timing: {insight.timing}</span>
                  </div>
                )}

                {/* Resource Requirements */}
                {insight.resources_needed && (
                  <div className="text-sm text-gray-300">
                    <span className="font-medium">Resources needed:</span> {insight.resources_needed}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-600/50">
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <span>Generated: {formatDate(insight.generated_at)}</span>
                  {insight.source && <span>Source: {insight.source}</span>}
                </div>
                
                {insight.learn_more_url && (
                  <a
                    href={insight.learn_more_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-sm text-cyan-400 hover:text-cyan-300"
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
          <LightBulbIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No insights available</h3>
          <p className="text-gray-400 mb-6">
            {activeInsightType === 'all' 
              ? 'No personalized insights have been generated yet.' 
              : `No insights available for ${insightTypes.find(t => t.id === activeInsightType)?.name}.`}
          </p>
          <button
            onClick={fetchPersonalizedInsights}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition duration-300 border border-cyan-500/30"
          >
            <FireIcon className="h-4 w-4" />
            <span>Generate New Insights</span>
          </button>
        </div>
      )}

      {/* AI Disclaimer */}
      <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg backdrop-blur-sm">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-200">
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
