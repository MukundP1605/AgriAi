import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
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
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

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
  LineElement
);

const CropGraphicalView = ({ sessionId }) => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [activeChart, setActiveChart] = useState('cost-type');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [savingAnalytics, setSavingAnalytics] = useState(false);
  const [analyticsSaved, setAnalyticsSaved] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

  useEffect(() => {
    if (sessionId) {
      fetchGraphData();
      fetchAnalyticsData();
    }
  }, [sessionId]);
  const fetchGraphData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      
      const response = await axios.get(
        `http://127.0.0.1:8000/api/crop-management/graph-data/${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setGraphData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching graph data:', err);
      setError(err.response?.data?.detail || 'Failed to fetch graph data. Make sure harvest data has been recorded.');
    } finally {
      setLoading(false);
    }
  };
    const fetchAnalyticsData = async () => {
    try {
      const token = getToken();
      
      const response = await axios.get(
        `http://127.0.0.1:8000/api/crop-management/analytics/${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setAnalyticsData(response.data);
      
      // Check if analytics data is already saved
      try {
        const savedResponse = await axios.get(
          `http://127.0.0.1:8000/api/crop-management/analytics/${sessionId}/saved`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
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

  // Helper function to generate random colors
  const generateColors = (count) => {
    const colors = [
      'rgba(75, 192, 192, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 159, 64, 0.7)',
      'rgba(255, 99, 132, 0.7)',
      'rgba(22, 160, 133, 0.7)',
      'rgba(39, 174, 96, 0.7)',
      'rgba(41, 128, 185, 0.7)',
      'rgba(142, 68, 173, 0.7)',
      'rgba(230, 126, 34, 0.7)',
    ];
    
    // If we need more colors than in our predefined array, generate them
    if (count > colors.length) {
      for (let i = colors.length; i < count; i++) {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        colors.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
      }
    }
    
    return colors.slice(0, count);
  };

  // Helper function to safely access nested properties
  const safeAccess = (obj, path, fallback = null) => {
    try {
      const result = path.split('.').reduce((o, key) => o?.[key], obj);
      return result !== undefined && result !== null ? result : fallback;
    } catch (err) {
      return fallback;
    }
  };

  // Prepare chart data with safe property access
  const costByTypeData = {
    labels: safeAccess(graphData, 'cost_by_type.labels', [])?.map(label => label.charAt(0).toUpperCase() + label.slice(1)) || [],
    datasets: [
      {
        label: 'Cost by Type',
        data: safeAccess(graphData, 'cost_by_type.data', []),
        backgroundColor: generateColors(safeAccess(graphData, 'cost_by_type.labels.length', 0)),
        borderWidth: 1,
      },
    ],
  };

  const costByMonthData = {
    labels: safeAccess(graphData, 'cost_by_month.labels', []).map(date => {
      try {
        const [year, month] = date.split('-');
        return `${new Date(year, month - 1).toLocaleString('default', { month: 'short' })} ${year}`;
      } catch (err) {
        return date;
      }
    }),
    datasets: [
      {
        label: 'Cost by Month',
        data: safeAccess(graphData, 'cost_by_month.data', []),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const costVsRevenueData = {
    labels: safeAccess(graphData, 'cost_vs_revenue.labels', []),
    datasets: [
      {
        label: 'Amount',
        data: safeAccess(graphData, 'cost_vs_revenue.data', []),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(75, 192, 192, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const comparisonData = {
    labels: safeAccess(graphData, 'comparison_data.labels', []),
    datasets: [
      {
        label: 'Yield',
        data: safeAccess(graphData, 'comparison_data.yield', []),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        label: 'Cost',
        data: safeAccess(graphData, 'comparison_data.cost', []),
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
      },
      {
        label: 'Revenue',
        data: safeAccess(graphData, 'comparison_data.revenue', []),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: activeChart === 'cost-type' ? 'Cost Breakdown by Input Type' :
              activeChart === 'cost-month' ? 'Monthly Cost Distribution' :
              activeChart === 'cost-revenue' ? 'Cost vs Revenue' :
              'Seasonal Comparison',
        font: {
          size: 16,
        }
      },
    },
  };

  const comparisonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Seasonal Comparison',
        font: {
          size: 16,
        }
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Yield',
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Cost/Revenue ($)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Crop Graphical View</h3>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Crop Graphical View</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchGraphData}
            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!graphData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Crop Graphical View</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">No Data Available</h3>
          <p className="text-yellow-600">
            No graph data is available for this crop session. Please ensure you have recorded your harvest data.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Crop Graphical View</h3>
      
      {/* Chart Selection Tabs */}
      <div className="flex mb-6 border-b border-gray-200">
        <button 
          className={`py-2 px-4 font-medium text-sm ${activeChart === 'cost-type' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-emerald-500'}`}
          onClick={() => setActiveChart('cost-type')}
        >
          Cost by Type
        </button>
        <button 
          className={`py-2 px-4 font-medium text-sm ${activeChart === 'cost-month' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-emerald-500'}`}
          onClick={() => setActiveChart('cost-month')}
        >
          Cost by Month
        </button>
        <button 
          className={`py-2 px-4 font-medium text-sm ${activeChart === 'cost-revenue' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-emerald-500'}`}
          onClick={() => setActiveChart('cost-revenue')}
        >
          Cost vs Revenue
        </button>
        <button 
          className={`py-2 px-4 font-medium text-sm ${activeChart === 'comparison' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-emerald-500'}`}
          onClick={() => setActiveChart('comparison')}
        >
          Seasonal Comparison
        </button>
      </div>
        {/* Chart Container */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div className="h-80">
          {activeChart === 'cost-type' && safeAccess(graphData, 'cost_by_type.labels', []).length > 0 && (
            <Pie data={costByTypeData} options={chartOptions} />
          )}
          
          {activeChart === 'cost-month' && safeAccess(graphData, 'cost_by_month.labels', []).length > 0 && (
            <Bar data={costByMonthData} options={chartOptions} />
          )}
          
          {activeChart === 'cost-revenue' && safeAccess(graphData, 'cost_vs_revenue.labels', []).length > 0 && (
            <Bar data={costVsRevenueData} options={chartOptions} />
          )}
          
          {activeChart === 'comparison' && safeAccess(graphData, 'comparison_data.labels', []).length > 0 && (
            <Bar data={comparisonData} options={comparisonOptions} />
          )}
          
          {((activeChart === 'cost-type' && safeAccess(graphData, 'cost_by_type.labels', []).length === 0) ||
            (activeChart === 'cost-month' && safeAccess(graphData, 'cost_by_month.labels', []).length === 0) ||
            (activeChart === 'cost-revenue' && safeAccess(graphData, 'cost_vs_revenue.labels', []).length === 0) ||
            (activeChart === 'comparison' && safeAccess(graphData, 'comparison_data.labels', []).length === 0)) && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-emerald-600 mb-2">No data available for this chart</p>
                <p className="text-gray-500 text-sm">Please ensure all required data is recorded</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Chart Summary */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
        <h4 className="font-medium text-gray-800 mb-2">Summary</h4>            {activeChart === 'cost-type' && (
          <div>
            <p className="text-gray-600 mb-2">This chart shows how your costs are distributed across different input types.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {safeAccess(graphData, 'cost_by_type.labels', []).map((label, index) => (
                <div key={label} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: costByTypeData.datasets[0].backgroundColor[index] }}
                    ></div>
                    <span className="text-gray-700 capitalize">{label}</span>
                  </div>
                  <span className="font-medium">${safeAccess(graphData, `cost_by_type.data[${index}]`, 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeChart === 'cost-month' && (
          <div>
            <p className="text-gray-600 mb-2">This chart shows your monthly spending throughout the crop cycle.</p>
            <p className="text-gray-600">
              Highest spending month: <span className="font-medium">${Math.max(...safeAccess(graphData, 'cost_by_month.data', [0])).toFixed(2)}</span>
            </p>
            <p className="text-gray-600">
              Total spending: <span className="font-medium">${safeAccess(graphData, 'cost_by_month.data', []).reduce((sum, val) => sum + val, 0).toFixed(2)}</span>
            </p>
          </div>
        )}
        
        {activeChart === 'cost-revenue' && (
          <div>
            <p className="text-gray-600 mb-2">This chart compares your total cost with the revenue generated.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Total Cost: <span className="font-medium">${safeAccess(graphData, 'cost_vs_revenue.data[0]', 0).toFixed(2)}</span></p>
              </div>
              <div>
                <p className="text-gray-600">Revenue: <span className="font-medium">${safeAccess(graphData, 'cost_vs_revenue.data[1]', 0).toFixed(2)}</span></p>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-gray-600">
                Profit/Loss: <span className={`font-medium ${(safeAccess(graphData, 'cost_vs_revenue.data[1]', 0) - safeAccess(graphData, 'cost_vs_revenue.data[0]', 0)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${(safeAccess(graphData, 'cost_vs_revenue.data[1]', 0) - safeAccess(graphData, 'cost_vs_revenue.data[0]', 0)).toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        )}
        
        {activeChart === 'comparison' && (
          <div>
            <p className="text-gray-600 mb-2">This chart compares your current crop season with previous seasons of the same crop.</p>
            {safeAccess(graphData, 'comparison_data.labels.length', 0) > 1 ? (
              <div>
                <p className="text-gray-600">
                  You've grown this crop in {safeAccess(graphData, 'comparison_data.labels.length', 0)} seasons.
                </p>
                <p className="text-gray-600">
                  Best yield: <span className="font-medium">{Math.max(...safeAccess(graphData, 'comparison_data.yield', [0])).toFixed(2)} units</span>
                </p>
                <p className="text-gray-600">
                  Most profitable season: <span className="font-medium">
                    {safeAccess(graphData, 'comparison_data.labels', [])[
                      safeAccess(graphData, 'comparison_data.revenue', [])
                        .map((revenue, i) => revenue - safeAccess(graphData, `comparison_data.cost[${i}]`, 0))
                        .indexOf(Math.max(...safeAccess(graphData, 'comparison_data.revenue', []).map((revenue, i) => revenue - safeAccess(graphData, `comparison_data.cost[${i}]`, 0))))
                    ] || 'N/A'}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-gray-600">
                This is your first season growing this crop. Comparison data will be available after multiple seasons.
              </p>
            )}
          </div>
        )}      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div>
          {analyticsData && !analyticsSaved && (
            <button
              onClick={handleSaveAnalytics}
              disabled={savingAnalytics}
              className={`${
                savingAnalytics 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white py-2 px-4 rounded-md mr-2 flex items-center`}
            >
              {savingAnalytics ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Analytics Data'
              )}
            </button>
          )}
          
          {analyticsSaved && (
            <span className="text-green-600 flex items-center">
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              Analytics Data Saved
            </span>
          )}
          
          {analyticsError && (
            <span className="text-red-600">{analyticsError}</span>
          )}
        </div>
        
        <button
          onClick={fetchGraphData}
          className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default CropGraphicalView;
