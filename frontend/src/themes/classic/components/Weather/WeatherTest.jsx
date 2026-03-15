import React from 'react';
import { useWeather } from '../../../../context/WeatherContext';

const WeatherTest = () => {
  const { 
    weatherData, 
    location, 
    isLoading, 
    error, 
    getCurrentWeather,
    getAgriculturalInsights,
    getForecast 
  } = useWeather();

  const currentWeather = getCurrentWeather();
  const insights = getAgriculturalInsights();
  const forecast = getForecast(3);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Weather Integration Test</h2>
      
      {/* Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Status</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-3 rounded ${isLoading ? 'bg-yellow-100' : 'bg-green-100'}`}>
            <p className="font-medium">Loading: {isLoading ? 'Yes' : 'No'}</p>
          </div>
          <div className={`p-3 rounded ${error ? 'bg-red-100' : 'bg-green-100'}`}>
            <p className="font-medium">Error: {error ? 'Yes' : 'No'}</p>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <div className={`p-3 rounded ${weatherData ? 'bg-green-100' : 'bg-gray-100'}`}>
            <p className="font-medium">Data: {weatherData ? 'Loaded' : 'None'}</p>
          </div>
        </div>
      </div>

      {/* Location */}
      {location && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Location</h3>
          <div className="bg-blue-50 p-3 rounded">
            <p>Name: {location.name}</p>
            <p>Coordinates: {location.lat}, {location.lon}</p>
          </div>
        </div>
      )}

      {/* Current Weather */}
      {currentWeather && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Current Weather</h3>
          <div className="bg-gray-50 p-3 rounded">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <p>Temperature: {currentWeather.temperature}</p>
              <p>Feels Like: {currentWeather.feelsLike}</p>
              <p>Humidity: {currentWeather.humidity}</p>
              <p>Wind Speed: {currentWeather.windSpeed}</p>
            </div>
            <p className="mt-2">Description: {currentWeather.description}</p>
          </div>
        </div>
      )}

      {/* Agricultural Insights */}
      {insights && insights.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Agricultural Insights ({insights.length})</h3>
          <div className="space-y-2">
            {insights.slice(0, 3).map((insight, index) => (
              <div key={index} className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                <p className="font-medium">{insight.title}</p>
                <p className="text-sm text-gray-600">{insight.message}</p>
                <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${
                  insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                  insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {insight.priority} priority
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forecast */}
      {forecast && forecast.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">3-Day Forecast</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {forecast.map((day, index) => (
              <div key={index} className="bg-blue-50 p-3 rounded">
                <p className="font-medium">{day.date.toLocaleDateString()}</p>
                <p>Max: {day.maxTemp}°C | Min: {day.minTemp}°C</p>
                <p>Humidity: {day.humidity}%</p>
                <p>Rain: {day.precipitation.toFixed(1)}mm</p>
                <p className="text-sm capitalize">{day.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw Data (for debugging) */}
      <details className="mt-6">
        <summary className="cursor-pointer font-semibold">Raw Weather Data (Debug)</summary>
        <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
          {JSON.stringify({ weatherData, location, currentWeather, insights: insights?.slice(0, 2) }, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default WeatherTest;