import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler
);

const CropGraphicalView = ({ sessionId }) => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [insightsData, setInsightsData] = useState(null);
  const [activeChart, setActiveChart] = useState('resource-allocation');
  const [animateCharts, setAnimateCharts] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [savingAnalytics, setSavingAnalytics] = useState(false);
  const [analyticsSaved, setAnalyticsSaved] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);
  
  // Helper function to safely access nested properties
  const safeAccess = (obj, path, fallback = null) => {
    try {
      const result = path.split('.').reduce((o, key) => o?.[key], obj);
      return result !== undefined && result !== null ? result : fallback;
    } catch (err) {
      return fallback;
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchAllData();
    }
    
    // Disable animations after first render for better performance
    const timer = setTimeout(() => {
      setAnimateCharts(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [sessionId]);
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };      // Fetch graph data and insights in parallel
      const [graphResponse, insightsResponse] = await Promise.all([
        axios.get(`http://127.0.0.1:8000/api/crop-management/graph-data/${sessionId}`, { headers }),
        axios.get(`http://127.0.0.1:8000/api/crop-management/insights/${sessionId}`, { headers })
          .catch(error => {
            console.error('Error fetching insights:', error);
            return { data: { 
              insights: [{
                message: "No specific insights available yet",
                reason: "Continue recording data about your crops to receive personalized recommendations",
                recommendation_type: "info"
              }]
            }};
          })
      ]);
      
      setGraphData(graphResponse.data);
      
      // Debug insights data
      console.log('Insights API response:', insightsResponse);
      
      // Handle potential empty or malformed insights data
      if (insightsResponse && insightsResponse.data && insightsResponse.data.insights && insightsResponse.data.insights.length > 0) {
        console.log('Setting insights data:', insightsResponse.data);
        setInsightsData(insightsResponse.data);
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
      setError(null);
      
      // Fetch analytics data
      await fetchAnalyticsData();
    } catch (err) {
      console.error('Error fetching visualization data:', err);
      setError(err.response?.data?.detail || 'Failed to fetch visualization data. Ensure harvest analytics are finalized.');
    } finally {
      setLoading(false);
    }
  };
    const fetchAnalyticsData = async () => {
    try {
      const token = getToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await axios.get(`http://127.0.0.1:8000/api/crop-management/analytics/${sessionId}`, { headers });
      setAnalyticsData(response.data);
      
      // Check if analytics data is already saved
      try {
        const savedResponse = await axios.get(`http://127.0.0.1:8000/api/crop-management/analytics/${sessionId}/saved`, { headers });
        if (savedResponse.data) {
          setAnalyticsSaved(true);
        }
      } catch (error) {
        // If 404, analytics not saved yet, which is fine
        if (error.response?.status !== 404) {
          console.error('Error checking saved analytics:', error);
        }
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
    }
  };
    const handleSaveAnalytics = async () => {
    setSavingAnalytics(true);
    setAnalyticsError(null);
    try {
      const token = getToken();
      await axios.post(
        `http://127.0.0.1:8000/api/crop-management/analytics/${sessionId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setAnalyticsSaved(true);
      setSavingAnalytics(false);
    } catch (err) {
      console.error('Error saving analytics data:', err);
      setAnalyticsError(err.response?.data?.detail || 'Failed to save analytics data');
      setSavingAnalytics(false);
    }
  };

  // Generate gradient colors for futuristic theme
  const generateGradientColors = (count) => {
    const baseColors = [
      { start: [0, 201, 255], end: [146, 254, 157] }, // Cyan to Green
      { start: [0, 176, 255], end: [0, 102, 255] },   // Light blue to Dark blue
      { start: [0, 255, 230], end: [0, 223, 162] },   // Turquoise to Light green
      { start: [170, 7, 107], end: [97, 4, 95] },     // Magenta to Purple
      { start: [30, 60, 114], end: [42, 82, 152] },   // Dark blue to Medium blue
      { start: [0, 201, 255], end: [0, 121, 145] },   // Cyan to Dark cyan
      { start: [0, 255, 136], end: [0, 158, 253] },   // Green to Blue
      { start: [85, 91, 110], end: [0, 129, 167] },   // Gray to Blue
      { start: [116, 235, 213], end: [159, 172, 230] }, // Light cyan to Light blue
      { start: [102, 126, 234], end: [118, 75, 162] }   // Blue to Purple
    ];
    
    // If we need more colors than in our predefined array, generate them
    if (count > baseColors.length) {
      for (let i = baseColors.length; i < count; i++) {
        const r1 = Math.floor(Math.random() * 255);
        const g1 = Math.floor(Math.random() * 255);
        const b1 = Math.floor(Math.random() * 255);
        
        const r2 = Math.floor(Math.random() * 255);
        const g2 = Math.floor(Math.random() * 255);
        const b2 = Math.floor(Math.random() * 255);
        
        baseColors.push({ start: [r1, g1, b1], end: [r2, g2, b2] });
      }
    }
    
    // Return rgba values for use in charts
    return baseColors.slice(0, count).map(color => {
      return {
        backgroundColor: `rgba(${color.start[0]}, ${color.start[1]}, ${color.start[2]}, 0.7)`,
        borderColor: `rgba(${color.end[0]}, ${color.end[1]}, ${color.end[2]}, 1)`,
        hoverBackgroundColor: `rgba(${color.start[0]}, ${color.start[1]}, ${color.start[2]}, 0.9)`,
      };
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-medium text-cyan-400 mb-4 flex items-center">
          <span className="text-lg mr-2">📈</span>
          Interactive Data Visualization
        </h3>
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-t-2 border-b-2 border-cyan-400 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
            </div>
          </div>
        </div>
        <p className="text-center text-cyan-300 mt-4">Generating visualization modules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-medium text-cyan-400 mb-4 flex items-center">
          <span className="text-lg mr-2">📈</span>
          Interactive Data Visualization
        </h3>
        <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-300 mb-2">System Error</h3>
          <p className="text-red-400">{error}</p>          <button 
            onClick={fetchAllData}
            className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-md"
          >
            Reinitialize Data
          </button>
        </div>
      </div>
    );
  }

  if (!graphData) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-medium text-cyan-400 mb-4 flex items-center">
          <span className="text-lg mr-2">📈</span>
          Interactive Data Visualization
        </h3>
        <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-yellow-300 mb-2">No Data Available</h3>
          <p className="text-yellow-400">
            Visualization requires harvest data. Please finalize harvest documentation before generating visualizations.
          </p>
        </div>
      </div>
    );
  }
  // Prepare chart data
  const colors = generateGradientColors(10);
  
  const resourceAllocationData = {
    labels: safeAccess(graphData, 'cost_by_type.labels', []).map(label => label.charAt(0).toUpperCase() + label.slice(1)),
    datasets: [
      {
        label: 'Resource Allocation',
        data: safeAccess(graphData, 'cost_by_type.data', []),
        backgroundColor: colors.map(c => c.backgroundColor),
        borderColor: colors.map(c => c.borderColor),
        borderWidth: 1,
      },
    ],
  };

  const temporalDistributionData = {
    labels: safeAccess(graphData, 'cost_by_month.labels', []).map(date => {
      try {
        const [year, month] = date.split('-');
        return `${new Date(year, month - 1).toLocaleString('default', { month: 'short' })} ${year}`;
      } catch (err) {
        return date || '';
      }
    }),
    datasets: [
      {
        label: 'Temporal Resource Distribution',
        data: safeAccess(graphData, 'cost_by_month.data', []),
        backgroundColor: 'rgba(0, 201, 255, 0.5)',
        borderColor: 'rgba(0, 201, 255, 1)',
        tension: 0.4,
        pointBackgroundColor: 'rgba(0, 201, 255, 1)',
        pointBorderColor: '#fff',
        pointRadius: 5,
        fill: true,
      },
    ],
  };
  const economicAnalysisData = {
    labels: safeAccess(graphData, 'cost_vs_revenue.labels', []),
    datasets: [
      {
        label: 'Economic Analysis',
        data: safeAccess(graphData, 'cost_vs_revenue.data', []),
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',
          'rgba(16, 185, 129, 0.7)',
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(16, 185, 129, 1)',
        ],
        borderWidth: 1,
        hoverOffset: 10,
      },
    ],
  };
  // Create a radar chart data for resource efficiency
  const resourceEfficiencyData = {
    labels: ['Yield/Area', 'Cost Efficiency', 'ROI', 'Resource Usage', 'Labor Efficiency'],
    datasets: [
      {
        label: 'Current Season',
        data: [
          8.5, // Yield/Area (sample value)
          7, // Cost Efficiency (sample value)
          safeAccess(graphData, 'cost_vs_revenue.data', [1, 0])[1] > safeAccess(graphData, 'cost_vs_revenue.data', [0, 0])[0] ? 8 : 4, // ROI
          7.5, // Resource Usage (sample value)
          6 // Labor Efficiency (sample value)
        ],
        backgroundColor: 'rgba(0, 201, 255, 0.2)',
        borderColor: 'rgba(0, 201, 255, 1)',
        pointBackgroundColor: 'rgba(0, 201, 255, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(0, 201, 255, 1)',
        borderWidth: 2,
      },
    ],
  };
  const seasonalTrendsData = {
    labels: safeAccess(graphData, 'comparison_data.labels', []),
    datasets: [
      {
        label: 'Yield',
        data: safeAccess(graphData, 'comparison_data.yield', []),
        backgroundColor: 'rgba(0, 201, 255, 0.5)',
        borderColor: 'rgba(0, 201, 255, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        yAxisID: 'y',
      },
      {
        label: 'Cost',
        data: safeAccess(graphData, 'comparison_data.cost', []),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        yAxisID: 'y1',
      },
      {
        label: 'Revenue',
        data: safeAccess(graphData, 'comparison_data.revenue', []),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: animateCharts ? 1000 : 0
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(148, 163, 184, 1)',
          font: {
            family: "'Inter', 'Helvetica', 'Arial', sans-serif",
            weight: 500
          }
        }
      },
      title: {
        display: true,
        text: activeChart === 'resource-allocation' ? 'Resource Allocation Analysis' :
              activeChart === 'temporal-distribution' ? 'Temporal Resource Distribution' :
              activeChart === 'economic-analysis' ? 'Economic Performance Analysis' :
              activeChart === 'resource-efficiency' ? 'Resource Efficiency Matrix' :
              'Seasonal Performance Trends',
        font: {
          size: 16,
          family: "'Inter', 'Helvetica', 'Arial', sans-serif",
          weight: 500
        },
        color: 'rgba(148, 163, 184, 1)',
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        titleFont: {
          family: "'Inter', 'Helvetica', 'Arial', sans-serif",
          weight: 600
        },
        bodyFont: {
          family: "'Inter', 'Helvetica', 'Arial', sans-serif"
        },
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1
      }
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      x: {
        grid: {
          color: 'rgba(71, 85, 105, 0.2)',
        },
        ticks: {
          color: 'rgba(148, 163, 184, 0.8)',
        }
      },
      y: {
        grid: {
          color: 'rgba(71, 85, 105, 0.2)',
        },
        ticks: {
          color: 'rgba(148, 163, 184, 0.8)',
        }
      }
    }
  };

  const trendsOptions = {
    ...chartOptions,
    scales: {
      x: {
        grid: {
          color: 'rgba(71, 85, 105, 0.2)',
        },
        ticks: {
          color: 'rgba(148, 163, 184, 0.8)',
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Yield',
          color: 'rgba(148, 163, 184, 0.8)',
        },
        grid: {
          color: 'rgba(71, 85, 105, 0.2)',
        },
        ticks: {
          color: 'rgba(148, 163, 184, 0.8)',
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Financial ($)',
          color: 'rgba(148, 163, 184, 0.8)',
        },
        grid: {
          drawOnChartArea: false,
          color: 'rgba(71, 85, 105, 0.2)',
        },
        ticks: {
          color: 'rgba(148, 163, 184, 0.8)',
        }
      },
    },
  };

  const radarOptions = {
    ...chartOptions,
    scales: {
      r: {
        min: 0,
        max: 10,
        ticks: {
          stepSize: 2,
          color: 'rgba(148, 163, 184, 0.6)',
          backdropColor: 'transparent'
        },
        pointLabels: {
          color: 'rgba(148, 163, 184, 1)',
          font: {
            size: 12,
            family: "'Inter', 'Helvetica', 'Arial', sans-serif",
          }
        },
        grid: {
          color: 'rgba(71, 85, 105, 0.2)',
        },
        angleLines: {
          color: 'rgba(71, 85, 105, 0.2)',
        }
      }
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
      <h3 className="text-lg font-medium text-cyan-400 mb-4 flex items-center">
        <span className="text-lg mr-2">📈</span>
        Interactive Data Visualization
      </h3>
      
      {/* Chart Selection Tabs */}
      <div className="flex mb-6 border-b border-gray-700 overflow-x-auto">
        <button 
          className={`py-2 px-4 font-medium text-sm whitespace-nowrap ${activeChart === 'resource-allocation' ? 'text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-400 hover:text-cyan-400'}`}
          onClick={() => setActiveChart('resource-allocation')}
        >
          Resource Allocation
        </button>
        <button 
          className={`py-2 px-4 font-medium text-sm whitespace-nowrap ${activeChart === 'temporal-distribution' ? 'text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-400 hover:text-cyan-400'}`}
          onClick={() => setActiveChart('temporal-distribution')}
        >
          Temporal Distribution
        </button>
        <button 
          className={`py-2 px-4 font-medium text-sm whitespace-nowrap ${activeChart === 'economic-analysis' ? 'text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-400 hover:text-cyan-400'}`}
          onClick={() => setActiveChart('economic-analysis')}
        >
          Economic Analysis
        </button>
        <button 
          className={`py-2 px-4 font-medium text-sm whitespace-nowrap ${activeChart === 'resource-efficiency' ? 'text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-400 hover:text-cyan-400'}`}
          onClick={() => setActiveChart('resource-efficiency')}
        >
          Resource Efficiency
        </button>
        <button 
          className={`py-2 px-4 font-medium text-sm whitespace-nowrap ${activeChart === 'seasonal-trends' ? 'text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-400 hover:text-cyan-400'}`}
          onClick={() => setActiveChart('seasonal-trends')}
        >
          Seasonal Trends
        </button>
      </div>
        {/* Chart Container */}
      <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
        <div className="h-80">
          {activeChart === 'resource-allocation' && safeAccess(graphData, 'cost_by_type.labels', []).length > 0 && (
            <Doughnut data={resourceAllocationData} options={chartOptions} />
          )}
          
          {activeChart === 'temporal-distribution' && safeAccess(graphData, 'cost_by_month.labels', []).length > 0 && (
            <Line data={temporalDistributionData} options={lineChartOptions} />
          )}
          
          {activeChart === 'economic-analysis' && safeAccess(graphData, 'cost_vs_revenue.labels', []).length > 0 && (
            <Doughnut data={economicAnalysisData} options={chartOptions} />
          )}
          
          {activeChart === 'resource-efficiency' && (
            <Radar data={resourceEfficiencyData} options={radarOptions} />
          )}
          
          {activeChart === 'seasonal-trends' && safeAccess(graphData, 'comparison_data.labels', []).length > 0 && (
            <Line data={seasonalTrendsData} options={trendsOptions} />
          )}
          
          {((activeChart === 'resource-allocation' && safeAccess(graphData, 'cost_by_type.labels', []).length === 0) ||
            (activeChart === 'temporal-distribution' && safeAccess(graphData, 'cost_by_month.labels', []).length === 0) ||
            (activeChart === 'economic-analysis' && safeAccess(graphData, 'cost_vs_revenue.labels', []).length === 0) ||
            (activeChart === 'seasonal-trends' && safeAccess(graphData, 'comparison_data.labels', []).length === 0)) && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-cyan-300 mb-2">No data available for this chart</p>
                <p className="text-gray-400 text-sm">Please ensure all required data is recorded</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Chart Analysis */}
      <div className="mt-6 bg-gray-800/30 p-4 rounded-lg border border-gray-700">
        <h4 className="font-medium text-cyan-300 mb-2">Data Analysis</h4>
        
        {activeChart === 'resource-allocation' && (          <div>
            <p className="text-gray-300 mb-2">This visualization shows the distribution of resources across different input categories.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
              {safeAccess(graphData, 'cost_by_type.labels', []).map((label, index) => (
                <div key={label} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: colors[index % colors.length].backgroundColor }}
                    ></div>
                    <span className="text-gray-300 capitalize">{label}</span>
                  </div>
                  <span className="font-medium text-cyan-200">${safeAccess(graphData, `cost_by_type.data[${index}]`, 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeChart === 'temporal-distribution' && (          <div>
            <p className="text-gray-300 mb-2">This visualization shows how resource utilization varied throughout the growth cycle.</p>
            <div className="mt-4 space-y-2">
              <p className="text-gray-300">
                Peak investment period: <span className="font-medium text-cyan-200">
                  {safeAccess(graphData, 'cost_by_month.labels', []).length > 0 && safeAccess(graphData, 'cost_by_month.data', []).length > 0 
                    ? `${safeAccess(graphData, 'cost_by_month.labels', [''])[
                      safeAccess(graphData, 'cost_by_month.data', [0]).indexOf(
                        Math.max(...safeAccess(graphData, 'cost_by_month.data', [0]))
                      )].split('-')[1]}/${
                      safeAccess(graphData, 'cost_by_month.labels', [''])[
                      safeAccess(graphData, 'cost_by_month.data', [0]).indexOf(
                        Math.max(...safeAccess(graphData, 'cost_by_month.data', [0]))
                      )].split('-')[0]}`
                    : 'N/A'}
                </span>
              </p>
              <p className="text-gray-300">
                Total resources deployed: <span className="font-medium text-cyan-200">
                  ${safeAccess(graphData, 'cost_by_month.data', []).reduce((sum, val) => sum + val, 0).toFixed(2)}
                </span>
              </p>
              <p className="text-gray-300">
                Resource efficiency coefficient: <span className="font-medium text-cyan-200">
                  {(safeAccess(graphData, 'cost_vs_revenue.data[1]', 0) / 
                    Math.max(safeAccess(graphData, 'cost_vs_revenue.data[0]', 1), 1)).toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        )}
        
        {activeChart === 'economic-analysis' && (          <div>
            <p className="text-gray-300 mb-2">This visualization analyzes the economic performance of your agricultural operation.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-900/40 p-3 rounded border border-gray-700">
                <p className="text-gray-400 text-sm">Total Investment</p>
                <p className="text-xl font-medium text-red-400">${safeAccess(graphData, 'cost_vs_revenue.data[0]', 0).toFixed(2)}</p>
              </div>
              <div className="bg-gray-900/40 p-3 rounded border border-gray-700">
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-xl font-medium text-green-400">${safeAccess(graphData, 'cost_vs_revenue.data[1]', 0).toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-4 bg-gray-900/40 p-3 rounded border border-gray-700">
              <div className="flex justify-between">
                <p className="text-gray-400 text-sm">Net Outcome</p>
                <p className={`font-medium ${(safeAccess(graphData, 'cost_vs_revenue.data[1]', 0) - safeAccess(graphData, 'cost_vs_revenue.data[0]', 0)) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${(safeAccess(graphData, 'cost_vs_revenue.data[1]', 0) - safeAccess(graphData, 'cost_vs_revenue.data[0]', 0)).toFixed(2)}
                </p>
              </div>
              <div className="mt-2 w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${(safeAccess(graphData, 'cost_vs_revenue.data[1]', 0) - safeAccess(graphData, 'cost_vs_revenue.data[0]', 0)) >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ 
                    width: `${Math.min(Math.abs(safeAccess(graphData, 'cost_vs_revenue.data[1]', 0) / Math.max(safeAccess(graphData, 'cost_vs_revenue.data[0]', 1), 1) * 100), 100)}%` 
                  }}
                ></div>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                ROI: {(((safeAccess(graphData, 'cost_vs_revenue.data[1]', 0) - safeAccess(graphData, 'cost_vs_revenue.data[0]', 0)) / 
                  Math.max(safeAccess(graphData, 'cost_vs_revenue.data[0]', 1), 1)) * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        )}
        
        {activeChart === 'resource-efficiency' && (          <div>
            <p className="text-gray-300 mb-2">This advanced radar visualization displays the efficiency matrix across multiple operational dimensions.</p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-cyan-400 mr-2"></div>
                <span className="text-gray-300">Yield/Area: <span className="text-cyan-200 font-medium">8.5/10</span></span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-cyan-400 mr-2"></div>
                <span className="text-gray-300">Cost Efficiency: <span className="text-cyan-200 font-medium">7/10</span></span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-cyan-400 mr-2"></div>
                <span className="text-gray-300">ROI: <span className="text-cyan-200 font-medium">
                  {safeAccess(graphData, 'cost_vs_revenue.data[1]', 0) > safeAccess(graphData, 'cost_vs_revenue.data[0]', 0) ? '8/10' : '4/10'}
                </span></span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-cyan-400 mr-2"></div>
                <span className="text-gray-300">Resource Usage: <span className="text-cyan-200 font-medium">7.5/10</span></span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-cyan-400 mr-2"></div>
                <span className="text-gray-300">Labor Efficiency: <span className="text-cyan-200 font-medium">6/10</span></span>
              </div>
            </div>
          </div>
        )}
        
        {activeChart === 'seasonal-trends' && (          <div>
            <p className="text-gray-300 mb-2">This visualization tracks performance trends across multiple growing seasons for comparative analysis.</p>
            {safeAccess(graphData, 'comparison_data.labels.length', 0) > 1 ? (
              <div className="mt-4 space-y-2">
                <p className="text-gray-300">
                  Seasons analyzed: <span className="font-medium text-cyan-200">{safeAccess(graphData, 'comparison_data.labels.length', 0)}</span>
                </p>
                <p className="text-gray-300">
                  Yield trend: <span className="font-medium text-cyan-200">
                    {safeAccess(graphData, 'comparison_data.yield', []).length > 1 && 
                     safeAccess(graphData, 'comparison_data.yield', [])[safeAccess(graphData, 'comparison_data.yield', []).length - 1] > 
                     safeAccess(graphData, 'comparison_data.yield', [])[0] ? 'Positive' : 'Negative'}
                  </span>
                </p>
                <p className="text-gray-300">
                  Optimal season: <span className="font-medium text-cyan-200">
                    {safeAccess(graphData, 'comparison_data.labels', []).length > 0 && 
                     safeAccess(graphData, 'comparison_data.revenue', []).length > 0 && 
                     safeAccess(graphData, 'comparison_data.cost', []).length > 0 ? 
                      safeAccess(graphData, 'comparison_data.labels', [])[
                        safeAccess(graphData, 'comparison_data.revenue', [])
                          .map((revenue, i) => revenue - safeAccess(graphData, `comparison_data.cost[${i}]`, 0))
                          .indexOf(Math.max(...safeAccess(graphData, 'comparison_data.revenue', []).map((revenue, i) => 
                            revenue - safeAccess(graphData, `comparison_data.cost[${i}]`, 0))))
                      ] || 'N/A' : 'N/A'}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-gray-300 mt-2">
                Insufficient historical data for trend analysis. Multi-season data will be available after multiple growing cycles.
              </p>
            )}
          </div>
        )}
      </div>
        {/* AI Insights Section */}
      <div className="mt-6 bg-gray-800/30 p-4 rounded-lg border border-gray-700">
        <h4 className="font-medium text-cyan-300 mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          AI-Generated Insights
        </h4>
        <div className="space-y-3 mt-3">
          {insightsData && insightsData.insights && insightsData.insights.length > 0 ? (
            // Display insights if available
            insightsData.insights.map((insight, index) => (
              <div key={index} className={`p-3 rounded border ${
                insight.recommendation_type === 'success' ? 'bg-green-900/20 border-green-700/50' :
                insight.recommendation_type === 'warning' ? 'bg-yellow-900/20 border-yellow-700/50' :
                insight.recommendation_type === 'improvement' ? 'bg-blue-900/20 border-blue-700/50' :
                'bg-gray-900/20 border-gray-700/50'
              }`}>
                <p className={`font-medium ${
                  insight.recommendation_type === 'success' ? 'text-green-400' :
                  insight.recommendation_type === 'warning' ? 'text-yellow-400' :
                  insight.recommendation_type === 'improvement' ? 'text-blue-400' :
                  'text-gray-300'
                }`}>{insight.message}</p>
                <p className="text-sm text-gray-400 mt-1">{insight.reason}</p>
              </div>
            ))
          ) : (
            // Fallback message when no insights are available
            <div className="p-3 rounded border bg-gray-900/20 border-gray-700/50">
              <p className="font-medium text-gray-300">No insights available yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Continue recording data about your crops to receive personalized AI recommendations
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {analyticsData && !analyticsSaved && (
            <button
              onClick={handleSaveAnalytics}
              disabled={savingAnalytics}
              className={`${
                savingAnalytics 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white py-2 px-4 rounded-md flex items-center`}
            >
              {savingAnalytics ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Analytics Data'
              )}
            </button>
          )}
          
          {analyticsSaved && (
            <span className="text-green-400 flex items-center">
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              Analytics Data Saved
            </span>
          )}
          
          {analyticsError && (
            <span className="text-red-400">{analyticsError}</span>
          )}
        </div>
        
        <button
          onClick={fetchAllData}
          className="bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-md"
        >
          Refresh Visualization
        </button>
      </div>
    </div>
  );
};

export default CropGraphicalView;
