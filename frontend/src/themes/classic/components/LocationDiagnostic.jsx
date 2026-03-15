import React, { useState, useEffect } from 'react';
import { useWeather } from '../../../context/WeatherContext';

const LocationDiagnostic = () => {
  const { location, error, isLoading, getUserLocation, fetchWeatherByCoords } = useWeather();
  const [diagnosticInfo, setDiagnosticInfo] = useState({
    geolocationSupported: false,
    permissionStatus: 'unknown',
    currentPosition: null,
    browserInfo: '',
    lastError: null
  });

  useEffect(() => {
    const checkGeolocation = async () => {
      const isSupported = 'geolocation' in navigator;
      const browserInfo = navigator.userAgent;
      
      setDiagnosticInfo(prev => ({
        ...prev,
        geolocationSupported: isSupported,
        browserInfo
      }));

      if (isSupported) {
        try {
          // Check permission status
          if ('permissions' in navigator) {
            const permission = await navigator.permissions.query({ name: 'geolocation' });
            setDiagnosticInfo(prev => ({
              ...prev,
              permissionStatus: permission.state
            }));
          }
        } catch (err) {
          console.log('Permission API not supported');
        }
      }
    };

    checkGeolocation();
  }, []);

  const testGeolocation = async () => {
    setDiagnosticInfo(prev => ({ ...prev, lastError: null }));
    
    try {
      const coords = await getUserLocation();
      setDiagnosticInfo(prev => ({
        ...prev,
        currentPosition: coords
      }));
      
      // Try to fetch weather with these coordinates
      await fetchWeatherByCoords(coords.lat, coords.lon);
    } catch (err) {
      setDiagnosticInfo(prev => ({
        ...prev,
        lastError: err.message
      }));
    }
  };

  const requestLocationPermission = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDiagnosticInfo(prev => ({
            ...prev,
            currentPosition: {
              lat: position.coords.latitude,
              lon: position.coords.longitude
            },
            permissionStatus: 'granted'
          }));
        },
        (error) => {
          let errorMessage = 'Unknown error';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          setDiagnosticInfo(prev => ({
            ...prev,
            lastError: errorMessage,
            permissionStatus: 'denied'
          }));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Location Diagnostic Tool</h2>
      
      {/* Current Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Current Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-3 rounded ${location ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className="font-medium">Location Status: {location ? 'Available' : 'Not Available'}</p>
            {location && (
              <div className="text-sm mt-1">
                <p>Name: {location.name || 'Unknown'}</p>
                <p>Coordinates: {location.lat?.toFixed(4)}, {location.lon?.toFixed(4)}</p>
              </div>
            )}
          </div>
          <div className={`p-3 rounded ${isLoading ? 'bg-yellow-100' : 'bg-gray-100'}`}>
            <p className="font-medium">Loading: {isLoading ? 'Yes' : 'No'}</p>
          </div>
          <div className={`p-3 rounded ${error ? 'bg-red-100' : 'bg-green-100'}`}>
            <p className="font-medium">Error: {error ? 'Yes' : 'No'}</p>
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>
        </div>
      </div>

      {/* Diagnostic Information */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Diagnostic Information</h3>
        <div className="bg-gray-50 p-4 rounded">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Geolocation Supported:</strong> {diagnosticInfo.geolocationSupported ? 'Yes' : 'No'}</p>
              <p><strong>Permission Status:</strong> {diagnosticInfo.permissionStatus}</p>
              {diagnosticInfo.currentPosition && (
                <p><strong>Current Position:</strong> {diagnosticInfo.currentPosition.lat.toFixed(4)}, {diagnosticInfo.currentPosition.lon.toFixed(4)}</p>
              )}
              {diagnosticInfo.lastError && (
                <p className="text-red-600"><strong>Last Error:</strong> {diagnosticInfo.lastError}</p>
              )}
            </div>
            <div>
              <p><strong>HTTPS:</strong> {window.location.protocol === 'https:' ? 'Yes' : 'No'}</p>
              <p><strong>Localhost:</strong> {window.location.hostname === 'localhost' ? 'Yes' : 'No'}</p>
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">Browser Info</summary>
                <p className="text-xs mt-1 break-all">{diagnosticInfo.browserInfo}</p>
              </details>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={testGeolocation}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Geolocation
          </button>
          <button
            onClick={requestLocationPermission}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Request Location Permission
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Reload Page
          </button>
        </div>

        {/* Manual Location Input */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2">Manual Location Override</h4>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="City name (e.g., Mumbai)"
              className="flex-1 px-3 py-2 border rounded"
              id="manual-city"
            />
            <button
              onClick={() => {
                const city = document.getElementById('manual-city').value;
                if (city.trim()) {
                  // You would call fetchWeatherByCity here
                  console.log('Fetching weather for:', city);
                }
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Use This Location
            </button>
          </div>
        </div>
      </div>

      {/* Troubleshooting Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h4 className="font-semibold mb-2">Troubleshooting Tips:</h4>
        <ul className="text-sm space-y-1">
          <li>• Make sure you're using HTTPS or localhost</li>
          <li>• Check if location permissions are blocked in browser settings</li>
          <li>• Try refreshing the page and clicking "Allow" when prompted</li>
          <li>• On mobile, ensure location services are enabled</li>
          <li>• Some browsers require user interaction before requesting location</li>
          <li>• Clear browser cache and cookies if issues persist</li>
        </ul>
      </div>
    </div>
  );
};

export default LocationDiagnostic;