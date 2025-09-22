import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const ReportsGenerator = ({ sessionId }) => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [generating, setGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    if (sessionId) {
      fetchReportData();
    }
  }, [sessionId]);
  const fetchReportData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      
      const response = await axios.get(
        `http://127.0.0.1:8000/api/crop-management/reports/${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setReportData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching report data:', err);
      if (err.response?.status === 400) {
        setError('Harvest record not found. Please record a harvest first to view reports.');
      } else {
        setError(err.response?.data?.detail || 'Failed to fetch report data. Make sure harvest data has been recorded.');
      }
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
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Reports Generator</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Reports Generator</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchReportData}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Reports Generator</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">No Data Available</h3>
          <p className="text-yellow-600">
            No report data is available for this crop session. Please ensure you have recorded your harvest data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Crop Reports</h2>
      
      <div className="flex mb-6 border-b border-gray-200">
        <button 
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'summary' ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-500 hover:text-green-500'}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button 
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'inputs' ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-500 hover:text-green-500'}`}
          onClick={() => setActiveTab('inputs')}
        >
          Input Analysis
        </button>
        <button 
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'financial' ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-500 hover:text-green-500'}`}
          onClick={() => setActiveTab('financial')}
        >
          Financial
        </button>
        <button 
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'productivity' ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-500 hover:text-green-500'}`}
          onClick={() => setActiveTab('productivity')}
        >
          Productivity
        </button>
      </div>

      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <h3 className="text-lg font-semibold text-green-800 mb-3">Harvest Summary</h3>
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-gray-600">Harvest Date:</span>
                <span className="font-medium">{new Date(reportData.harvest_summary.date).toLocaleDateString()}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{reportData.harvest_summary.quantity} {reportData.harvest_summary.unit}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Quality Grade:</span>
                <span className="font-medium">{reportData.harvest_summary.quality_grade || 'Not specified'}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Sale Price:</span>
                <span className="font-medium">₹{reportData.harvest_summary.sale_price} per {reportData.harvest_summary.unit}</span>
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Financial Summary</h3>
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-gray-600">Total Cost:</span>
                <span className="font-medium">₹{reportData.financial_summary.total_cost.toFixed(2)}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Revenue:</span>
                <span className="font-medium">${reportData.financial_summary.revenue.toFixed(2)}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Profit/Loss:</span>
                <span className={`font-medium ${reportData.financial_summary.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${reportData.financial_summary.profit_loss.toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inputs' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Input Summary</h3>
          <div className="space-y-4">
            {Object.keys(reportData.input_summary).length > 0 ? (
              Object.keys(reportData.input_summary).map((inputType) => (
                <div key={inputType} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-700 capitalize">{inputType}</h4>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      ₹{reportData.input_summary[inputType].total_cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {reportData.input_summary[inputType].items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.name} ({item.quantity} {item.unit})</span>
                        <span>${item.cost.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No input data recorded for this crop session.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'financial' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Financial Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <p className="text-gray-500 text-sm mb-1">Total Cost</p>
              <p className="text-2xl font-bold text-red-600">₹{reportData.financial_summary.total_cost.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <p className="text-gray-500 text-sm mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-600">${reportData.financial_summary.revenue.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <p className="text-gray-500 text-sm mb-1">Profit/Loss</p>
              <p className={`text-2xl font-bold ${reportData.financial_summary.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${reportData.financial_summary.profit_loss.toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Profit/Loss Analysis</h4>
            <div className="h-8 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${reportData.financial_summary.profit_loss >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ 
                  width: `${Math.min(Math.abs(reportData.financial_summary.profit_loss / reportData.financial_summary.total_cost * 100), 100)}%` 
                }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {reportData.financial_summary.profit_loss >= 0 
                ? `Profit margin: ${(reportData.financial_summary.profit_loss / reportData.financial_summary.revenue * 100).toFixed(1)}%` 
                : `Loss: ${Math.abs(reportData.financial_summary.profit_loss / reportData.financial_summary.total_cost * 100).toFixed(1)}% of investment`}
            </p>
          </div>
        </div>
      )}
      
      {activeTab === 'productivity' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Productivity Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-gray-500 mb-1">Yield per Area</p>
              <p className="text-2xl font-bold text-green-600">
                {reportData.productivity_metrics.yield_per_area.toFixed(2)} {reportData.harvest_summary.unit}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-gray-500 mb-1">Cost per Unit</p>
              <p className="text-2xl font-bold text-blue-600">
                ${reportData.productivity_metrics.cost_per_unit.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-gray-500 mb-1">Revenue per Unit</p>
              <p className="text-2xl font-bold text-purple-600">
                ${reportData.productivity_metrics.revenue_per_unit.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-gray-500 mb-1">Profit per Area</p>
              <p className={`text-2xl font-bold ${reportData.productivity_metrics.profit_per_area >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${reportData.productivity_metrics.profit_per_area.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <button
            onClick={fetchReportData}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
          >
            Refresh Data
          </button>
          
          <button
            onClick={handleGeneratePDF}
            disabled={generating}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md flex items-center"
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
                Export PDF
              </>
            )}
          </button>
        </div>
        
        {pdfUrl && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
            <p className="text-green-800">PDF report ready for download!</p>
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
