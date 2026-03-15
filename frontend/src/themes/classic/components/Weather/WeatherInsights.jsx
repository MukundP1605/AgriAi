import React from 'react';
import { useWeather } from '../../../../context/WeatherContext';
import {
  LightBulbIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  FireIcon,
  ShieldCheckIcon,
  SunIcon,
  CloudIcon,
  BeakerIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const WeatherInsights = ({ className = '' }) => {
  const { getAgriculturalInsights, isLoading, error } = useWeather();
  
  const insights = getAgriculturalInsights();

  const getInsightIcon = (category) => {
    switch (category) {
      case 'temperature': return FireIcon;
      case 'humidity': return BeakerIcon;
      case 'wind': return EyeIcon;
      case 'uv': return SunIcon;
      case 'precipitation': return CloudIcon;
      case 'growth': return CheckCircleIcon;
      default: return LightBulbIcon;
    }
  };

  const getInsightColor = (type, priority) => {
    if (type === 'warning') {
      return priority === 'high' 
        ? 'bg-red-50 border-red-200 text-red-800'
        : 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
    return 'bg-blue-50 border-blue-200 text-blue-800';
  };

  const getInsightIconColor = (type, priority) => {
    if (type === 'warning') {
      return priority === 'high' ? 'text-red-600' : 'text-yellow-600';
    }
    return 'text-blue-600';
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || insights.length === 0) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <LightBulbIcon className="h-6 w-6 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-800">Weather Insights</h3>
        </div>
        <p className="text-gray-600">
          {error ? 'Unable to load weather insights' : 'No insights available at this time'}
        </p>
      </div>
    );
  }

  // Sort insights by priority
  const sortedInsights = insights.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
  });

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <LightBulbIcon className="h-6 w-6 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-800">Agricultural Weather Insights</h3>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {insights.length} insights
        </span>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {sortedInsights.map((insight, index) => {
          const IconComponent = getInsightIcon(insight.category);
          const insightColorClass = getInsightColor(insight.type, insight.priority);
          const iconColorClass = getInsightIconColor(insight.type, insight.priority);
          const priorityBadgeColor = getPriorityBadgeColor(insight.priority);

          return (
            <div 
              key={index}
              className={`p-4 rounded-lg border-l-4 ${insightColorClass}`}
            >
              <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <IconComponent className={`h-5 w-5 ${iconColorClass}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      {insight.title}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityBadgeColor}`}>
                      {insight.priority}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {insight.message}
                  </p>

                  {/* Category Tag */}
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white bg-opacity-50 text-gray-600 capitalize">
                      {insight.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-red-600">
              {insights.filter(i => i.priority === 'high').length}
            </div>
            <div className="text-xs text-gray-500">High Priority</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-yellow-600">
              {insights.filter(i => i.priority === 'medium').length}
            </div>
            <div className="text-xs text-gray-500">Medium Priority</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {insights.filter(i => i.priority === 'low').length}
            </div>
            <div className="text-xs text-gray-500">Low Priority</div>
          </div>
        </div>
      </div>

      {/* Action Suggestions */}
      {insights.some(i => i.priority === 'high') && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">
              Immediate Action Required
            </span>
          </div>
          <p className="text-xs text-red-700 mt-1">
            You have high-priority weather alerts that may affect your crops. Review and take appropriate action.
          </p>
        </div>
      )}
    </div>
  );
};

export default WeatherInsights;