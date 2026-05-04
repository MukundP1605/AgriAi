/**
 * Weather Service for AgriAI
 * Integrates with OpenWeatherMap API to provide weather data for agricultural insights
 */

import axios from 'axios';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'e3890ad64435f352fde64ad9c5877e81';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'http://api.openweathermap.org/geo/1.0';
const UV_URL = 'https://api.openweathermap.org/data/2.5/uvi';

class WeatherService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes - reduced for more frequent updates
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cached data if available and not expired
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Cache data with timestamp
   */
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Get coordinates for a city name
   */
  async getCoordinates(cityName, countryCode = '') {
    try {
      const cacheKey = `coords_${cityName}_${countryCode}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const query = countryCode ? `${cityName},${countryCode}` : cityName;
      const response = await axios.get(`${GEO_URL}/direct`, {
        params: {
          q: query,
          limit: 1,
          appid: API_KEY
        }
      });

      if (response.data && response.data.length > 0) {
        const coords = {
          lat: response.data[0].lat,
          lon: response.data[0].lon,
          name: response.data[0].name,
          country: response.data[0].country
        };
        this.setCachedData(cacheKey, coords);
        return coords;
      }
      throw new Error('Location not found');
    } catch (error) {
      console.error('Error getting coordinates:', error);
      throw new Error(`Failed to get coordinates for ${cityName}`);
    }
  }

  /**
   * Get current weather data
   */
  async getCurrentWeather(lat, lon) {
    try {
      const cacheKey = `current_${lat}_${lon}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric'
        }
      });

      const weatherData = {
        temperature: Math.round(response.data.main.temp),
        feelsLike: Math.round(response.data.main.feels_like),
        humidity: response.data.main.humidity,
        pressure: response.data.main.pressure,
        description: response.data.weather[0].description,
        main: response.data.weather[0].main,
        icon: response.data.weather[0].icon,
        windSpeed: response.data.wind.speed,
        windDirection: response.data.wind.deg,
        visibility: response.data.visibility,
        cloudCover: response.data.clouds.all,
        sunrise: new Date(response.data.sys.sunrise * 1000),
        sunset: new Date(response.data.sys.sunset * 1000),
        location: response.data.name,
        country: response.data.sys.country,
        timestamp: new Date()
      };

      this.setCachedData(cacheKey, weatherData);
      return weatherData;
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw new Error('Failed to fetch current weather data');
    }
  }

  /**
   * Get weather forecast (5 day / 3 hour)
   */
  async getForecast(lat, lon) {
    try {
      const cacheKey = `forecast_${lat}_${lon}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${BASE_URL}/forecast`, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric'
        }
      });

      const forecastData = {
        city: response.data.city.name,
        country: response.data.city.country,
        forecast: response.data.list.map(item => ({
          datetime: new Date(item.dt * 1000),
          temperature: Math.round(item.main.temp),
          feelsLike: Math.round(item.main.feels_like),
          tempMin: Math.round(item.main.temp_min),
          tempMax: Math.round(item.main.temp_max),
          humidity: item.main.humidity,
          pressure: item.main.pressure,
          description: item.weather[0].description,
          main: item.weather[0].main,
          icon: item.weather[0].icon,
          windSpeed: item.wind.speed,
          windDirection: item.wind.deg,
          cloudCover: item.clouds.all,
          precipitation: item.rain ? item.rain['3h'] || 0 : 0,
          snowfall: item.snow ? item.snow['3h'] || 0 : 0
        }))
      };

      this.setCachedData(cacheKey, forecastData);
      return forecastData;
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw new Error('Failed to fetch weather forecast');
    }
  }

  /**
   * Get UV Index data
   */
  async getUVIndex(lat, lon) {
    try {
      const cacheKey = `uv_${lat}_${lon}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${UV_URL}`, {
        params: {
          lat,
          lon,
          appid: API_KEY
        }
      });

      const uvData = {
        value: response.data.value,
        timestamp: new Date(response.data.date * 1000)
      };

      this.setCachedData(cacheKey, uvData);
      return uvData;
    } catch (error) {
      console.error('Error fetching UV index:', error);
      return { value: 0, timestamp: new Date() };
    }
  }

  /**
   * Get comprehensive weather data for agriculture
   */
  async getAgriculturalWeather(lat, lon) {
    try {
      const [current, forecast, uv] = await Promise.all([
        this.getCurrentWeather(lat, lon),
        this.getForecast(lat, lon),
        this.getUVIndex(lat, lon)
      ]);

      return {
        current: {
          ...current,
          uvIndex: uv.value
        },
        forecast,
        insights: this.generateAgriculturalInsights(current, forecast, uv)
      };
    } catch (error) {
      console.error('Error fetching agricultural weather:', error);
      throw error;
    }
  }

  /**
   * Generate agricultural insights based on weather data
   */
  generateAgriculturalInsights(current, forecast, uv) {
    const insights = [];

    // Temperature insights
    if (current.temperature > 35) {
      insights.push({
        type: 'warning',
        category: 'temperature',
        title: 'High Temperature Alert',
        message: 'Extreme heat may stress crops. Consider increased irrigation and shade protection.',
        priority: 'high'
      });
    } else if (current.temperature < 5) {
      insights.push({
        type: 'warning',
        category: 'temperature',
        title: 'Frost Risk',
        message: 'Low temperatures may damage sensitive crops. Consider frost protection measures.',
        priority: 'high'
      });
    }

    // Humidity insights
    if (current.humidity > 80) {
      insights.push({
        type: 'info',
        category: 'humidity',
        title: 'High Humidity',
        message: 'High humidity may increase disease risk. Monitor for fungal infections.',
        priority: 'medium'
      });
    } else if (current.humidity < 30) {
      insights.push({
        type: 'info',
        category: 'humidity',
        title: 'Low Humidity',
        message: 'Low humidity may stress plants. Consider increasing irrigation frequency.',
        priority: 'medium'
      });
    }

    // Wind insights
    if (current.windSpeed > 10) {
      insights.push({
        type: 'warning',
        category: 'wind',
        title: 'Strong Winds',
        message: 'Strong winds may damage crops. Secure equipment and check for plant damage.',
        priority: 'medium'
      });
    }

    // UV insights
    if (uv.value > 8) {
      insights.push({
        type: 'info',
        category: 'uv',
        title: 'High UV Index',
        message: 'High UV levels. Good for plant growth but ensure adequate protection for workers.',
        priority: 'low'
      });
    }

    // Rainfall predictions from forecast
    const next24Hours = forecast.forecast.slice(0, 8); // Next 24 hours (3-hour intervals)
    const totalRainfall = next24Hours.reduce((sum, item) => sum + item.precipitation, 0);
    
    if (totalRainfall > 25) {
      insights.push({
        type: 'info',
        category: 'precipitation',
        title: 'Heavy Rain Expected',
        message: `${totalRainfall.toFixed(1)}mm of rain expected in next 24 hours. Adjust irrigation plans.`,
        priority: 'medium'
      });
    } else if (totalRainfall === 0) {
      insights.push({
        type: 'info',
        category: 'precipitation',
        title: 'No Rain Expected',
        message: 'No rainfall expected in next 24 hours. Ensure adequate irrigation.',
        priority: 'low'
      });
    }

    // Growing degree days calculation (simplified)
    const baseTemp = 10; // Base temperature for most crops
    const avgTemp = (current.temperature + forecast.forecast[0]?.temperature || current.temperature) / 2;
    const gdd = Math.max(0, avgTemp - baseTemp);
    
    insights.push({
      type: 'info',
      category: 'growth',
      title: 'Growing Degree Days',
      message: `Current GDD: ${gdd.toFixed(1)}. ${gdd > 15 ? 'Excellent' : gdd > 10 ? 'Good' : 'Moderate'} growing conditions.`,
      priority: 'low'
    });

    return insights;
  }

  /**
   * Get weather by city name
   */
  async getWeatherByCity(cityName, countryCode = '') {
    try {
      const coords = await this.getCoordinates(cityName, countryCode);
      return await this.getAgriculturalWeather(coords.lat, coords.lon);
    } catch (error) {
      console.error('Error fetching weather by city:', error);
      throw error;
    }
  }

  /**
   * Get weather alerts (if available in the region)
   */
  async getWeatherAlerts(lat, lon) {
    try {
      // Note: Weather alerts require a paid subscription to OpenWeatherMap
      // This is a placeholder for when you upgrade to a paid plan
      const response = await axios.get(`${BASE_URL}/onecall`, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          exclude: 'minutely,hourly'
        }
      });

      return response.data.alerts || [];
    } catch (error) {
      // Return empty alerts for free tier
      return [];
    }
  }

  /**
   * Format weather data for display
   */
  formatWeatherData(weatherData) {
    return {
      temperature: `${weatherData.temperature}°C`,
      feelsLike: `${weatherData.feelsLike}°C`,
      humidity: `${weatherData.humidity}%`,
      windSpeed: `${weatherData.windSpeed} m/s`,
      pressure: `${weatherData.pressure} hPa`,
      description: weatherData.description.charAt(0).toUpperCase() + weatherData.description.slice(1)
    };
  }

  /**
   * Get weather icon URL
   */
  getWeatherIconUrl(iconCode, size = '2x') {
    return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
  }
}

export default new WeatherService();# Updated 2026-07-13 19:39:24
# Updated 2026-07-13 19:39:29
# Updated 2026-07-13 19:39:30
# Updated 2026-07-13 19:39:45
# Updated 2026-07-13 19:39:48
# Updated 2026-07-13 19:40:25
# Updated 2026-07-13 21:53:26
# Updated 2026-07-13 21:54:15
# Updated 2026-07-13 21:54:22
# Updated 2026-07-13 21:54:49
# Updated 2026-07-13 21:55:22
# Updated 2026-07-13 22:03:34
