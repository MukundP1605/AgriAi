import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import weatherService from '../services/weatherService';

const WeatherContext = createContext();

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};

export const WeatherProvider = ({ children }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Get user's geolocation
  const getUserLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          resolve(coords);
        },
        (error) => {
          reject(new Error('Failed to get user location'));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }, []);

  // Fetch weather data by coordinates
  const fetchWeatherByCoords = useCallback(async (lat, lon) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await weatherService.getAgriculturalWeather(lat, lon);
      setWeatherData(data);
      setLocation({ lat, lon, name: data.current.location });
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Weather fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch weather data by city name
  const fetchWeatherByCity = useCallback(async (cityName, countryCode = '') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const coords = await weatherService.getCoordinates(cityName, countryCode);
      setLocation(coords);
      
      const data = await weatherService.getAgriculturalWeather(coords.lat, coords.lon);
      setWeatherData(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Weather fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh current weather data
  const refreshWeather = useCallback(async () => {
    if (location) {
      await fetchWeatherByCoords(location.lat, location.lon);
    }
  }, [location, fetchWeatherByCoords]);

  // Force refresh weather data (clears cache)
  const forceRefreshWeather = useCallback(async () => {
    weatherService.clearCache();
    if (location) {
      await fetchWeatherByCoords(location.lat, location.lon);
    }
  }, [location, fetchWeatherByCoords]);

  // Initialize weather data on component mount
  useEffect(() => {
    const initializeWeather = async () => {
      // Check if we have a saved location in localStorage
      const savedLocation = localStorage.getItem('weatherLocation');
      
      if (savedLocation) {
        try {
          const { lat, lon } = JSON.parse(savedLocation);
          await fetchWeatherByCoords(lat, lon);
          return;
        } catch (err) {
          console.error('Error loading saved location:', err);
        }
      }

      // Try to get user's current location
      try {
        const coords = await getUserLocation();
        await fetchWeatherByCoords(coords.lat, coords.lon);
        // Save location for future use
        localStorage.setItem('weatherLocation', JSON.stringify(coords));
      } catch (err) {
        // Fallback to a default location (you can change this)
        console.warn('Could not get user location, using default location');
        await fetchWeatherByCity('New York', 'US');
      }
    };

    initializeWeather();
  }, [fetchWeatherByCoords, fetchWeatherByCity, getUserLocation]);

  // Auto-refresh weather data every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (location && !isLoading) {
        refreshWeather();
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [location, isLoading, refreshWeather]);

  // Get formatted current weather
  const getCurrentWeather = useCallback(() => {
    if (!weatherData?.current) return null;
    return weatherService.formatWeatherData(weatherData.current);
  }, [weatherData]);

  // Get weather insights for agriculture
  const getAgriculturalInsights = useCallback(() => {
    return weatherData?.insights || [];
  }, [weatherData]);

  // Get forecast data
  const getForecast = useCallback((days = 5) => {
    if (!weatherData?.forecast?.forecast) return [];
    
    // Group forecast by day and return daily summaries
    const dailyForecast = [];
    const forecastData = weatherData.forecast.forecast;
    
    for (let i = 0; i < Math.min(days * 8, forecastData.length); i += 8) {
      const dayData = forecastData.slice(i, i + 8);
      if (dayData.length === 0) break;
      
      const temps = dayData.map(item => item.temperature);
      const maxTemp = Math.max(...temps);
      const minTemp = Math.min(...temps);
      const avgHumidity = dayData.reduce((sum, item) => sum + item.humidity, 0) / dayData.length;
      const totalPrecipitation = dayData.reduce((sum, item) => sum + item.precipitation, 0);
      
      // Get the most common weather condition for the day
      const conditions = dayData.map(item => item.main);
      const mostCommonCondition = conditions.sort((a, b) =>
        conditions.filter(v => v === a).length - conditions.filter(v => v === b).length
      ).pop();
      
      dailyForecast.push({
        date: dayData[0].datetime,
        maxTemp,
        minTemp,
        humidity: Math.round(avgHumidity),
        precipitation: totalPrecipitation,
        condition: mostCommonCondition,
        description: dayData[0].description,
        icon: dayData[0].icon
      });
    }
    
    return dailyForecast;
  }, [weatherData]);

  // Check if weather data is stale (older than 1 hour)
  const isDataStale = useCallback(() => {
    if (!lastUpdated) return true;
    return Date.now() - lastUpdated.getTime() > 60 * 60 * 1000; // 1 hour
  }, [lastUpdated]);

  // Get weather icon URL
  const getWeatherIcon = useCallback((iconCode, size = '2x') => {
    return weatherService.getWeatherIconUrl(iconCode, size);
  }, []);

  const value = {
    // State
    weatherData,
    location,
    isLoading,
    error,
    lastUpdated,
    
    // Actions
    fetchWeatherByCity,
    fetchWeatherByCoords,
    refreshWeather,
    forceRefreshWeather,
    getUserLocation,
    
    // Computed values
    getCurrentWeather,
    getAgriculturalInsights,
    getForecast,
    getWeatherIcon,
    isDataStale
  };

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
};