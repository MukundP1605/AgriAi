import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const CropLifecycleStages = ({ sessionId }) => {
  const { getToken } = useAuth();
  const [stages, setStages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStage, setCurrentStage] = useState(null);
  const [generatingStages, setGeneratingStages] = useState(false);
  
  useEffect(() => {
    fetchStages();
  }, [sessionId]);
  
  const fetchStages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = getToken();
      
      // Attempt to fetch existing stages first
      const response = await axios.get(
        `http://127.0.0.1:8000/api/crop-management/stages/${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.length > 0) {
        setStages(response.data);
        
        // Determine current stage
        const now = new Date();
        const currentStage = response.data.find(stage => 
          new Date(stage.start_date) <= now && new Date(stage.end_date) >= now
        );
        
        if (currentStage) {
          setCurrentStage(currentStage);
        } else {
          // If no current stage, find the next upcoming stage
          const upcomingStages = response.data.filter(stage => new Date(stage.start_date) > now);
          if (upcomingStages.length > 0) {
            // Sort by start date and get the closest upcoming stage
            upcomingStages.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
            setCurrentStage({ ...upcomingStages[0], isUpcoming: true });
          }
        }
      }
    } catch (err) {
      // If error is 404, it likely means stages haven't been generated yet
      if (err.response?.status === 404) {
        setStages([]);
      } else {
        console.error('Error fetching crop stages:', err);
        setError(err.response?.data?.detail || 'Failed to fetch crop lifecycle stages. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateStages = async () => {
    try {
      setGeneratingStages(true);
      setError(null);
      
      const token = getToken();
      
      const response = await axios.post(
        `http://127.0.0.1:8000/api/crop-management/stages/${sessionId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.length > 0) {
        setStages(response.data);
        
        // Determine current stage
        const now = new Date();
        const currentStage = response.data.find(stage => 
          new Date(stage.start_date) <= now && new Date(stage.end_date) >= now
        );
        
        if (currentStage) {
          setCurrentStage(currentStage);
        } else {
          // If no current stage, find the next upcoming stage
          const upcomingStages = response.data.filter(stage => new Date(stage.start_date) > now);
          if (upcomingStages.length > 0) {
            // Sort by start date and get the closest upcoming stage
            upcomingStages.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
            setCurrentStage({ ...upcomingStages[0], isUpcoming: true });
          }
        }
      }
    } catch (err) {
      console.error('Error generating crop stages:', err);
      setError(err.response?.data?.detail || 'Failed to generate crop lifecycle stages. Please try again.');
    } finally {
      setGeneratingStages(false);
    }
  };
  
  // Calculate progress within the current stage
  const calculateStageProgress = (stage) => {
    if (!stage) return 0;
    
    const now = new Date();
    const startDate = new Date(stage.start_date);
    const endDate = new Date(stage.end_date);
    
    // If it's an upcoming stage, return 0
    if (stage.isUpcoming) return 0;
    
    // Calculate total stage duration in milliseconds
    const stageDuration = endDate - startDate;
    
    // Calculate elapsed time in milliseconds
    const elapsedTime = now - startDate;
    
    // Calculate progress percentage
    const progress = Math.min(100, Math.max(0, (elapsedTime / stageDuration) * 100));
    
    return Math.round(progress);
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Crop Lifecycle Stages</h2>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {stages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-4xl mb-4">🌱</div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Lifecycle Stages Found</h3>
          <p className="text-gray-600 mb-6">
            Generate lifecycle stages based on your crop type and sowing date.
          </p>
          <button
            onClick={generateStages}
            disabled={generatingStages}
            className={`px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors ${
              generatingStages ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {generatingStages ? 'Generating Stages...' : 'Generate Lifecycle Stages'}
          </button>
        </div>
      ) : (
        <>
          {/* Current Stage Information */}
          {currentStage && (
            <div className="mb-8 p-6 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <div className="text-sm font-medium text-emerald-800 mb-1">
                    {currentStage.isUpcoming ? 'Upcoming Stage' : 'Current Stage'}
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-700 mb-1">{currentStage.name}</h3>
                  <p className="text-emerald-600">
                    {new Date(currentStage.start_date).toLocaleDateString()} to {new Date(currentStage.end_date).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex-shrink-0">
                  <div className="text-4xl">
                    {currentStage.name === 'Sowing' ? '🌱' : 
                     currentStage.name === 'Vegetative' ? '🌿' : 
                     currentStage.name === 'Flowering' ? '🌸' : 
                     currentStage.name === 'Harvest' ? '🌾' : '🌱'}
                  </div>
                </div>
              </div>
              
              {!currentStage.isUpcoming && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-emerald-800 mb-1">
                    <span>Progress</span>
                    <span>{calculateStageProgress(currentStage)}%</span>
                  </div>
                  <div className="w-full bg-emerald-200 rounded-full h-2.5">
                    <div 
                      className="bg-emerald-600 h-2.5 rounded-full" 
                      style={{ width: `${calculateStageProgress(currentStage)}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {currentStage.description && (
                <div className="mt-4 pt-4 border-t border-emerald-200">
                  <p className="text-emerald-700">{currentStage.description}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Timeline View */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Growth Timeline</h3>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {/* Timeline Items */}
              <div className="space-y-6">
                {stages.map((stage, index) => {
                  const isActive = currentStage && stage.id === currentStage.id && !currentStage.isUpcoming;
                  const isPast = new Date(stage.end_date) < new Date();
                  const isFuture = new Date(stage.start_date) > new Date();
                  
                  return (
                    <div key={stage.id} className="relative flex items-start">
                      {/* Timeline Marker */}
                      <div 
                        className={`absolute left-5 w-2.5 h-2.5 rounded-full mt-1.5 -translate-x-1/2 ${
                          isActive ? 'bg-emerald-600 ring-4 ring-emerald-100' : 
                          isPast ? 'bg-emerald-500' : 
                          'bg-gray-300'
                        }`}
                      ></div>
                      
                      {/* Timeline Content */}
                      <div 
                        className={`ml-10 p-4 rounded-lg ${
                          isActive ? 'bg-emerald-50 border border-emerald-100' : 
                          isPast ? 'bg-gray-50 border border-gray-100' : 
                          'bg-white border border-gray-100'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                          <div>
                            <h4 className={`text-md font-medium ${
                              isActive ? 'text-emerald-700' : 
                              isPast ? 'text-gray-700' : 
                              'text-gray-500'
                            }`}>{stage.name}</h4>
                            <p className={`text-sm ${
                              isActive ? 'text-emerald-600' : 
                              isPast ? 'text-gray-600' : 
                              'text-gray-400'
                            }`}>
                              {new Date(stage.start_date).toLocaleDateString()} to {new Date(stage.end_date).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <div className="text-2xl">
                            {stage.name === 'Sowing' ? '🌱' : 
                             stage.name === 'Vegetative' ? '🌿' : 
                             stage.name === 'Flowering' ? '🌸' : 
                             stage.name === 'Harvest' ? '🌾' : '🌱'}
                          </div>
                        </div>
                        
                        {stage.description && (
                          <p className={`mt-2 text-sm ${
                            isActive ? 'text-emerald-600' : 
                            isPast ? 'text-gray-600' : 
                            'text-gray-400'
                          }`}>
                            {stage.description}
                          </p>
                        )}
                        
                        {isActive && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-emerald-700 mb-1">
                              <span>Progress</span>
                              <span>{calculateStageProgress(stage)}%</span>
                            </div>
                            <div className="w-full bg-emerald-200 rounded-full h-1.5">
                              <div 
                                className="bg-emerald-600 h-1.5 rounded-full" 
                                style={{ width: `${calculateStageProgress(stage)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end mt-6">
            <button
              onClick={generateStages}
              disabled={generatingStages}
              className={`px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors ${
                generatingStages ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {generatingStages ? 'Regenerating...' : 'Regenerate Stages'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CropLifecycleStages;
