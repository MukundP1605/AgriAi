import React, { useState } from 'react';
import { useWeather } from '../../../../context/WeatherContext';
import { useAuth } from '../context/AuthContext';

const ChatTest = () => {
  const { getCurrentWeather, weatherData, getAgriculturalInsights, location } = useWeather();
  const { isAuthenticated, currentUser, getToken } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const testChatWithWeather = async () => {
    setIsLoading(true);
    try {
      // Prepare weather context like the chat component does
      let weatherContext = "";
      if (weatherData) {
        const currentWeather = getCurrentWeather();
        const insights = getAgriculturalInsights();
        
        weatherContext = `
Current Weather Context (${location?.name || 'user location'}):
- Temperature: ${currentWeather?.temperature || 'N/A'}
- Humidity: ${currentWeather?.humidity || 'N/A'}
- Conditions: ${currentWeather?.description || 'N/A'}
- Weather Insights: ${insights.slice(0, 2).map(i => i.message).join('; ') || 'None'}
        `.trim();
      }

      const testMessage = "What crops should I plant based on current weather?";
      const enhancedMessage = weatherContext 
        ? `${testMessage}\n\n[Weather Context: ${weatherContext}]`
        : testMessage;

      const token = getToken();
      const response = await fetch("http://127.0.0.1:8000/api/chatbot/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          message: enhancedMessage, 
          session_id: currentUser?.email || "test_session" 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setTestResult({
        success: true,
        weatherContext,
        originalMessage: testMessage,
        enhancedMessage,
        botReply: data.reply,
        intent: data.intent
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        weatherContext: weatherContext || "No weather data"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Chat Module Test</h2>
      
      {/* Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-3 rounded ${isAuthenticated ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className="font-medium">Authentication: {isAuthenticated ? 'Logged In' : 'Not Logged In'}</p>
            {currentUser && <p className="text-sm">User: {currentUser.email}</p>}
          </div>
          <div className={`p-3 rounded ${weatherData ? 'bg-green-100' : 'bg-yellow-100'}`}>
            <p className="font-medium">Weather Data: {weatherData ? 'Available' : 'Loading/Unavailable'}</p>
            {location && <p className="text-sm">Location: {location.name}</p>}
          </div>
          <div className="p-3 rounded bg-blue-100">
            <p className="font-medium">Chat Module: Loaded</p>
          </div>
        </div>
      </div>

      {/* Weather Context Preview */}
      {weatherData && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Weather Context for Chat</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p><strong>Temperature:</strong> {getCurrentWeather()?.temperature || 'N/A'}</p>
            <p><strong>Humidity:</strong> {getCurrentWeather()?.humidity || 'N/A'}</p>
            <p><strong>Conditions:</strong> {getCurrentWeather()?.description || 'N/A'}</p>
            <p><strong>Location:</strong> {location?.name || 'N/A'}</p>
            
            {getAgriculturalInsights().length > 0 && (
              <div className="mt-3">
                <p><strong>Agricultural Insights:</strong></p>
                <ul className="list-disc list-inside text-sm">
                  {getAgriculturalInsights().slice(0, 3).map((insight, index) => (
                    <li key={index}>{insight.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test Button */}
      <div className="mb-6">
        <button
          onClick={testChatWithWeather}
          disabled={isLoading || !isAuthenticated}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Testing...' : 'Test Chat with Weather Context'}
        </button>
        {!isAuthenticated && (
          <p className="text-red-600 text-sm mt-2">Please log in to test the chat functionality</p>
        )}
      </div>

      {/* Test Results */}
      {testResult && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Test Results</h3>
          
          {testResult.success ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">✅ Test Successful</h4>
                <p className="text-green-700">Chat integration with weather context is working!</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-semibold text-blue-800 mb-2">Original Message:</h5>
                <p className="text-blue-700">{testResult.originalMessage}</p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h5 className="font-semibold text-purple-800 mb-2">Weather Context Added:</h5>
                <pre className="text-purple-700 text-sm whitespace-pre-wrap">{testResult.weatherContext}</pre>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h5 className="font-semibold text-gray-800 mb-2">Bot Reply:</h5>
                <p className="text-gray-700">{testResult.botReply}</p>
                {testResult.intent && (
                  <p className="text-sm text-gray-600 mt-2">Intent: {testResult.intent}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">❌ Test Failed</h4>
              <p className="text-red-700 mb-2">Error: {testResult.error}</p>
              <div className="text-sm text-red-600">
                <p><strong>Weather Context Available:</strong> {testResult.weatherContext}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatTest;