import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';
import { Line, Radar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
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
  RadialLinearScale,
  ArcElement,
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
  const [activeTab, setActiveTab] = useState('performance');
  const [aiInsights, setAiInsights] = useState(null);

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
        
        // Generate AI insights based on the comparison data
        if (response.data.comparison_data && response.data.comparison_data.length > 0) {
          generateAiInsights(response.data.comparison_data);
        }
        
        setIsLoading(false);
      } catch (err) {
        setError('Data retrieval failed. System connectivity error detected.');
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
        setError('Database query failed. Unable to retrieve crop catalog.');
        setIsLoading(false);
        console.error('Error fetching crop types:', err);
      }
    };

    fetchCropTypes();
  }, [getToken]);

  // Generate AI insights based on the comparison data
  const generateAiInsights = (data) => {
    if (data.length < 2) {
      setAiInsights({
        summary: "Insufficient temporal data for comprehensive analysis.",
        recommendations: [
          "Complete multiple growing cycles to enable trend analysis.",
          "Record detailed input and yield metrics for future comparison."
        ],
        anomalies: []
      });
      return;
    }

    // Sort data by sowing date
    const sortedData = [...data].sort((a, b) => new Date(a.sowing_date) - new Date(b.sowing_date));
    const latest = sortedData[sortedData.length - 1];
    const previous = sortedData[sortedData.length - 2];
    
    // Calculate trends
    const yieldTrend = latest.yield > previous.yield ? "positive" : "negative";
    const profitTrend = latest.profit > previous.profit ? "positive" : "negative";
    const roiTrend = latest.roi > previous.roi ? "positive" : "negative";
    
    // Find the highest cost category
    const highestCostCategory = Object.entries(latest.cost_breakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([key, value]) => key)[0] || "unknown";
    
    // Identify anomalies (significant changes)
    const anomalies = [];
    if (Math.abs(latest.yield_delta) > 20) {
      anomalies.push(`Significant ${yieldTrend === "positive" ? "increase" : "decrease"} in yield (${Math.abs(latest.yield_delta).toFixed(1)}%)`);
    }
    if (Math.abs(latest.cost_delta) > 30) {
      anomalies.push(`Substantial ${latest.cost_delta > 0 ? "increase" : "decrease"} in input costs (${Math.abs(latest.cost_delta).toFixed(1)}%)`);
    }
    if (Math.abs(latest.profit_delta) > 25) {
      anomalies.push(`Notable ${profitTrend === "positive" ? "growth" : "reduction"} in profit margin (${Math.abs(latest.profit_delta).toFixed(1)}%)`);
    }
    
    // Generate recommendations
    const recommendations = [];
    if (yieldTrend === "negative") {
      recommendations.push("Analyze nutrient application timing and quantities to improve yield efficiency.");
    }
    if (profitTrend === "negative") {
      recommendations.push(`Optimize ${highestCostCategory} expenditure to improve profitability.`);
    }
    if (roiTrend === "negative") {
      recommendations.push("Implement cost-saving measures while maintaining yield quality.");
    }
    
    // Always add some general recommendations
    recommendations.push("Consider crop rotation to improve soil fertility and reduce pest pressure.");
    recommendations.push("Evaluate weather pattern impacts on yield to optimize planting schedules.");
    
    // Create summary
    let summary = "";
    if (yieldTrend === "positive" && profitTrend === "positive") {
      summary = "Positive growth trajectory detected across key performance indicators.";
    } else if (yieldTrend === "negative" && profitTrend === "negative") {
      summary = "Declining performance metrics detected. Intervention recommended.";
    } else {
      summary = "Mixed performance indicators suggest optimization opportunities.";
    }
    
    setAiInsights({
      summary,
      recommendations: recommendations.slice(0, 3), // Limit to 3 recommendations
      anomalies
    });
  };

  // Prepare chart data for performance metrics
  const getPerformanceChartData = () => {
    if (!comparisonData || comparisonData.length === 0) return null;

    return {
      labels: comparisonData.map(item => {
        const date = new Date(item.sowing_date);
        return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      }),
      datasets: [
        {
          label: `Yield (${comparisonData[0].yield_unit})`,
          data: comparisonData.map(item => item.yield),
          borderColor: 'rgba(0, 255, 255, 1)',
          backgroundColor: 'rgba(0, 255, 255, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
        {
          label: 'ROI (%)',
          data: comparisonData.map(item => item.roi),
          borderColor: 'rgba(128, 0, 255, 1)',
          backgroundColor: 'rgba(128, 0, 255, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          yAxisID: 'y1',
        }
      ]
    };
  };

  // Prepare chart data for financial analysis
  const getFinancialChartData = () => {
    if (!comparisonData || comparisonData.length === 0) return null;

    return {
      labels: ['Revenue', 'Costs', 'Profit'],
      datasets: comparisonData.map((item, index) => {
        const date = new Date(item.sowing_date);
        const seasonLabel = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        
        // Generate gradient colors based on index
        const hue = 180 + (index * 40) % 180; // Cycle through blue-cyan hues
        
        return {
          label: seasonLabel,
          data: [item.revenue, item.total_cost, item.profit],
          backgroundColor: `hsla(${hue}, 100%, 50%, 0.7)`,
          borderColor: `hsla(${hue}, 100%, 40%, 1)`,
          borderWidth: 1,
        };
      })
    };
  };

  // Prepare chart data for resource allocation
  const getResourceAllocationChartData = () => {
    if (!comparisonData || comparisonData.length === 0) return null;
    
    // Get the latest season data
    const latestSeason = comparisonData[comparisonData.length - 1];
    
    // Extract cost breakdown
    const labels = Object.keys(latestSeason.cost_breakdown).map(
      key => key.charAt(0).toUpperCase() + key.slice(1)
    );
    const values = Object.values(latestSeason.cost_breakdown);
    
    // Generate gradient colors
    const backgroundColors = labels.map((_, index) => {
      const hue = (180 + index * 30) % 360;
      return `hsla(${hue}, 100%, 50%, 0.7)`;
    });
    
    const borderColors = backgroundColors.map(color => 
      color.replace('0.7', '1')
    );
    
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
          hoverOffset: 15,
        }
      ]
    };
  };

  // Prepare chart data for efficiency metrics radar chart
  const getEfficiencyRadarChartData = () => {
    if (!comparisonData || comparisonData.length === 0) return null;
    
    // Calculate normalized metrics on a 0-100 scale for all seasons
    const normalizedData = comparisonData.map(item => {
      // Find the maximum values across all seasons for normalization
      const maxYield = Math.max(...comparisonData.map(d => d.yield));
      const maxROI = Math.max(...comparisonData.map(d => d.roi));
      const maxProfit = Math.max(...comparisonData.map(d => d.profit));
      
      return {
        season: new Date(item.sowing_date).toLocaleString('default', { month: 'short' }) + ' ' + 
                new Date(item.sowing_date).getFullYear(),
        // Normalize values to 0-100 scale
        yieldEfficiency: (item.yield / maxYield) * 100,
        costEfficiency: item.total_cost > 0 ? 
                       (Math.min(...comparisonData.map(d => d.total_cost)) / item.total_cost) * 100 : 0,
        profitEfficiency: (item.profit / maxProfit) * 100,
        roiEfficiency: (item.roi / maxROI) * 100,
        landEfficiency: item.yield_per_area / Math.max(...comparisonData.map(d => d.yield_per_area)) * 100
      };
    });
    
    return {
      labels: ['Yield Efficiency', 'Cost Efficiency', 'Profit Efficiency', 'ROI Efficiency', 'Land Efficiency'],
      datasets: normalizedData.map((item, index) => {
        const hue = 180 + (index * 40) % 180;
        return {
          label: item.season,
          data: [
            item.yieldEfficiency, 
            item.costEfficiency, 
            item.profitEfficiency, 
            item.roiEfficiency, 
            item.landEfficiency
          ],
          backgroundColor: `hsla(${hue}, 100%, 50%, 0.1)`,
          borderColor: `hsla(${hue}, 100%, 50%, 1)`,
          borderWidth: 2,
          pointBackgroundColor: `hsla(${hue}, 100%, 50%, 1)`,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: `hsla(${hue}, 100%, 50%, 1)`,
        };
      })
    };
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgb(148, 163, 184)',
          font: {
            family: "'JetBrains Mono', monospace",
            size: 11
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        titleColor: 'rgb(148, 163, 184)',
        bodyColor: 'rgb(226, 232, 240)',
        borderColor: 'rgba(0, 255, 255, 0.3)',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        boxPadding: 5,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2);
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
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: 'rgb(148, 163, 184)',
          font: {
            family: "'JetBrains Mono', monospace",
            size: 10
          }
        }
      },
      y1: {
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'rgb(148, 163, 184)',
          font: {
            family: "'JetBrains Mono', monospace",
            size: 10
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: 'rgb(148, 163, 184)',
          font: {
            family: "'JetBrains Mono', monospace",
            size: 10
          }
        }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeOutQuart'
    }
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'rgb(148, 163, 184)',
          font: {
            family: "'JetBrains Mono', monospace",
            size: 10
          },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        titleColor: 'rgb(148, 163, 184)',
        bodyColor: 'rgb(226, 232, 240)',
        borderColor: 'rgba(0, 255, 255, 0.3)',
        borderWidth: 1
      }
    },
    cutout: '65%',
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };

  const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgb(148, 163, 184)',
          font: {
            family: "'JetBrains Mono', monospace",
            size: 10
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        titleColor: 'rgb(148, 163, 184)',
        bodyColor: 'rgb(226, 232, 240)',
        borderColor: 'rgba(0, 255, 255, 0.3)',
        borderWidth: 1
      }
    },
    scales: {
      r: {
        angleLines: {
          color: 'rgba(148, 163, 184, 0.2)',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        pointLabels: {
          color: 'rgb(148, 163, 184)',
          font: {
            family: "'JetBrains Mono', monospace",
            size: 10
          }
        },
        ticks: {
          backdropColor: 'transparent',
          color: 'rgb(148, 163, 184)',
          font: {
            family: "'JetBrains Mono', monospace",
            size: 8
          }
        }
      }
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-medium text-cyan-400 mb-4 flex items-center">
          <span className="text-lg mr-2">🔄</span>
          Seasonal Pattern Analysis
        </h3>
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="w-12 h-12 rounded-full absolute border-4 border-solid border-gray-700"></div>
            <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-solid border-cyan-400 border-t-transparent"></div>
          </div>
        </div>
        <div className="text-center mt-4 text-cyan-300 opacity-75 text-sm">
          Processing temporal agricultural data...
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-medium text-cyan-400 mb-4 flex items-center">
          <span className="text-lg mr-2">⚠️</span>
          Seasonal Pattern Analysis
        </h3>
        <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-6 text-center">
          <div className="text-3xl mb-3">⚠️</div>
          <h3 className="text-lg font-medium text-red-300 mb-2">System Error</h3>
          <p className="text-red-400">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-red-800/50 hover:bg-red-700/50 text-red-200 rounded-md border border-red-600/50 transition-all"
            onClick={() => window.location.reload()}
          >
            Reinitialize Module
          </button>
        </div>
      </div>
    );
  }

  // Render when no data is available
  if (cropTypes.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-medium text-cyan-400 mb-4 flex items-center">
          <span className="text-lg mr-2">🔄</span>
          Seasonal Pattern Analysis
        </h3>
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-6 text-center">
          <div className="text-3xl mb-3">ℹ️</div>
          <h3 className="text-lg font-medium text-blue-300 mb-2">No Historical Data</h3>
          <p className="text-blue-400">
            Temporal analysis requires completed crop cycles.
            Complete your current agricultural cycle or initiate a new one to enable comparative analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
      <h3 className="text-lg font-medium text-cyan-400 mb-4 flex items-center">
        <span className="text-lg mr-2">📊</span>
        Seasonal Pattern Analysis
      </h3>
      
      {/* Crop selection */}
      <div className="mb-6">
        <label htmlFor="cropType" className="block text-sm font-medium text-blue-300 mb-1">
          Select Crop Variant
        </label>
        <select
          id="cropType"
          className="block w-full p-2 bg-gray-800/70 border border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-gray-200"
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
      <div className="mb-6 border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('performance')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'performance'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
            } transition-all duration-200`}
          >
            Performance Metrics
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'financial'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
            } transition-all duration-200`}
          >
            Financial Analysis
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'resources'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
            } transition-all duration-200`}
          >
            Resource Allocation
          </button>
          <button
            onClick={() => setActiveTab('efficiency')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'efficiency'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
            } transition-all duration-200`}
          >
            Efficiency Matrix
          </button>
        </nav>
      </div>

      {/* Chart display */}
      {comparisonData && comparisonData.length > 0 ? (
        <div>
          <div className="h-80 mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-cyan-900/10 rounded-lg"></div>
            {activeTab === 'performance' && getPerformanceChartData() && (
              <Line data={getPerformanceChartData()} options={lineChartOptions} />
            )}
            {activeTab === 'financial' && getFinancialChartData() && (
              <Doughnut data={getFinancialChartData()} options={doughnutChartOptions} />
            )}
            {activeTab === 'resources' && getResourceAllocationChartData() && (
              <Doughnut data={getResourceAllocationChartData()} options={doughnutChartOptions} />
            )}
            {activeTab === 'efficiency' && getEfficiencyRadarChartData() && (
              <Radar data={getEfficiencyRadarChartData()} options={radarChartOptions} />
            )}
          </div>

          {/* AI Insights Section */}
          {aiInsights && (
            <div className="mt-6 p-5 bg-blue-900/20 border border-blue-800/30 rounded-lg">
              <h4 className="font-medium text-cyan-300 mb-3 flex items-center">
                <span className="mr-2 text-xs">🧠</span>
                AI-Enhanced Insights
              </h4>

              <div className="text-blue-100 mb-3 text-sm">
                {aiInsights.summary}
              </div>
              
              {aiInsights.anomalies.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-cyan-400 text-xs uppercase tracking-wider mb-1">Detected Anomalies</h5>
                  <ul className="list-disc list-inside text-blue-200 text-sm space-y-1">
                    {aiInsights.anomalies.map((anomaly, index) => (
                      <li key={index}>{anomaly}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div>
                <h5 className="text-cyan-400 text-xs uppercase tracking-wider mb-1">Optimization Recommendations</h5>
                <ul className="list-disc list-inside text-blue-200 text-sm space-y-1">
                  {aiInsights.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-3 text-xs text-blue-400 italic">
                Analysis based on {comparisonData.length} {comparisonData.length === 1 ? 'season' : 'seasons'} of {selectedCrop} cultivation data
              </div>
            </div>
          )}

          {/* Explanatory text for charts */}
          <div className="mt-4 text-gray-400 text-sm">
            {activeTab === 'performance' && (
              <p>
                This visualization tracks yield and ROI performance across multiple growing seasons,
                revealing temporal patterns and correlations between productivity and profitability.
              </p>
            )}
            {activeTab === 'financial' && (
              <p>
                The financial analysis compares revenue, costs, and profit across seasons,
                enabling identification of economic optimization opportunities.
              </p>
            )}
            {activeTab === 'resources' && (
              <p>
                This breakdown illustrates the proportional allocation of resources for the most recent growing season,
                highlighting potential areas for cost optimization.
              </p>
            )}
            {activeTab === 'efficiency' && (
              <p>
                The efficiency matrix provides a normalized comparison of key performance indicators across seasons,
                with higher values indicating better efficiency in each category.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-6 text-center">
          <div className="text-3xl mb-3">⚠️</div>
          <h3 className="text-lg font-medium text-yellow-300 mb-2">Insufficient Temporal Data</h3>
          <p className="text-yellow-400">
            The analysis module requires completed crop cycles for {selectedCrop}. 
            Complete at least one full agricultural cycle to enable comparative analytics.
          </p>
        </div>
      )}
    </div>
  );
};

export default CropComparisonTool;
