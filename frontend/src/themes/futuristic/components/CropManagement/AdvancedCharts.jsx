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

  // Color schemes for futuristic charts
  const colorSchemes = {
    primary: ['#00FFFF', '#0DD9DF', '#1AB2B8', '#268C91'],
    secondary: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'],
    tertiary: ['#F59E0B', '#D97706', '#B45309', '#92400E'],
    quaternary: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B'],
    gradient: ['#00FFFF', '#8B5CF6', '#6D28D9', '#5B21B6']
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
        <div className="bg-slate-800/95 backdrop-blur-sm p-4 border border-cyan-500/30 rounded-lg shadow-xl shadow-cyan-500/20">
          <p className="font-medium text-white">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-cyan-300" style={{ color: entry.color }}>
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
      <ArrowTrendingUpIcon className="h-4 w-4 text-cyan-400" />
    ) : (
      <ArrowTrendingDownIcon className="h-4 w-4 text-red-400" />
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
      <div className="p-6 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-lg border border-cyan-500/30 shadow-xl shadow-cyan-500/10">
        <div className="flex items-center space-x-2 mb-6">
          <ChartBarIcon className="h-8 w-8 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">Advanced Charts & Analytics</h2>
        </div>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-lg border border-cyan-500/30 shadow-xl shadow-cyan-500/10">
        <div className="flex items-center space-x-2 mb-6">
          <ChartBarIcon className="h-8 w-8 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">Advanced Charts & Analytics</h2>
        </div>
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-400">⚠️</span>
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-lg border border-cyan-500/30 shadow-xl shadow-cyan-500/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <ChartBarIcon className="h-8 w-8 text-cyan-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Advanced Charts & Analytics</h2>
            <p className="text-gray-300">Interactive data visualization and trend analysis</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 bg-slate-800/50 border border-cyan-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="all">All Time</option>
              <option value="30">Last 30 Days</option>
              <option value="60">Last 60 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <EyeIcon className="h-5 w-5 text-gray-400" />
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="px-3 py-2 bg-slate-800/50 border border-cyan-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="interactive">Interactive</option>
              <option value="static">Static</option>
              <option value="animated">Animated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart Navigation */}
      <div className="border-b border-cyan-500/30 mb-6">
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
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                activeChart === tab.id
                  ? 'border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-400/20'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500/50'
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
            <div className="bg-gradient-to-r from-cyan-900/50 to-cyan-800/50 p-4 rounded-lg border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-cyan-400 font-medium">Growth Rate</p>
                  <p className="text-xl font-bold text-white">
                    {formatValue(chartData.growth_trends.avg_growth_rate, 'percentage')}
                  </p>
                </div>
                {getTrendIcon(chartData.growth_trends.growth_trend)}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 p-4 rounded-lg border border-blue-500/30 shadow-lg shadow-blue-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-400 font-medium">Peak Growth</p>
                  <p className="text-xl font-bold text-white">
                    Day {chartData.growth_trends.peak_growth_day}
                  </p>
                </div>
                <ArrowTrendingUpIcon className="h-6 w-6 text-blue-400" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 p-4 rounded-lg border border-purple-500/30 shadow-lg shadow-purple-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-400 font-medium">Efficiency</p>
                  <p className="text-xl font-bold text-white">
                    {formatValue(chartData.growth_trends.efficiency_score, 'percentage')}
                  </p>
                </div>
                <ChartBarIcon className="h-6 w-6 text-purple-400" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-900/50 to-orange-800/50 p-4 rounded-lg border border-orange-500/30 shadow-lg shadow-orange-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-400 font-medium">Variability</p>
                  <p className="text-xl font-bold text-white">
                    {formatValue(chartData.growth_trends.variability, 'decimal')}
                  </p>
                </div>
                <AdjustmentsHorizontalIcon className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </div>

          {/* Growth Trends Chart */}
          <div className="bg-slate-800/50 p-6 rounded-lg border border-gray-500/30">
            <h3 className="text-lg font-semibold text-white mb-4">Crop Growth Over Time</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData.growth_trends.data}>
                <defs>
                  <linearGradient id="futuristicGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FFFF" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00FFFF" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="day" 
                  label={{ value: 'Days', position: 'insideBottom', offset: -5 }}
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis 
                  label={{ value: 'Height (cm)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                  tick={{ fill: '#9CA3AF' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="height"
                  stroke="#00FFFF"
                  fillOpacity={1}
                  fill="url(#futuristicGrowthGradient)"
                  name="Plant Height"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="predicted_height"
                  stroke="#F59E0B"
                  strokeDasharray="5 5"
                  dot={false}
                  name="Predicted Growth"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Growth Rate Chart */}
          <div className="bg-slate-800/50 p-6 rounded-lg border border-gray-500/30">
            <h3 className="text-lg font-semibold text-white mb-4">Daily Growth Rate</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.growth_trends.growth_rate_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" tick={{ fill: '#9CA3AF' }} />
                <YAxis label={{ value: 'Growth Rate (cm/day)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} tick={{ fill: '#9CA3AF' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="growth_rate" fill="#8B5CF6" name="Daily Growth Rate" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeChart === 'yield-analysis' && chartData?.yield_analysis && (
        <div className="space-y-6">
          {/* Yield Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 p-6 rounded-lg border border-gray-500/30">
              <h3 className="text-lg font-semibold text-white mb-4">Yield vs Target</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.yield_analysis.comparison_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" tick={{ fill: '#9CA3AF' }} />
                  <YAxis tick={{ fill: '#9CA3AF' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="actual" fill="#00FFFF" name="Actual Yield" />
                  <Bar dataKey="target" fill="#F59E0B" name="Target Yield" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-gray-500/30">
              <h3 className="text-lg font-semibold text-white mb-4">Yield Distribution</h3>
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
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Yield Factors Correlation */}
          <div className="bg-slate-800/50 p-6 rounded-lg border border-gray-500/30">
            <h3 className="text-lg font-semibold text-white mb-4">Yield vs Environmental Factors</h3>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart data={chartData.yield_analysis.correlation_data}>
                <CartesianGrid stroke="#374151" />
                <XAxis 
                  type="number" 
                  dataKey="temperature" 
                  name="Temperature" 
                  unit="°C"
                  label={{ value: 'Temperature (°C)', position: 'insideBottom', offset: -5 }}
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="yield" 
                  name="Yield" 
                  unit="kg"
                  label={{ value: 'Yield (kg)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                  tick={{ fill: '#9CA3AF' }}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                <Scatter name="Yield vs Temperature" data={chartData.yield_analysis.correlation_data} fill="#00FFFF" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeChart === 'cost-breakdown' && chartData?.cost_analysis && (
        <div className="space-y-6">
          {/* Cost Trends */}
          <div className="bg-slate-800/50 p-6 rounded-lg border border-gray-500/30">
            <h3 className="text-lg font-semibold text-white mb-4">Cost Trends Over Time</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData.cost_analysis.trends_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="period" tick={{ fill: '#9CA3AF' }} />
                <YAxis label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} tick={{ fill: '#9CA3AF' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="seeds" stroke="#00FFFF" strokeWidth={2} name="Seeds" />
                <Line type="monotone" dataKey="fertilizer" stroke="#8B5CF6" strokeWidth={2} name="Fertilizer" />
                <Line type="monotone" dataKey="pesticides" stroke="#F59E0B" strokeWidth={2} name="Pesticides" />
                <Line type="monotone" dataKey="labor" stroke="#EF4444" strokeWidth={2} name="Labor" />
                <Line type="monotone" dataKey="equipment" stroke="#10B981" strokeWidth={2} name="Equipment" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Cost Breakdown Pie Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 p-6 rounded-lg border border-gray-500/30">
              <h3 className="text-lg font-semibold text-white mb-4">Cost Breakdown</h3>
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
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-gray-500/30">
              <h3 className="text-lg font-semibold text-white mb-4">Cost Efficiency</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.cost_analysis.efficiency_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" tick={{ fill: '#9CA3AF' }} />
                  <YAxis tick={{ fill: '#9CA3AF' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="efficiency" fill="#00FFFF" name="Cost Efficiency %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeChart === 'performance-radar' && chartData?.performance_radar && (
        <div className="space-y-6">
          {/* Performance Radar Chart */}
          <div className="bg-slate-800/50 p-6 rounded-lg border border-gray-500/30">
            <h3 className="text-lg font-semibold text-white mb-4">Overall Performance Analysis</h3>
            <ResponsiveContainer width="100%" height={500}>
              <RadarChart data={chartData.performance_radar.data}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#9CA3AF' }} />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]}
                  label={{ value: 'Performance Score', position: 'insideTopLeft' }}
                  tick={{ fill: '#9CA3AF' }}
                />
                <Radar
                  name="Current Performance"
                  dataKey="current"
                  stroke="#00FFFF"
                  fill="#00FFFF"
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
              <div key={index} className="bg-slate-700/50 p-4 rounded-lg border border-gray-600/30 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{metric.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                    metric.score >= 80 ? 'bg-cyan-900/50 text-cyan-400 border-cyan-500/50' :
                    metric.score >= 60 ? 'bg-yellow-900/50 text-yellow-400 border-yellow-500/50' :
                    'bg-red-900/50 text-red-400 border-red-500/50'
                  }`}>
                    {metric.score}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      metric.score >= 80 ? 'bg-cyan-400' :
                      metric.score >= 60 ? 'bg-yellow-400' :
                      'bg-red-400'
                    }`}
                    style={{ width: `${metric.score}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-300 mt-2">{metric.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}      {/* Export Options */}
      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-slate-700/50 text-white border border-gray-500/50 rounded-lg hover:bg-slate-600/50 transition duration-300"
        >
          Print Charts
        </button>
        <button
          onClick={() => {
            // Export functionality would go here
            alert('Export functionality to be implemented');
          }}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition duration-300 shadow-lg shadow-cyan-500/20"
        >
          Export Data
        </button>
      </div>

      {/* AI-Generated Insights Section */}
      <div className="mt-8 bg-gradient-to-r from-slate-800/80 via-blue-900/30 to-purple-900/30 p-6 rounded-lg border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
        <div className="flex items-center space-x-2 mb-4">
          <LightBulbIcon className="h-6 w-6 text-cyan-400" />
          <h3 className="text-xl font-bold text-white">AI-Generated Insights</h3>
        </div>

        {insightsLoading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {safeAccess(insightsData, 'insights', []).length > 0 ? (
              // Display insights if available
              safeAccess(insightsData, 'insights', []).map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border backdrop-blur-sm ${
                  insight.recommendation_type === 'success' ? 'bg-green-900/20 border-green-500/50' :
                  insight.recommendation_type === 'warning' ? 'bg-yellow-900/20 border-yellow-500/50' :
                  insight.recommendation_type === 'improvement' ? 'bg-blue-900/20 border-blue-500/50' :
                  insight.recommendation_type === 'efficiency' ? 'bg-purple-900/20 border-purple-500/50' :
                  'bg-gray-800/40 border-gray-600/50'
                }`}>
                  <p className={`text-lg font-medium ${
                    insight.recommendation_type === 'success' ? 'text-green-400' :
                    insight.recommendation_type === 'warning' ? 'text-yellow-400' :
                    insight.recommendation_type === 'improvement' ? 'text-blue-400' :
                    insight.recommendation_type === 'efficiency' ? 'text-purple-400' :
                    'text-cyan-300'
                  }`}>{insight.message}</p>
                  <p className="text-gray-300 mt-2">{insight.reason}</p>
                </div>
              ))
            ) : (
              // Fallback message when no insights are available
              <div className="p-4 rounded-lg border bg-gray-800/40 border-gray-600/50 backdrop-blur-sm">
                <p className="text-lg font-medium text-cyan-300">No insights available yet</p>
                <p className="text-gray-300 mt-2">
                  Continue recording data about your crops to receive personalized AI recommendations
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedCharts;
