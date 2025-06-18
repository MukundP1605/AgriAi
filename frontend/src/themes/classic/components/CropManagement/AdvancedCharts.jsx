import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter
} from 'recharts';
import {
  ChartBarIcon,
  ClockIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

const AdvancedCharts = ({ sessionId }) => {
  const { getToken } = useAuth();
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState('growth-trends');
  const [timeRange, setTimeRange] = useState('all');
  const [viewMode, setViewMode] = useState('interactive');
  const [insightsData, setInsightsData] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(true);

  // Helper function to safely access nested properties
  const safeAccess = (obj, path, fallback = null) => {
    try {
      const result = path.split('.').reduce((o, key) => o?.[key], obj);
      return result !== undefined && result !== null ? result : fallback;
    } catch (err) {
      return fallback;
    }
  };

  // Color schemes for charts
  const colorSchemes = {
    primary: ['#10B981', '#059669', '#047857', '#065F46'],
    secondary: ['#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A'],
    tertiary: ['#F59E0B', '#D97706', '#B45309', '#92400E'],
    quaternary: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B'],
    gradient: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6']
  };

  useEffect(() => {
    if (sessionId) {
      fetchChartData();
      fetchInsightsData();
    }
  }, [sessionId, timeRange]);
  const fetchChartData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = getToken();
      // Use graph-data endpoint instead of charts since charts endpoint doesn't exist in backend
      const response = await axios.get(
        `http://127.0.0.1:8000/api/crop-management/graph-data/${sessionId}?time_range=${timeRange}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setChartData(response.data);
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError(err.response?.data?.detail || 'Failed to fetch chart data. Please ensure all data is recorded.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInsightsData = async () => {
    try {
      setInsightsLoading(true);
      
      const token = getToken();
      const response = await axios.get(
        `http://127.0.0.1:8000/api/crop-management/insights/${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      ).catch(error => {
        console.error('Error fetching insights:', error);
        return { data: null };
      });
        console.log('Insights API response:', response);
      
      // Handle potential empty or malformed insights data
      if (response && response.data && response.data.insights && response.data.insights.length > 0) {
        console.log('Setting insights data:', response.data);
        setInsightsData(response.data);
      } else {
        // Set default insights structure if none is returned
        console.log('Setting default insights data');
        setInsightsData({
          insights: [{
            message: "No specific insights available yet",
            reason: "Continue recording data about your crops to receive personalized recommendations",
            recommendation_type: "info"
          }]
        });
      }
    } catch (err) {
      console.error('Error fetching insights data:', err);
      // Set default insights even on error
      setInsightsData({
        insights: [{
          message: "Unable to load insights at this time",
          reason: "Please try again later or contact support if the problem persists",
          recommendation_type: "info"
        }]
      });
    } finally {
      setInsightsLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${entry.unit || ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getTrendIcon = (trend) => {
    return trend > 0 ? (
      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
    );
  };

  const formatValue = (value, type) => {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'decimal':
        return value.toFixed(2);
      default:
        return value;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center space-x-2 mb-6">
          <ChartBarIcon className="h-8 w-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Advanced Charts & Analytics</h2>
        </div>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center space-x-2 mb-6">
          <ChartBarIcon className="h-8 w-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Advanced Charts & Analytics</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-500">⚠️</span>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <ChartBarIcon className="h-8 w-8 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Advanced Charts & Analytics</h2>
            <p className="text-gray-600">Interactive data visualization and trend analysis</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Time</option>
              <option value="30">Last 30 Days</option>
              <option value="60">Last 60 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <EyeIcon className="h-5 w-5 text-gray-500" />
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="interactive">Interactive</option>
              <option value="static">Static</option>
              <option value="animated">Animated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'growth-trends', name: 'Growth Trends', icon: ArrowTrendingUpIcon },
            { id: 'yield-analysis', name: 'Yield Analysis', icon: ChartBarIcon },
            { id: 'cost-breakdown', name: 'Cost Analysis', icon: AdjustmentsHorizontalIcon },
            { id: 'performance-radar', name: 'Performance Radar', icon: ClockIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeChart === tab.id
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

      {/* Chart Content */}
      {activeChart === 'growth-trends' && chartData?.growth_trends && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Growth Rate</p>
                  <p className="text-xl font-bold text-green-800">
                    {formatValue(chartData.growth_trends.avg_growth_rate, 'percentage')}
                  </p>
                </div>
                {getTrendIcon(chartData.growth_trends.growth_trend)}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Peak Growth</p>
                  <p className="text-xl font-bold text-blue-800">
                    Day {chartData.growth_trends.peak_growth_day}
                  </p>
                </div>
                <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Efficiency</p>
                  <p className="text-xl font-bold text-purple-800">
                    {formatValue(chartData.growth_trends.efficiency_score, 'percentage')}
                  </p>
                </div>
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Variability</p>
                  <p className="text-xl font-bold text-orange-800">
                    {formatValue(chartData.growth_trends.variability, 'decimal')}
                  </p>
                </div>
                <AdjustmentsHorizontalIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Growth Trends Chart */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Crop Growth Over Time</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData.growth_trends.data}>
                <defs>
                  <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="day" 
                  label={{ value: 'Days', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  label={{ value: 'Height (cm)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="height"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#growthGradient)"
                  name="Plant Height"
                />
                <Line
                  type="monotone"
                  dataKey="predicted_height"
                  stroke="#F59E0B"
                  strokeDasharray="5 5"
                  dot={false}
                  name="Predicted Growth"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Growth Rate Chart */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Growth Rate</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.growth_trends.growth_rate_data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis label={{ value: 'Growth Rate (cm/day)', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="growth_rate" fill="#3B82F6" name="Daily Growth Rate" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeChart === 'yield-analysis' && chartData?.yield_analysis && (
        <div className="space-y-6">
          {/* Yield Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Yield vs Target</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.yield_analysis.comparison_data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="actual" fill="#10B981" name="Actual Yield" />
                  <Bar dataKey="target" fill="#F59E0B" name="Target Yield" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Yield Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.yield_analysis.distribution_data}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {chartData.yield_analysis.distribution_data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colorSchemes.primary[index % colorSchemes.primary.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Yield Factors Correlation */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Yield vs Environmental Factors</h3>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart data={chartData.yield_analysis.correlation_data}>
                <CartesianGrid />
                <XAxis 
                  type="number" 
                  dataKey="temperature" 
                  name="Temperature" 
                  unit="°C"
                  label={{ value: 'Temperature (°C)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="yield" 
                  name="Yield" 
                  unit="kg"
                  label={{ value: 'Yield (kg)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                <Scatter name="Yield vs Temperature" data={chartData.yield_analysis.correlation_data} fill="#10B981" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeChart === 'cost-breakdown' && chartData?.cost_analysis && (
        <div className="space-y-6">
          {/* Cost Trends */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost Trends Over Time</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData.cost_analysis.trends_data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="seeds" stroke="#10B981" strokeWidth={2} name="Seeds" />
                <Line type="monotone" dataKey="fertilizer" stroke="#3B82F6" strokeWidth={2} name="Fertilizer" />
                <Line type="monotone" dataKey="pesticides" stroke="#F59E0B" strokeWidth={2} name="Pesticides" />
                <Line type="monotone" dataKey="labor" stroke="#EF4444" strokeWidth={2} name="Labor" />
                <Line type="monotone" dataKey="equipment" stroke="#8B5CF6" strokeWidth={2} name="Equipment" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Cost Breakdown Pie Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.cost_analysis.breakdown_data}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {chartData.cost_analysis.breakdown_data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colorSchemes.secondary[index % colorSchemes.secondary.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost Efficiency</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.cost_analysis.efficiency_data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="efficiency" fill="#10B981" name="Cost Efficiency %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeChart === 'performance-radar' && chartData?.performance_radar && (
        <div className="space-y-6">
          {/* Performance Radar Chart */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Performance Analysis</h3>
            <ResponsiveContainer width="100%" height={500}>
              <RadarChart data={chartData.performance_radar.data}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]}
                  label={{ value: 'Performance Score', position: 'insideTopLeft' }}
                />
                <Radar
                  name="Current Performance"
                  dataKey="current"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name="Industry Average"
                  dataKey="average"
                  stroke="#F59E0B"
                  fill="#F59E0B"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Legend />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chartData.performance_radar.metrics?.map((metric, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">{metric.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    metric.score >= 80 ? 'bg-green-100 text-green-800' :
                    metric.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {metric.score}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      metric.score >= 80 ? 'bg-green-500' :
                      metric.score >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${metric.score}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{metric.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI-Generated Insights Section */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6 shadow-md">
        <div className="flex items-center space-x-2 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-800">AI-Generated Insights</h3>
        </div>

        {insightsLoading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {safeAccess(insightsData, 'insights', []).length > 0 ? (
              // Display insights if available
              safeAccess(insightsData, 'insights', []).map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  insight.recommendation_type === 'success' ? 'bg-green-50 border-green-200' :
                  insight.recommendation_type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  insight.recommendation_type === 'improvement' ? 'bg-blue-50 border-blue-200' :
                  insight.recommendation_type === 'efficiency' ? 'bg-purple-50 border-purple-200' :
                  'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`text-lg font-medium ${
                    insight.recommendation_type === 'success' ? 'text-green-700' :
                    insight.recommendation_type === 'warning' ? 'text-yellow-700' :
                    insight.recommendation_type === 'improvement' ? 'text-blue-700' :
                    insight.recommendation_type === 'efficiency' ? 'text-purple-700' :
                    'text-gray-700'
                  }`}>{insight.message}</p>
                  <p className="text-gray-600 mt-2">{insight.reason}</p>
                </div>
              ))
            ) : (
              // Fallback message when no insights are available
              <div className="p-4 rounded-lg border bg-gray-50 border-gray-200">
                <p className="text-lg font-medium text-gray-700">No insights available yet</p>
                <p className="text-gray-600 mt-2">
                  Continue recording data about your crops to receive personalized AI recommendations
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export Options */}
      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-300"
        >
          Print Charts
        </button>
        <button
          onClick={() => {
            // Export functionality would go here
            alert('Export functionality to be implemented');
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Export Data
        </button>
      </div>
    </div>
  );
};

export default AdvancedCharts;
