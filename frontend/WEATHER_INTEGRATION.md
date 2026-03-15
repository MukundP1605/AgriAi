# Weather API Integration Documentation

## Overview
The AgriAI application now includes comprehensive weather API integration using OpenWeatherMap. This integration provides real-time weather data, forecasts, and agricultural insights to enhance crop management decisions.

## Features

### 1. Weather Service (`weatherService.js`)
- **Current Weather Data**: Temperature, humidity, wind, pressure, UV index
- **5-Day Forecast**: Detailed weather predictions for planning
- **Agricultural Insights**: Weather-specific farming recommendations
- **Data Caching**: Optimized API calls with 10-minute cache
- **Geolocation Support**: Automatic location detection

### 2. Weather Context (`WeatherContext.jsx`)
- **Global State Management**: Weather data available across components
- **Auto-refresh**: Updates every 30 minutes
- **Error Handling**: Graceful fallbacks and user feedback
- **Location Management**: Save and restore user locations

### 3. Weather Components

#### WeatherWidget
- Current weather display
- Temperature, humidity, wind speed
- Weather icons and descriptions
- Last updated timestamp

#### WeatherForecast
- 5-day weather forecast
- Agricultural tips based on forecast
- Precipitation and temperature trends
- Quick recommendations

#### WeatherInsights
- AI-generated agricultural insights
- Priority-based recommendations
- Weather-specific farming advice
- Actionable suggestions

### 4. Enhanced PersonalizedInsights
- Integrates weather data with crop management
- Dynamic irrigation recommendations
- Pest/disease risk assessments
- Optimal timing for field operations

## Setup Instructions

### 1. Get OpenWeatherMap API Key
1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Get your API key from the dashboard

### 2. Configure Environment Variables
Create a `.env` file in the frontend directory:
```bash
VITE_OPENWEATHER_API_KEY=your_api_key_here
VITE_DEFAULT_CITY=New York
VITE_DEFAULT_COUNTRY=US
```

### 3. Verify Integration
1. Start the frontend application
2. Navigate to Enhanced Dashboard
3. Click on "🌤️ Weather & Insights" tab
4. Check that weather data loads properly

## API Usage

### Current Weather
```javascript
import { useWeather } from '../context/WeatherContext';

const { getCurrentWeather, weatherData } = useWeather();
const current = getCurrentWeather();
// Returns: { temperature: "25°C", humidity: "65%", ... }
```

### Weather Forecast
```javascript
const { getForecast } = useWeather();
const forecast = getForecast(5); // 5-day forecast
// Returns array of daily weather data
```

### Agricultural Insights
```javascript
const { getAgriculturalInsights } = useWeather();
const insights = getAgriculturalInsights();
// Returns array of weather-based farming recommendations
```

## Data Structure

### Weather Data Object
```javascript
{
  current: {
    temperature: 25,
    humidity: 65,
    windSpeed: 3.2,
    description: "partly cloudy",
    // ... more fields
  },
  forecast: {
    city: "New York",
    forecast: [
      {
        datetime: Date,
        temperature: 24,
        precipitation: 0.5,
        // ... more fields
      }
    ]
  },
  insights: [
    {
      type: "warning",
      category: "irrigation",
      title: "Increase Irrigation",
      message: "Hot weather expected...",
      priority: "high"
    }
  ]
}
```

### Agricultural Insights
The system generates insights in the following categories:
- **Temperature**: Heat stress, frost warnings
- **Humidity**: Disease risk, moisture management
- **Precipitation**: Irrigation adjustments, waterlogging prevention
- **Wind**: Crop protection, spray timing
- **UV Index**: Plant growth conditions
- **Growth**: Growing degree days calculations

## Customization

### Adding Custom Insights
Extend the `generateAgriculturalInsights` function in `weatherService.js`:

```javascript
// Add crop-specific recommendations
if (currentWeather.temperature > 35 && cropType === 'tomatoes') {
  insights.push({
    type: 'warning',
    category: 'temperature',
    title: 'Tomato Heat Stress Alert',
    message: 'Provide shade for tomato plants...',
    priority: 'high'
  });
}
```

### Custom Weather Components
Create new components using the weather hooks:

```javascript
import { useWeather } from '../context/WeatherContext';

const CustomWeatherComponent = () => {
  const { weatherData, isLoading, error } = useWeather();
  
  // Your custom component logic
  return (
    <div>
      {/* Custom weather display */}
    </div>
  );
};
```

## Performance Considerations

### Caching Strategy
- **Client-side caching**: 10-minute cache for API responses
- **Local storage**: User location preferences
- **Automatic refresh**: 30-minute intervals

### API Rate Limits
- Free tier: 1,000 calls/day, 60 calls/minute
- Caching reduces actual API calls significantly
- Consider upgrading for production use

### Error Handling
- Network connectivity issues
- API rate limit exceeded
- Invalid API key
- Geolocation denied

## Troubleshooting

### Common Issues

1. **"Weather data not loading"**
   - Check API key configuration
   - Verify internet connection
   - Check browser console for errors

2. **"Location not found"**
   - Enable browser geolocation
   - Check default location settings
   - Verify location name spelling

3. **"API rate limit exceeded"**
   - Wait for rate limit reset
   - Consider API key upgrade
   - Check for excessive API calls

### Debug Mode
Enable detailed logging by setting:
```javascript
console.log('Weather debug mode enabled');
localStorage.setItem('weather_debug', 'true');
```

## Future Enhancements

### Planned Features
- Historical weather data analysis
- Weather alerts and notifications
- Crop-specific weather thresholds
- Integration with IoT sensors
- Satellite imagery overlay
- Climate change impact analysis

### API Upgrades
Consider upgrading to OpenWeatherMap's paid plans for:
- Weather alerts and warnings
- Historical data access (up to 45 years)
- Higher API call limits
- Faster data updates
- Additional parameters

## Support

For weather integration support:
1. Check the browser console for errors
2. Verify API key configuration
3. Test with different locations
4. Review network connectivity
5. Contact OpenWeatherMap support for API issues

## Version History

- **v1.0**: Initial weather integration
  - Basic current weather and forecast
  - Agricultural insights generation
  - Weather context and components
  - Dashboard integration