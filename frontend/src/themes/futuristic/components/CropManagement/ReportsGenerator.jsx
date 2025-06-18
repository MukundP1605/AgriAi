import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';

const ReportsGenerator = ({ sessionId }) => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [detailedReports, setDetailedReports] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    if (sessionId) {
      fetchAllReportData();
    }
  }, [sessionId]);
  const fetchAllReportData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Fetch all report data in parallel
      const [reportResponse, detailedResponse, analyticsResponse, graphResponse] = await Promise.allSettled([
        axios.get(`http://127.0.0.1:8000/api/crop-management/reports/${sessionId}`, { headers }),
        axios.get(`http://127.0.0.1:8000/api/crop-management/detailed-reports/${sessionId}`, { headers }),
        axios.get(`http://127.0.0.1:8000/api/crop-management/analytics/${sessionId}`, { headers }),
        axios.get(`http://127.0.0.1:8000/api/crop-management/graph-data/${sessionId}`, { headers })
      ]);
      
      // Handle each response based on its status
      if (reportResponse.status === 'fulfilled') {
        setReportData(reportResponse.value.data);
      } else if (reportResponse.reason?.response?.status === 400) {
        console.warn('No harvest record found. Please record a harvest first.');
      }
      
      if (detailedResponse.status === 'fulfilled') {
        setDetailedReports(detailedResponse.value.data);
      }
      
      if (analyticsResponse.status === 'fulfilled') {
        setAnalyticsData(analyticsResponse.value.data);
      }
      
      if (graphResponse.status === 'fulfilled') {
        setGraphData(graphResponse.value.data);
      }
      
      // Only show error if all requests failed
      if (reportResponse.status !== 'fulfilled' && 
          detailedResponse.status !== 'fulfilled' && 
          analyticsResponse.status !== 'fulfilled' && 
          graphResponse.status !== 'fulfilled') {
        setError('Failed to fetch report data. Ensure harvest records are created first.');
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err.response?.data?.detail || 'Failed to fetch report data. Ensure harvest analytics are finalized.');
    } finally {
      setLoading(false);
    }
  };
  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      const token = getToken();
      
      const response = await axios.get(
        `http://127.0.0.1:8000/api/crop-management/report/pdf-download/${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setPdfUrl(response.data.pdf_url);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(err.response?.data?.detail || 'Failed to generate PDF report.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-900/40 backdrop-blur-sm rounded-lg border border-cyan-500/20">
        <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center">
          <span className="text-lg mr-2">📊</span>
          Advanced Analytics Dashboard
        </h2>
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-t-2 border-b-2 border-cyan-400 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
            </div>
          </div>
        </div>
        <p className="text-center text-cyan-300 mt-4">Synthesizing agricultural analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-900/40 backdrop-blur-sm rounded-lg border border-cyan-500/20">
        <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center">
          <span className="text-lg mr-2">📊</span>
          Advanced Analytics Dashboard
        </h2>
        <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-300 mb-2">System Error</h3>
          <p className="text-red-400">{error}</p>
          <button 
            onClick={fetchAllReportData}
            className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-md"
          >
            Reinitialize Analytics
          </button>
        </div>
      </div>
    );
  }
  if (!reportData) {
    return (
      <div className="p-6 bg-gray-900/40 backdrop-blur-sm rounded-lg border border-cyan-500/20">
        <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center">
          <span className="text-lg mr-2">📊</span>
          Advanced Analytics Dashboard
        </h2>
        <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-yellow-300 mb-2">Harvest Data Required</h3>
          <p className="text-yellow-400">
            Reports require harvest data to be recorded first. Please record harvest information in the Harvest tab before generating reports.
          </p>
          <div className="mt-4 flex justify-center">
            <button 
              onClick={() => window.location.hash = '#harvest'}
              className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-md"
            >
              Go to Harvest Section
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900/40 backdrop-blur-sm rounded-lg border border-cyan-500/20">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center">
        <span className="text-lg mr-2">📊</span>
        Advanced Analytics Dashboard
      </h2>
      
      <div className="flex mb-6 border-b border-gray-700">
        <button 
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'summary' ? 'text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-400 hover:text-cyan-400'}`}
          onClick={() => setActiveTab('summary')}
        >
          Executive Summary
        </button>
        <button 
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'inputs' ? 'text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-400 hover:text-cyan-400'}`}
          onClick={() => setActiveTab('inputs')}
        >
          Resource Analysis
        </button>
        <button 
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'financial' ? 'text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-400 hover:text-cyan-400'}`}
          onClick={() => setActiveTab('financial')}
        >
          Financial Metrics
        </button>
        <button 
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'productivity' ? 'text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-400 hover:text-cyan-400'}`}
          onClick={() => setActiveTab('productivity')}
        >
          Productivity Analysis
        </button>
        {analyticsData && (
          <button 
            className={`py-2 px-4 font-medium text-sm ${activeTab === 'roi' ? 'text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-400 hover:text-cyan-400'}`}
            onClick={() => setActiveTab('roi')}
          >
            ROI Analytics
          </button>
        )}
        {detailedReports && (
          <button 
            className={`py-2 px-4 font-medium text-sm ${activeTab === 'detailed' ? 'text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-400 hover:text-cyan-400'}`}
            onClick={() => setActiveTab('detailed')}
          >
            Detailed Reports
          </button>
        )}
      </div>

      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-900/30 backdrop-blur-sm rounded-lg p-4 border border-blue-500/30">
            <h3 className="text-lg font-semibold text-blue-300 mb-3">Harvest Metrics</h3>
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-gray-400">Harvest Date:</span>
                <span className="font-medium text-blue-200">{new Date(reportData.harvest_summary.date).toLocaleDateString()}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-400">Yield Volume:</span>
                <span className="font-medium text-blue-200">{reportData.harvest_summary.quantity} {reportData.harvest_summary.unit}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-400">Quality Classification:</span>
                <span className="font-medium text-blue-200">{reportData.harvest_summary.quality_grade || 'Unclassified'}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-400">Market Value:</span>
                <span className="font-medium text-blue-200">${reportData.harvest_summary.sale_price} per {reportData.harvest_summary.unit}</span>
              </p>
            </div>
          </div>
          
          <div className="bg-cyan-900/30 backdrop-blur-sm rounded-lg p-4 border border-cyan-500/30">
            <h3 className="text-lg font-semibold text-cyan-300 mb-3">Financial Analysis</h3>
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-gray-400">Resource Investment:</span>
                <span className="font-medium text-cyan-200">${reportData.financial_summary.total_cost.toFixed(2)}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-400">Gross Revenue:</span>
                <span className="font-medium text-cyan-200">${reportData.financial_summary.revenue.toFixed(2)}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-400">Net Outcome:</span>
                <span className={`font-medium ${reportData.financial_summary.profit_loss >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  ${reportData.financial_summary.profit_loss.toFixed(2)}
                </span>
              </p>
            </div>
            
            {analyticsData && (
              <div className="mt-4 pt-3 border-t border-cyan-800">
                <p className="flex justify-between">
                  <span className="text-gray-400">ROI:</span>
                  <span className={`font-medium ${analyticsData.roi >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {analyticsData.roi.toFixed(1)}%
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'inputs' && (
        <div>
          <h3 className="text-lg font-semibold text-cyan-300 mb-3">Resource Allocation Analysis</h3>
          <div className="space-y-4">
            {Object.keys(reportData.input_summary).length > 0 ? (
              Object.keys(reportData.input_summary).map((inputType) => (
                <div key={inputType} className="border border-gray-700 bg-gray-800/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-cyan-300 capitalize">{inputType}</h4>
                    <span className="bg-cyan-900 text-cyan-300 text-xs px-2 py-1 rounded-full">
                      ${reportData.input_summary[inputType].total_cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {reportData.input_summary[inputType].items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-300">{item.name} ({item.quantity} {item.unit})</span>
                        <span className="text-cyan-200">${item.cost.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No resource allocation data recorded for this agricultural cycle.</p>
            )}
          </div>
          
          {graphData && graphData.cost_by_type && (
            <div className="mt-6">
              <h4 className="font-medium text-cyan-300 mb-3">Resource Distribution</h4>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex h-8 w-full rounded-md overflow-hidden">
                  {graphData.cost_by_type.labels.map((label, index) => {
                    const total = graphData.cost_by_type.data.reduce((sum, val) => sum + val, 0);
                    const percentage = (graphData.cost_by_type.data[index] / total) * 100;
                    
                    const colors = [
                      'bg-cyan-500', 'bg-blue-500', 'bg-purple-500', 
                      'bg-green-500', 'bg-yellow-500', 'bg-red-500'
                    ];
                    
                    return (
                      <div 
                        key={label}
                        className={`${colors[index % colors.length]} h-full`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    );
                  })}
                </div>
                
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {graphData.cost_by_type.labels.map((label, index) => {
                    const colors = [
                      'bg-cyan-500', 'bg-blue-500', 'bg-purple-500', 
                      'bg-green-500', 'bg-yellow-500', 'bg-red-500'
                    ];
                    
                    return (
                      <div key={label} className="flex items-center">
                        <div className={`${colors[index % colors.length]} w-3 h-3 rounded-sm mr-2`}></div>
                        <span className="text-gray-300 text-sm capitalize">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'financial' && (
        <div>
          <h3 className="text-lg font-semibold text-cyan-300 mb-3">Financial Performance Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Total Investment</p>
              <p className="text-2xl font-bold text-red-400">${reportData.financial_summary.total_cost.toFixed(2)}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-400">${reportData.financial_summary.revenue.toFixed(2)}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Net Outcome</p>
              <p className={`text-2xl font-bold ${reportData.financial_summary.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${reportData.financial_summary.profit_loss.toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700">
            <h4 className="font-medium text-cyan-300 mb-2">Profit/Loss Visualization</h4>
            <div className="h-8 w-full bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${reportData.financial_summary.profit_loss >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ 
                  width: `${Math.min(Math.abs(reportData.financial_summary.profit_loss / reportData.financial_summary.total_cost * 100), 100)}%` 
                }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              {reportData.financial_summary.profit_loss >= 0 
                ? `Profitability index: ${(reportData.financial_summary.profit_loss / reportData.financial_summary.revenue * 100).toFixed(1)}%` 
                : `Loss ratio: ${Math.abs(reportData.financial_summary.profit_loss / reportData.financial_summary.total_cost * 100).toFixed(1)}% of investment`}
            </p>
          </div>
          
          {graphData && graphData.cost_vs_revenue && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <h4 className="font-medium text-cyan-300 mb-2">Cost vs Revenue Comparison</h4>
              <div className="flex items-end h-40 space-x-16 mt-4 px-8">
                <div className="flex flex-col items-center">
                  <div 
                    className="w-16 bg-red-500 rounded-t-md" 
                    style={{ height: `${(graphData.cost_vs_revenue.data[0] / Math.max(...graphData.cost_vs_revenue.data) * 100)}%` }}
                  ></div>
                  <p className="mt-2 text-gray-300">{graphData.cost_vs_revenue.labels[0]}</p>
                  <p className="text-sm text-gray-400">${graphData.cost_vs_revenue.data[0].toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-center">
                  <div 
                    className="w-16 bg-green-500 rounded-t-md" 
                    style={{ height: `${(graphData.cost_vs_revenue.data[1] / Math.max(...graphData.cost_vs_revenue.data) * 100)}%` }}
                  ></div>
                  <p className="mt-2 text-gray-300">{graphData.cost_vs_revenue.labels[1]}</p>
                  <p className="text-sm text-gray-400">${graphData.cost_vs_revenue.data[1].toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'productivity' && (
        <div>
          <h3 className="text-lg font-semibold text-cyan-300 mb-3">Productivity Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
              <p className="text-gray-400 mb-1">Yield Efficiency</p>
              <p className="text-2xl font-bold text-cyan-400">
                {reportData.productivity_metrics.yield_per_area.toFixed(2)} {reportData.harvest_summary.unit}
              </p>
              <p className="text-xs text-gray-500 mt-1">Per unit of land area</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
              <p className="text-gray-400 mb-1">Resource Efficiency</p>
              <p className="text-2xl font-bold text-blue-400">
                ${reportData.productivity_metrics.cost_per_unit.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Investment per yield unit</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
              <p className="text-gray-400 mb-1">Revenue Efficiency</p>
              <p className="text-2xl font-bold text-purple-400">
                ${reportData.productivity_metrics.revenue_per_unit.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Revenue per yield unit</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
              <p className="text-gray-400 mb-1">Profit Efficiency</p>
              <p className={`text-2xl font-bold ${reportData.productivity_metrics.profit_per_area >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${reportData.productivity_metrics.profit_per_area.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Net profit per unit of land area</p>
            </div>
          </div>
          
          {graphData && graphData.comparison_data && graphData.comparison_data.labels.length > 1 && (
            <div className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <h4 className="font-medium text-cyan-300 mb-3">Historical Yield Comparison</h4>
              <div className="flex items-end h-40 space-x-6 mt-4 px-4 overflow-x-auto">
                {graphData.comparison_data.labels.map((label, index) => {
                  const maxYield = Math.max(...graphData.comparison_data.yield);
                  const percentage = (graphData.comparison_data.yield[index] / maxYield * 100);
                  
                  return (
                    <div key={label} className="flex flex-col items-center min-w-[50px]">
                      <div 
                        className="w-10 bg-cyan-500 rounded-t-md" 
                        style={{ height: `${percentage}%` }}
                      ></div>
                      <p className="mt-2 text-gray-300 text-sm">{label}</p>
                      <p className="text-xs text-gray-400">{graphData.comparison_data.yield[index].toFixed(1)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'roi' && analyticsData && (
        <div>
          <h3 className="text-lg font-semibold text-cyan-300 mb-3">ROI & Performance Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Return on Investment</p>
              <p className={`text-2xl font-bold ${analyticsData.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {analyticsData.roi.toFixed(1)}%
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Yield</p>
              <p className="text-2xl font-bold text-cyan-400">
                {analyticsData.yield} {analyticsData.yield_unit}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Yield per Area</p>
              <p className="text-2xl font-bold text-blue-400">
                {analyticsData.yield_per_area.toFixed(2)} {analyticsData.yield_unit}/{analyticsData.area_unit}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Profit</p>
              <p className={`text-2xl font-bold ${analyticsData.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${analyticsData.profit.toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700">
            <h4 className="font-medium text-cyan-300 mb-3">Cost Breakdown Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-gray-300 mb-2">Cost Distribution</h5>
                <div className="space-y-2">
                  {Object.keys(analyticsData.cost_percentage).map((type) => (
                    <div key={type} className="flex flex-col">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400 capitalize">{type}</span>
                        <span className="text-cyan-300">{analyticsData.cost_percentage[type].toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-cyan-500 h-2 rounded-full" 
                          style={{ width: `${analyticsData.cost_percentage[type]}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-300 mb-2">Cost Values</h5>
                <div className="space-y-3">
                  {Object.keys(analyticsData.cost_breakdown).map((type) => (
                    <div key={type} className="flex justify-between">
                      <span className="text-gray-400 capitalize">{type}</span>
                      <span className="text-cyan-300">${analyticsData.cost_breakdown[type].toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-700 flex justify-between font-medium">
                    <span className="text-gray-300">Total</span>
                    <span className="text-cyan-300">${analyticsData.total_cost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'detailed' && detailedReports && (
        <div>
          <h3 className="text-lg font-semibold text-cyan-300 mb-3">Advanced Analytical Reports</h3>
          
          <div className="mb-6">
            <h4 className="font-medium text-blue-300 mb-2">Fertilizer Efficiency Analysis</h4>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              {detailedReports.fertilizer_report.applications.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-900/50 rounded p-3">
                      <p className="text-gray-400 text-sm">Total Applications</p>
                      <p className="text-xl font-bold text-blue-400">
                        {detailedReports.fertilizer_report.total_applications}
                      </p>
                    </div>
                    <div className="bg-gray-900/50 rounded p-3">
                      <p className="text-gray-400 text-sm">Total Cost</p>
                      <p className="text-xl font-bold text-blue-400">
                        ${detailedReports.fertilizer_report.total_cost.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Application Timeline</h5>
                    <div className="space-y-2">
                      {detailedReports.fertilizer_report.applications.map((app, index) => (
                        <div key={index} className="flex justify-between bg-gray-900/30 p-2 rounded">
                          <div>
                            <p className="text-cyan-300 font-medium">{app.name}</p>
                            <p className="text-xs text-gray-400">{app.quantity} {app.unit} | ${app.cost.toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-300">{new Date(app.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-400">No fertilizer application data recorded.</p>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium text-purple-300 mb-2">Crop Health Assessment</h4>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-24 h-24 rounded-full border-4 border-gray-700 flex items-center justify-center mr-4">
                  <div className="relative w-20 h-20">
                    <svg viewBox="0 0 36 36" className="w-20 h-20">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#444"
                        strokeWidth="2"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={detailedReports.health_report.overall_health_index > 70 ? "#10B981" : 
                               detailedReports.health_report.overall_health_index > 40 ? "#FBBF24" : "#EF4444"}
                        strokeWidth="2"
                        strokeDasharray={`${detailedReports.health_report.overall_health_index}, 100`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-200">{detailedReports.health_report.overall_health_index}%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="text-lg font-medium text-gray-200">Crop Health Index</h5>
                  <p className="text-gray-400 text-sm">
                    Based on {detailedReports.health_report.pest_disease_incidents} detected issues
                  </p>
                  <p className={`text-sm mt-1 ${detailedReports.health_report.overall_health_index > 70 ? 'text-green-400' : 
                               detailedReports.health_report.overall_health_index > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {detailedReports.health_report.overall_health_index > 70 ? 'Excellent Health' : 
                    detailedReports.health_report.overall_health_index > 40 ? 'Moderate Issues' : 'Significant Concerns'}
                  </p>
                </div>
              </div>
              
              {detailedReports.health_report.alerts.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-300 mb-2">Detected Issues</h5>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {detailedReports.health_report.alerts.map((alert, index) => (
                      <div key={index} className="bg-gray-900/30 p-2 rounded">
                        <div className="flex justify-between items-start">
                          <p className="text-gray-200 font-medium">{alert.name}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            alert.severity === 'high' ? 'bg-red-900/50 text-red-300' :
                            alert.severity === 'medium' ? 'bg-yellow-900/50 text-yellow-300' :
                            'bg-blue-900/50 text-blue-300'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{alert.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-green-300 mb-2">Growth Cycle Analysis</h4>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-700"></div>
                <div className="space-y-6">
                  {detailedReports.stages.map((stage, index) => (
                    <div key={index} className="relative pl-8">
                      <div className="absolute left-2 top-0 w-4 h-4 rounded-full bg-cyan-500 border-2 border-gray-800 z-10"></div>
                      <p className="text-cyan-300 font-medium">{stage.name}</p>
                      <p className="text-xs text-gray-400 mb-1">
                        {new Date(stage.start_date).toLocaleDateString()} - {new Date(stage.end_date).toLocaleDateString()}
                        <span className="ml-2">({stage.duration} days)</span>
                      </p>
                      <p className="text-sm text-gray-300">{stage.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <button
            onClick={fetchAllReportData}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
          >
            Refresh Analytics
          </button>
          
          <button
            onClick={handleGeneratePDF}
            disabled={generating}
            className="bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-md flex items-center"
          >
            {generating ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF Report
              </>
            )}
          </button>
        </div>
        
        {pdfUrl && (
          <div className="mt-4 p-3 bg-green-900/30 border border-green-500/30 rounded-lg flex justify-between items-center">
            <p className="text-green-300">PDF analytics report ready for export!</p>
            <a 
              href={pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md text-sm"
            >
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsGenerator;
