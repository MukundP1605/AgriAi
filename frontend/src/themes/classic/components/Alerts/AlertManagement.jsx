import React, { useState, useEffect } from 'react';
import PestAlertViewer from '../CropManagement/PestAlertViewer';

const AlertManagement = () => {
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch sessions on component mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        
        // Get the authentication token
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication required');
          setIsLoading(false);
          return;
        }
        
        const response = await fetch(
          'http://127.0.0.1:8000/api/crop-management/sessions',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }
        
        const data = await response.json();
        setSessions(data);
        
        // Set the first session as selected by default if available
        if (data.length > 0) {
          setSelectedSessionId(data[0].id);
        }
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError(err.message || 'An error occurred while fetching sessions');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSessions();
  }, []);

  const handleSessionChange = (e) => {
    setSelectedSessionId(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center">
        <p className="text-gray-600 mb-4">No crop sessions found. Start a crop session to view pest alerts.</p>
        <a href="/crop-management" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
          Create Crop Session
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <label htmlFor="session-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Crop Session
        </label>
        <select
          id="session-select"
          value={selectedSessionId || ''}
          onChange={handleSessionChange}
          className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="" disabled>
            Choose a crop session
          </option>
          {sessions.map(session => (
            <option key={session.id} value={session.id}>
              {session.crop_name.charAt(0).toUpperCase() + session.crop_name.slice(1)} (Sowed: {new Date(session.sowing_date).toLocaleDateString()})
            </option>
          ))}
        </select>
      </div>

      {selectedSessionId ? (
        <PestAlertViewer sessionId={selectedSessionId} />
      ) : (
        <p className="text-gray-600">Please select a crop session to view pest alerts.</p>
      )}
    </div>
  );
};

export default AlertManagement;
