import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  ChevronDownIcon, 
  ChevronRightIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const DetailedReports = ({ sessionId }) => {
  const { getToken } = useAuth();
  const [detailedReports, setDetailedReports] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedAccordions, setExpandedAccordions] = useState({
    timeline: true,
    performance: false,
    financial: false,
    recommendations: false
  });

  useEffect(() => {
    if (sessionId) {
      fetchDetailedReports();
    }
  }, [sessionId]);

  const fetchDetailedReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = getToken();
      const response = await axios.get(
        `http://127.0.0.1:8000/api/crop-management/detailed-reports/${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setDetailedReports(response.data);
    } catch (err) {
      console.error('Error fetching detailed reports:', err);
      setError(err.response?.data?.detail || 'Failed to fetch detailed reports. Please ensure all data is recorded.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAccordion = (section) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR' 
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
      case 'good':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
      case 'fair':
        return 'text-yellow-600 bg-yellow-100';
      case 'delayed':
      case 'poor':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center space-x-2 mb-6">
          <DocumentTextIcon className="h-8 w-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Detailed Reports</h2>
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
          <DocumentTextIcon className="h-8 w-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Detailed Reports</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!detailedReports) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center space-x-2 mb-6">
          <DocumentTextIcon className="h-8 w-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Detailed Reports</h2>
        </div>
        <div className="text-center text-gray-500 py-8">
          No detailed report data available
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <DocumentTextIcon className="h-8 w-8 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Detailed Reports</h2>
            <p className="text-gray-600">Comprehensive analysis of your crop management session</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Generated: {formatDate(detailedReports.generated_at)}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'timeline', name: 'Timeline', icon: CalendarIcon },
            { id: 'performance', name: 'Performance', icon: ArrowTrendingUpIcon },
            { id: 'financial', name: 'Financial', icon: CurrencyDollarIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeSection === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content Sections */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Total Yield</p>
                  <p className="text-2xl font-bold text-green-800">
                    {detailedReports.total_yield} {detailedReports.yield_unit}
                  </p>
                </div>
                <CheckCircleIcon className="h-10 w-10 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Session Duration</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {detailedReports.session_duration} days
                  </p>
                </div>
                <ClockIcon className="h-10 w-10 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Overall Rating</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {detailedReports.overall_rating}/5
                  </p>
                </div>
                <ArrowTrendingUpIcon className="h-10 w-10 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Performance Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {detailedReports.key_metrics?.map((metric, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{metric.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                      {metric.status}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-gray-800">{metric.value}</div>
                  {metric.change && (
                    <div className={`text-sm ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}% from target
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'timeline' && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Crop Lifecycle Timeline</h3>
            <div className="space-y-4">
              {detailedReports.timeline?.map((event, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(event.status)}`}>
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <h4 className="text-md font-medium text-gray-800">{event.stage}</h4>
                      <span className="text-sm text-gray-500">{formatDate(event.date)}</span>
                    </div>
                    <p className="text-gray-600 mt-1">{event.description}</p>
                    {event.notes && (
                      <p className="text-sm text-gray-500 mt-2 italic">{event.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'performance' && (
        <div className="space-y-6">
          {/* Performance Metrics Accordion */}
          <div className="space-y-4">
            {/* Yield Performance */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleAccordion('performance')}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
              >
                <h3 className="text-lg font-semibold text-gray-800">Yield Performance Analysis</h3>
                {expandedAccordions.performance ? (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {expandedAccordions.performance && (
                <div className="px-6 pb-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Yield Comparison</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Actual Yield:</span>
                          <span className="font-medium">{detailedReports.actual_yield} {detailedReports.yield_unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expected Yield:</span>
                          <span className="font-medium">{detailedReports.expected_yield} {detailedReports.yield_unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Variance:</span>
                          <span className={`font-medium ${detailedReports.yield_variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {detailedReports.yield_variance >= 0 ? '+' : ''}{detailedReports.yield_variance}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Quality Metrics</h4>
                      <div className="space-y-2">
                        {detailedReports.quality_metrics?.map((metric, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-gray-600">{metric.name}:</span>
                            <span className={`font-medium ${getStatusColor(metric.rating).split(' ')[0]}`}>
                              {metric.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleAccordion('recommendations')}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
              >
                <h3 className="text-lg font-semibold text-gray-800">Recommendations & Insights</h3>
                {expandedAccordions.recommendations ? (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {expandedAccordions.recommendations && (
                <div className="px-6 pb-4 border-t border-gray-200">
                  <div className="mt-4 space-y-4">
                    {detailedReports.recommendations?.map((recommendation, index) => (
                      <div key={index} className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                              recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {recommendation.priority} priority
                            </span>
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-medium text-gray-800">{recommendation.title}</h4>
                            <p className="text-gray-600 mt-1">{recommendation.description}</p>
                            {recommendation.expected_impact && (
                              <p className="text-sm text-blue-600 mt-2">
                                Expected impact: {recommendation.expected_impact}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'financial' && (
        <div className="space-y-6">
          {/* Financial Analysis Accordion */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleAccordion('financial')}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
            >
              <h3 className="text-lg font-semibold text-gray-800">Financial Analysis</h3>
              {expandedAccordions.financial ? (
                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRightIcon className="h-5 w-5 text-gray-500" />
              )}
            </button>
            {expandedAccordions.financial && (
              <div className="px-6 pb-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {/* Cost Analysis */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Cost Breakdown</h4>
                    <div className="space-y-3">
                      {detailedReports.cost_breakdown && Object.entries(detailedReports.cost_breakdown).map(([category, amount]) => (
                        <div key={category} className="flex justify-between items-center">
                          <span className="text-gray-600 capitalize">{category}:</span>
                          <span className="font-medium">{formatCurrency(amount)}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex justify-between items-center font-semibold">
                          <span className="text-gray-800">Total Cost:</span>
                          <span className="text-gray-800">{formatCurrency(detailedReports.total_cost)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Analysis */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Revenue Analysis</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Revenue:</span>
                        <span className="font-medium">{formatCurrency(detailedReports.total_revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Net Profit:</span>
                        <span className={`font-medium ${detailedReports.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(detailedReports.net_profit)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Profit Margin:</span>
                        <span className={`font-medium ${detailedReports.profit_margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {detailedReports.profit_margin?.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ROI:</span>
                        <span className={`font-medium ${detailedReports.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {detailedReports.roi?.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailedReports;
