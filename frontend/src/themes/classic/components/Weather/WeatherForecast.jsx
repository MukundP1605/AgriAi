import React from 'react';
import { useWeather } from '../../../../context/WeatherContext';
import {
  CalendarIcon,
  CloudIcon,
  SunIcon,
  FireIcon
} from '@heroicons/react/24/outline';

const WeatherForecast = ({ className = '', days = 5 }) => {
  const { getForecast, getWeatherIcon, isLoading, error } = useWeather();
  
  const forecast = getForecast(days);

  if (isLoading && forecast.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || forecast.length === 0) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Weather Forecast</h3>
        <p className="text-gray-600">Forecast data not available</p>
      </div>
    );
  }

  const getWeatherColor = (condition) => {
    switch (condition.toLowerCase()) {
      case 'clear': return 'text-yellow-600 bg-yellow-50';
      case 'clouds': return 'text-gray-600 bg-gray-50';
      case 'rain': return 'text-blue-600 bg-blue-50';
      case 'snow': return 'text-blue-400 bg-blue-50';
      case 'thunderstorm': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-2 mb-6">
        <CalendarIcon className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">{days}-Day Forecast</h3>
      </div>

      {/* Forecast List */}
      <div className="space-y-4">
        {forecast.map((day, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
            {/* Date */}
            <div className="flex-1">
              <div className="font-medium text-gray-800">
                {formatDate(day.date)}
              </div>
              <div className="text-sm text-gray-500 capitalize">
                {day.description}
              </div>
            </div>

            {/* Weather Icon */}
            <div className="flex-shrink-0 mx-4">
              <img
                src={getWeatherIcon(day.icon, '2x')}
                alt={day.condition}
                className="h-10 w-10"
              />
            </div>

            {/* Temperature Range */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="text-right">
                <div className="font-semibold text-gray-800">
                  {day.maxTemp}°
                </div>
                <div className="text-sm text-gray-500">
                  {day.minTemp}°
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
              {/* Precipitation */}
              {day.precipitation > 0 && (
                <div className="flex items-center space-x-1 text-blue-600">
                  <CloudIcon className="h-4 w-4" />
                  <span className="text-xs">{day.precipitation.toFixed(1)}mm</span>
                </div>
              )}
              
              {/* Humidity */}
              <div className="flex items-center space-x-1 text-gray-500">
                <span className="text-xs">{day.humidity}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Agricultural Tips */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-800 mb-2">Quick Tips</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {forecast[0] && (
            <>
              {forecast[0].precipitation > 10 && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <CloudIcon className="h-4 w-4" />
                  <span>Heavy rain expected - adjust irrigation</span>
                </div>
              )}
              
              {forecast[0].maxTemp > 30 && (
                <div className="flex items-center space-x-2 text-orange-600">
                  <FireIcon className="h-4 w-4" />
                  <span>High temps - ensure adequate water</span>
                </div>
              )}
              
              {forecast[0].maxTemp < 5 && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <FireIcon className="h-4 w-4" />
                  <span>Frost risk - protect sensitive crops</span>
                </div>
              )}
              
              {forecast.slice(0, 3).every(day => day.precipitation === 0) && (
                <div className="flex items-center space-x-2 text-yellow-600">
                  <SunIcon className="h-4 w-4" />
                  <span>Dry period - monitor soil moisture</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherForecast;