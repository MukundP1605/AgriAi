import React from 'react';
import { useWeather } from '../../../../context/WeatherContext';
import {
  SunIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  MapPinIcon,
  FireIcon,
  EyeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const WeatherWidget = ({ className = '' }) => {
  const { 
    weatherData, 
    location, 
    isLoading, 
    error, 
    refreshWeather, 
    getCurrentWeather,
    getWeatherIcon,
    lastUpdated 
  } = useWeather();

  const currentWeather = getCurrentWeather();

  if (isLoading && !weatherData) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-40"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-red-800">Weather Error</h3>
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={refreshWeather}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!weatherData || !currentWeather) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
        <p className="text-gray-600">No weather data available</p>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-green-50 rounded-lg shadow-md p-6 border border-blue-100 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <SunIcon className="h-6 w-6 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-800">Current Weather</h3>
        </div>
        <button
          onClick={refreshWeather}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          title="Refresh weather data"
        >
          <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Location */}
      <div className="flex items-center space-x-2 mb-4">
        <MapPinIcon className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">
          {location?.name || 'Unknown Location'}
        </span>
      </div>

      {/* Main Weather Info */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            {currentWeather.temperature}
          </div>
          <div className="text-sm text-gray-600 mb-2">
            Feels like {currentWeather.feelsLike}
          </div>
          <div className="text-sm text-gray-700 capitalize">
            {currentWeather.description}
          </div>
        </div>
        <div className="text-right">
          <img
            src={getWeatherIcon(weatherData.current.icon)}
            alt={weatherData.current.description}
            className="h-16 w-16"
          />
        </div>
      </div>

      {/* Weather Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 rounded-full">
            <CurrencyDollarIcon className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Humidity</div>
            <div className="font-semibold text-gray-800">{currentWeather.humidity}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-green-100 rounded-full">
            <EyeIcon className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Wind</div>
            <div className="font-semibold text-gray-800">{currentWeather.windSpeed}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-purple-100 rounded-full">
            <FireIcon className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Pressure</div>
            <div className="font-semibold text-gray-800">{currentWeather.pressure}</div>
          </div>
        </div>
        
        {weatherData.current.uvIndex !== undefined && (
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-orange-100 rounded-full">
              <SunIcon className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">UV Index</div>
              <div className="font-semibold text-gray-800">{weatherData.current.uvIndex}</div>
            </div>
          </div>
        )}
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;