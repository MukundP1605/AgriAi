import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';
import { 
  DocumentArrowDownIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const AnalyticsPDFExport = ({ sessionId }) => {
  const { getToken } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [lastExportDate, setLastExportDate] = useState(null);
  const [exportOptions, setExportOptions] = useState({
    includeOverview: true,
    includeDetailedReports: true,
    includeCharts: true,
    includeInsights: true,
    includeFinancials: true,
    includeTimeline: true,
    includeRecommendations: true
  });

  const handleOptionChange = (option) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };  const generateAnalyticsPDF = async () => {
    if (!sessionId) {
      setError('Session ID is required for PDF generation');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);      // Prepare the data in the format expected by the backend
      const requestData = {
        session_id: parseInt(sessionId, 10), // Ensure session_id is an integer
        export_options: {
          // Ensure all boolean values are explicitly set
          includeOverview: Boolean(exportOptions.includeOverview),
          includeDetailedReports: Boolean(exportOptions.includeDetailedReports),
          includeCharts: Boolean(exportOptions.includeCharts),
          includeInsights: Boolean(exportOptions.includeInsights),
          includeFinancials: Boolean(exportOptions.includeFinancials),
          includeTimeline: Boolean(exportOptions.includeTimeline),
          includeRecommendations: Boolean(exportOptions.includeRecommendations)
        }
      };

      try {
        // First try server-side PDF generation
        const token = getToken();
        const response = await axios.post(
          `http://127.0.0.1:8000/api/crop-management/analytics/export-pdf`,
          requestData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            responseType: 'blob'
          }
        );        // Create blob and download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const timestamp = new Date().toISOString().split('T')[0];
        link.download = `crop-analytics-report-${sessionId}-${timestamp}.pdf`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setLastExportDate(new Date().toISOString());
      } catch (apiError) {
        // If server-side generation fails with 404 or 422, attempt client-side generation
        if (apiError.response && (apiError.response.status === 404 || apiError.response.status === 422)) {
          console.log("Backend PDF generation failed, falling back to client-side generation");
          
          // Check if we can access the error detail for debugging
          if (apiError.response.data) {
            try {
              // For blob responses, we need to read the blob to get the error message
              const errorBlob = apiError.response.data;
              const errorText = await new Response(errorBlob).text();
              try {                const errorJson = JSON.parse(errorText);
                console.error("API Error Details:", errorJson);
                
                // Provide a more user-friendly error message
                if (errorJson.detail) {
                  if (typeof errorJson.detail === 'string' && errorJson.detail.includes('Validation error')) {
                    setError(`PDF Generation Error: The server could not validate the export options. Using client-side fallback.`);
                  } else if (Array.isArray(errorJson.detail)) {
                    // Handle array of validation errors
                    const errorMessages = errorJson.detail.map(err => 
                      err.msg ? `${err.loc?.join('.')}: ${err.msg}` : JSON.stringify(err)
                    ).join(', ');
                    setError(`Validation errors: ${errorMessages}. Using client-side fallback.`);
                  } else {
                    setError(`Server error: ${typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail)}`);
                  }
                } else {
                  setError(`Server error: ${JSON.stringify(errorJson)}`);
                }
              } catch (e) {
                console.error("API Error Text:", errorText);
              }
            } catch (e) {
              console.error("Could not parse error response:", e);
            }
          }
          
          await generateClientSidePDF();
        } else {
          // If it's another error, re-throw it to be caught by the outer catch
          throw apiError;
        }
      }} catch (err) {
      console.error('Error generating PDF:', err);
      
      // Better error handling to provide more context
      let errorMessage;
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 422) {
          errorMessage = 'Data validation error. Please check the session ID and export options.';
          
          if (err.response.data && err.response.data.detail) {
            if (Array.isArray(err.response.data.detail)) {
              // Pydantic validation errors come as an array
              errorMessage = err.response.data.detail.map(error => 
                `${error.loc.join('.')} - ${error.msg}`
              ).join(', ');
            } else {
              errorMessage = err.response.data.detail;
            }
          }
        } else if (err.response.status === 404) {
          errorMessage = 'PDF export service not found. This feature may not be available yet.';
        } else {
          errorMessage = err.response.data?.detail || `Server error (${err.response.status})`;
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your network connection.';
      } else {
        // Something happened in setting up the request
        errorMessage = err.message || 'Failed to generate analytics PDF report';
      }
      
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  // Fallback function for client-side PDF generation
  const generateClientSidePDF = async () => {
    try {
      // Dynamically import libraries only when needed
      const jsPDFModule = await import('jspdf');
      const html2canvasModule = await import('html2canvas');
      const jsPDF = jsPDFModule.default;
      const html2canvas = html2canvasModule.default;

      // Create a temporary container with the data we want to capture
      const container = document.createElement('div');
      container.style.width = '800px';
      container.style.padding = '20px';
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.backgroundColor = '#fff';
      
      // Add a title
      const title = document.createElement('h1');
      title.textContent = 'Crop Analytics Report';
      title.style.textAlign = 'center';
      title.style.color = '#333';
      title.style.marginBottom = '20px';
      container.appendChild(title);
        // Add session information
      const sessionInfo = document.createElement('p');
      sessionInfo.textContent = `Session ID: ${sessionId}`;
      sessionInfo.style.marginBottom = '10px';
      container.appendChild(sessionInfo);
      
      // Add date information
      const dateInfo = document.createElement('p');
      dateInfo.textContent = `Generated on: ${new Date().toLocaleString()}`;
      dateInfo.style.marginBottom = '10px';
      container.appendChild(dateInfo);
      
      // Add notice about client-side generation
      const noticeInfo = document.createElement('p');
      noticeInfo.innerHTML = '<strong>Note:</strong> This PDF was generated client-side as the server-side PDF generation service returned an error. This is a limited report with basic formatting. For a complete report, please ensure the backend API is properly configured.';
      noticeInfo.style.marginBottom = '20px';
      noticeInfo.style.color = '#ff6b6b';
      noticeInfo.style.padding = '10px';
      noticeInfo.style.border = '1px solid #ff6b6b';
      noticeInfo.style.borderRadius = '5px';
      noticeInfo.style.backgroundColor = '#fff9f9';
      container.appendChild(noticeInfo);
      
      // Add a separator
      const separator = document.createElement('hr');
      container.appendChild(separator);
      
      // Add sections based on the export options
      if (exportOptions.includeOverview) {
        const section = document.createElement('div');
        section.innerHTML = `
          <h2 style="color: #007bff; margin-top: 20px;">Overview Summary</h2>
          <p>This section provides a summary of key performance indicators for the crop session.</p>
          <p><strong>Note:</strong> This is a client-side generated report. For complete data, please ensure the backend API is properly configured.</p>
        `;
        container.appendChild(section);
      }
      
      if (exportOptions.includeFinancials) {
        const section = document.createElement('div');
        section.innerHTML = `
          <h2 style="color: #28a745; margin-top: 20px;">Financial Analysis</h2>
          <p>This section provides financial metrics and cost breakdown analysis.</p>
          <p><strong>Note:</strong> This is a client-side generated report. For complete data, please ensure the backend API is properly configured.</p>
        `;
        container.appendChild(section);
      }
      
      // Add more sections based on export options
      if (exportOptions.includeDetailedReports) {
        const section = document.createElement('div');
        section.innerHTML = `
          <h2 style="color: #dc3545; margin-top: 20px;">Detailed Reports</h2>
          <p>This section contains detailed reports of crop performance.</p>
          <p><strong>Note:</strong> This is a client-side generated report. For complete data, please ensure the backend API is properly configured.</p>
        `;
        container.appendChild(section);
      }
      
      // Add notice about client-side generation
      const notice = document.createElement('div');
      notice.style.marginTop = '30px';
      notice.style.padding = '10px';
      notice.style.backgroundColor = '#f8f9fa';
      notice.style.border = '1px solid #dee2e6';
      notice.style.borderRadius = '4px';
      notice.innerHTML = `
        <p style="color: #6c757d; font-style: italic;">
          <strong>Note:</strong> This PDF was generated client-side as the server-side PDF generation service was unavailable.
          Some data and analytics may be limited or missing. For a complete report, please contact support.
        </p>
      `;
      container.appendChild(notice);
      
      // Add footer
      const footer = document.createElement('div');
      footer.style.marginTop = '40px';
      footer.style.textAlign = 'center';
      footer.style.color = '#777';
      footer.innerHTML = `
        <p>© ${new Date().getFullYear()} AgriAI - Generated on ${new Date().toLocaleString()}</p>
      `;
      container.appendChild(footer);
      
      // Append the container to the document body
      document.body.appendChild(container);
      
      try {
        // Convert the container to canvas
        const canvas = await html2canvas(container);
        
        // Create a new PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 30;
        
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        
        // Download the PDF
        const timestamp = new Date().toISOString().split('T')[0];
        pdf.save(`crop-analytics-report-${sessionId}-${timestamp}-client-side.pdf`);
        
        setLastExportDate(new Date().toISOString());
        
        // Show success notification
        setError("PDF generated client-side. Some data may be limited. Please ensure the backend API is properly configured for full reports.");
      } finally {
        // Remove the container from the document
        document.body.removeChild(container);
      }
    } catch (err) {
      console.error('Error generating client-side PDF:', err);
      throw new Error('Failed to generate PDF client-side: ' + (err.message || 'Unknown error'));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportSections = [
    {
      id: 'includeOverview',
      name: 'Overview Summary',
      description: 'Key performance indicators and session overview',
      icon: ChartBarIcon,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: 'includeDetailedReports',
      name: 'Detailed Reports',
      description: 'Comprehensive yield and performance analysis',
      icon: DocumentTextIcon,
      color: 'text-green-600 bg-green-100'
    },
    {
      id: 'includeCharts',
      name: 'Advanced Charts',
      description: 'Growth trends, yield analysis, and cost breakdowns',
      icon: ChartBarIcon,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      id: 'includeInsights',
      name: 'AI Insights',
      description: 'Personalized recommendations and optimization tips',
      icon: LightBulbIcon,
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      id: 'includeFinancials',
      name: 'Financial Analysis',
      description: 'Cost breakdown, revenue analysis, and ROI calculations',
      icon: CurrencyDollarIcon,
      color: 'text-emerald-600 bg-emerald-100'
    },
    {
      id: 'includeTimeline',
      name: 'Timeline Data',
      description: 'Crop lifecycle timeline and milestone tracking',
      icon: CalendarIcon,
      color: 'text-indigo-600 bg-indigo-100'
    },
    {
      id: 'includeRecommendations',
      name: 'Recommendations',
      description: 'Action items and future improvement suggestions',
      icon: CheckCircleIcon,
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  const selectedSectionsCount = Object.values(exportOptions).filter(Boolean).length;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <DocumentArrowDownIcon className="h-8 w-8 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Analytics PDF Export</h2>
            <p className="text-gray-600">Generate comprehensive analytics report</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Session: {sessionId || 'Not selected'}
        </div>
      </div>      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error}</p>
            {error.includes("client-side") && (
              <p className="ml-7 mt-2 text-sm text-gray-600">
                Note: The PDF was generated client-side as the server-side PDF generation service was unavailable. 
                This is a limited report with basic formatting. For a complete report, please ensure the backend API is properly configured.
              </p>
            )}
          </div>
        </div>
      )}      {/* Last Export Info */}
      {lastExportDate && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <p className="text-green-700">
              Last export generated: {formatDate(lastExportDate)}
            </p>
          </div>
        </div>
      )}
      
      {/* Fallback Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <ClockIcon className="h-5 w-5 text-blue-600" />
          <p className="text-blue-700">
            Note: If the PDF generation service is unavailable on the server, a client-side fallback will be used with limited data.
          </p>
        </div>
      </div>
      
      {/* Fallback Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <ClockIcon className="h-5 w-5 text-blue-600" />
          <p className="text-blue-700">
            Note: If the PDF generation service is unavailable on the server, please contact your administrator to enable this feature.
          </p>
        </div>
      </div>

      {/* Export Options */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Export Options</h3>
          <div className="text-sm text-gray-500">
            {selectedSectionsCount} of {exportSections.length} sections selected
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => {
              const allSelected = Object.values(exportOptions).every(Boolean);
              const newOptions = {};
              exportSections.forEach(section => {
                newOptions[section.id] = !allSelected;
              });
              setExportOptions(newOptions);
            }}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition duration-200"
          >
            {Object.values(exportOptions).every(Boolean) ? 'Deselect All' : 'Select All'}
          </button>
          <button
            onClick={() => {
              const defaultOptions = {
                includeOverview: true,
                includeDetailedReports: true,
                includeCharts: false,
                includeInsights: true,
                includeFinancials: true,
                includeTimeline: false,
                includeRecommendations: true
              };
              setExportOptions(defaultOptions);
            }}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition duration-200"
          >
            Default Selection
          </button>
        </div>

        {/* Section Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exportSections.map((section) => (
            <div
              key={section.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                exportOptions[section.id]
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleOptionChange(section.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className={`p-2 rounded-lg ${section.color}`}>
                    <section.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-800">{section.name}</h4>
                    <input
                      type="checkbox"
                      checked={exportOptions[section.id]}
                      onChange={() => handleOptionChange(section.id)}
                      className="text-green-600 focus:ring-green-500"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Report Preview Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Report Preview</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Estimated pages: {Math.max(2, selectedSectionsCount * 2)}-{selectedSectionsCount * 3}</p>
            <p>• Format: PDF with charts and tables</p>
            <p>• File size: ~{Math.max(0.5, selectedSectionsCount * 0.3).toFixed(1)} MB</p>
            {selectedSectionsCount === 0 && (
              <p className="text-red-600">• Please select at least one section to export</p>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {sessionId ? (
              <span className="flex items-center space-x-1">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span>Ready to generate report</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1">
                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                <span>Session ID required</span>
              </span>
            )}
          </div>
          
          <button
            onClick={generateAnalyticsPDF}
            disabled={isGenerating || !sessionId || selectedSectionsCount === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isGenerating || !sessionId || selectedSectionsCount === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <DocumentArrowDownIcon className="h-5 w-5" />
                <span>Generate Analytics Report</span>
              </>
            )}
          </button>
        </div>

        {/* Additional Options */}
        <div className="border-t border-gray-200 pt-4">
          <details className="text-sm">
            <summary className="font-medium text-gray-700 cursor-pointer hover:text-gray-900">
              Advanced Options
            </summary>
            <div className="mt-3 space-y-2 text-gray-600">
              <p>• Charts will be rendered as high-resolution images</p>
              <p>• Financial data will include currency formatting</p>
              <p>• Timestamps will use your local timezone</p>
              <p>• Report includes AgriAI branding and disclaimers</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

// Explicitly defining the component for export
const AnalyticsPDFExportComponent = AnalyticsPDFExport;
export default AnalyticsPDFExportComponent;
