import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CropComparisonTool = ({ sessionId }) => {
  const { getToken } = useAuth();
  const [comparisonData, setComparisonData] = useState(null);
  const [cropTypes, setCropTypes] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('yield');

  // Fetch comparison data
  useEffect(() => {
    const fetchComparisonData = async () => {
      if (!selectedCrop) return;

      try {
        setIsLoading(true);
        setError(null);
        
        const token = getToken();
        const response = await axios.get(
          `http://127.0.0.1:8000/api/crop-management/comparisons?crop_name=${selectedCrop}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        setComparisonData(response.data.comparison_data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch comparison data. Please try again.');
        setIsLoading(false);
        console.error('Error fetching comparison data:', err);
      }
    };

    fetchComparisonData();
  }, [selectedCrop, getToken]);

  // Fetch available crop types for comparison
  useEffect(() => {
    const fetchCropTypes = async () => {
      try {
        setIsLoading(true);
        
        const token = getToken();
        const response = await axios.get(
          'http://127.0.0.1:8000/api/crop-management/comparisons',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        setCropTypes(response.data.crop_types);
        if (response.data.crop_types.length > 0) {
          setSelectedCrop(response.data.crop_types[0]);
        }
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch crop types. Please try again.');
        setIsLoading(false);
        console.error('Error fetching crop types:', err);
      }
    };

    fetchCropTypes();
  }, [getToken]);

  // Prepare chart data for yield comparison
  const getYieldChartData = () => {
    if (!comparisonData || comparisonData.length === 0) return null;

    return {
      labels: comparisonData.map(item => {
        const date = new Date(item.sowing_date);
        return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      }),
      datasets: [
        {
          label: `${selectedCrop} Yield (${comparisonData[0].yield_unit})`,
          data: comparisonData.map(item => item.yield),
          backgroundColor: 'rgba(75, 192, 75, 0.7)',
          borderColor: 'rgb(75, 192, 75)',
          borderWidth: 2,
        }
      ]
    };
  };

  // Prepare chart data for profit comparison
  const getProfitChartData = () => {
    if (!comparisonData || comparisonData.length === 0) return null;

    return {
      labels: comparisonData.map(item => {
        const date = new Date(item.sowing_date);
        return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      }),
      datasets: [
        {
          label: 'Revenue',
          data: comparisonData.map(item => item.revenue),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 2,
        },
        {
          label: 'Cost',
          data: comparisonData.map(item => item.total_cost),
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 2,
        },
        {
          label: 'Profit',
          data: comparisonData.map(item => item.profit),
          backgroundColor: 'rgba(75, 192, 75, 0.7)',
          borderColor: 'rgb(75, 192, 75)',
          borderWidth: 2,
        }
      ]
    };
  };

  // Prepare chart data for ROI comparison
  const getROIChartData = () => {
    if (!comparisonData || comparisonData.length === 0) return null;

    return {
      labels: comparisonData.map(item => {
        const date = new Date(item.sowing_date);
        return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      }),
      datasets: [
        {
          label: 'ROI (%)',
          data: comparisonData.map(item => item.roi),
          backgroundColor: 'rgba(153, 102, 255, 0.7)',
          borderColor: 'rgb(153, 102, 255)',
          borderWidth: 2,
          fill: false,
        }
      ]
    };
  };

  // Prepare chart data for cost breakdown
  const getCostBreakdownChartData = () => {
    if (!comparisonData || comparisonData.length === 0) return null;

    // Get all unique input types across all sessions
    const allInputTypes = new Set();
    comparisonData.forEach(item => {
      Object.keys(item.cost_breakdown).forEach(type => allInputTypes.add(type));
    });

    const datasets = Array.from(allInputTypes).map((type, index) => {
      // Colors for different input types
      const colors = [
        'rgba(75, 192, 75, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
      ];

      return {
        label: type.charAt(0).toUpperCase() + type.slice(1),
        data: comparisonData.map(item => item.cost_breakdown[type] || 0),
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length].replace('0.7', '1'),
        borderWidth: 1,
      };
    });

    return {
      labels: comparisonData.map(item => {
        const date = new Date(item.sowing_date);
        return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      }),
      datasets
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (activeTab === 'roi') {
                label += context.parsed.y.toFixed(2) + '%';
              } else {
                label += context.parsed.y.toFixed(2);
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // Render loading and error states
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Season/Crop Comparison</h3>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Season/Crop Comparison</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-3xl mb-3">⚠️</div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // Render when no data is available
  if (cropTypes.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Season/Crop Comparison</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="text-3xl mb-3">ℹ️</div>
          <h3 className="text-lg font-medium text-blue-800 mb-2">No Data Available</h3>
          <p className="text-blue-600">
            You need at least one completed crop session to use the comparison tool.
            Complete your current crop session or start a new one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Season/Crop Comparison</h3>
      
      {/* Crop selection */}
      <div className="mb-6">
        <label htmlFor="cropType" className="block text-sm font-medium text-gray-700 mb-1">
          Select Crop Type
        </label>
        <select
          id="cropType"
          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
        >
          {cropTypes.map((crop) => (
            <option key={crop} value={crop}>
              {crop}
            </option>
          ))}
        </select>
      </div>
      
      {/* Tabs for different chart types */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('yield')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'yield'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Yield Comparison
          </button>
          <button
            onClick={() => setActiveTab('profit')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profit'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Revenue & Profit
          </button>
          <button
            onClick={() => setActiveTab('roi')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roi'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            ROI Analysis
          </button>
          <button
            onClick={() => setActiveTab('costs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'costs'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Cost Breakdown
          </button>
        </nav>
      </div>

      {/* Chart display */}
      {comparisonData && comparisonData.length > 0 ? (
        <div>
          <div className="h-80 mb-4">
            {activeTab === 'yield' && getYieldChartData() && (
              <Bar data={getYieldChartData()} options={chartOptions} />
            )}
            {activeTab === 'profit' && getProfitChartData() && (
              <Bar data={getProfitChartData()} options={chartOptions} />
            )}
            {activeTab === 'roi' && getROIChartData() && (
              <Line data={getROIChartData()} options={chartOptions} />
            )}
            {activeTab === 'costs' && getCostBreakdownChartData() && (
              <Bar data={getCostBreakdownChartData()} options={chartOptions} />
            )}
          </div>

          {/* Insights and Analysis */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Insights & Analysis</h4>
            {activeTab === 'yield' && (
              <div>
                <p className="text-green-700 mb-2">
                  {comparisonData.length > 1 ? (
                    `Your ${selectedCrop} yield has ${
                      comparisonData[comparisonData.length - 1].yield > comparisonData[comparisonData.length - 2].yield
                        ? 'increased'
                        : 'decreased'
                    } by ${Math.abs(comparisonData[comparisonData.length - 1].yield_delta || 0).toFixed(1)}% compared to the previous season.`
                  ) : (
                    `You have data for one season of ${selectedCrop} with a yield of ${comparisonData[0].yield} ${comparisonData[0].yield_unit}.`
                  )}
                </p>
                <p className="text-green-700">Consistent yield monitoring helps identify trends and areas for improvement.</p>
              </div>
            )}
            {activeTab === 'profit' && (
              <div>
                <p className="text-green-700 mb-2">
                  {comparisonData.length > 1 ? (
                    `Your profit margin has ${
                      comparisonData[comparisonData.length - 1].profit > comparisonData[comparisonData.length - 2].profit
                        ? 'improved'
                        : 'decreased'
                    } compared to the previous season.`
                  ) : (
                    `Your profit for this ${selectedCrop} season was ${comparisonData[0].profit.toFixed(2)}.`
                  )}
                </p>
                <p className="text-green-700">Analyze your cost to revenue ratio to identify optimization opportunities.</p>
              </div>
            )}
            {activeTab === 'roi' && (
              <div>
                <p className="text-green-700 mb-2">
                  {comparisonData.length > 1 ? (
                    `Your Return on Investment has ${
                      comparisonData[comparisonData.length - 1].roi > comparisonData[comparisonData.length - 2].roi
                        ? 'increased'
                        : 'decreased'
                    } by ${Math.abs(comparisonData[comparisonData.length - 1].roi_delta || 0).toFixed(1)}% points.`
                  ) : (
                    `Your ROI for this ${selectedCrop} season was ${comparisonData[0].roi.toFixed(1)}%.`
                  )}
                </p>
                <p className="text-green-700">Higher ROI indicates more efficient use of resources.</p>
              </div>
            )}
            {activeTab === 'costs' && (
              <div>
                <p className="text-green-700 mb-2">
                  {Object.keys(comparisonData[comparisonData.length - 1].cost_breakdown).length > 0 ? (
                    `Your highest cost category is ${
                      Object.entries(comparisonData[comparisonData.length - 1].cost_breakdown)
                        .sort((a, b) => b[1] - a[1])[0][0]
                    }.`
                  ) : (
                    'No detailed cost breakdown available.'
                  )}
                </p>
                <p className="text-green-700">Understanding your cost structure helps identify areas for optimization.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-3xl mb-3">⚠️</div>
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Insufficient Data</h3>
          <p className="text-yellow-600">
            Not enough data available for {selectedCrop}. You need at least one completed crop cycle for this type.
          </p>
        </div>
      )}
    </div>
  );
};

export default CropComparisonTool;
