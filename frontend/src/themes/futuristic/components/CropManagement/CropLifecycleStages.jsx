import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';

const CropLifecycleStages = ({ sessionId }) => {
  const { getToken } = useAuth();
  const [stages, setStages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStage, setCurrentStage] = useState(null);
  const [generatingStages, setGeneratingStages] = useState(false);
  
  // Function to fetch lifecycle stages
  const fetchLifecycleStages = async () => {
    try {
      const token = getToken();
      
      // Attempt to fetch existing stages
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
        return { success: true, data: response.data };
      } else {
        return { success: false, error: 'No stages found' };
      }
    } catch (err) {
      console.error('Error fetching crop stages:', err);
      return {
        success: false,
        error: err.response?.data?.detail || 'Failed to fetch crop lifecycle stages'
      };
    }
  };
  
  // Function to generate lifecycle stages
  const generateLifecycleStages = async () => {
    try {
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
        return { success: true, data: response.data };
      } else {
        return { success: false, error: 'Failed to generate stages' };
      }
    } catch (err) {
      console.error('Error generating crop stages:', err);
      return {
        success: false,
        error: err.response?.data?.detail || 'Failed to generate crop lifecycle stages'
      };
    }
  };
  
  // Fetch stages on component mount
  useEffect(() => {
    const loadStages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await fetchLifecycleStages();
        
        if (result.success) {
          setStages(result.data);
          
          // Determine current stage
          const now = new Date();
          const currentStage = result.data.find(stage => 
            new Date(stage.start_date) <= now && new Date(stage.end_date) >= now
          );
          
          if (currentStage) {
            setCurrentStage(currentStage);
          } else {
            // If no current stage, find the next upcoming stage
            const upcomingStages = result.data.filter(stage => new Date(stage.start_date) > now);
            if (upcomingStages.length > 0) {
              // Sort by start date and get the closest upcoming stage
              upcomingStages.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
              setCurrentStage({ ...upcomingStages[0], isUpcoming: true });
            }
          }
        } else {
          setStages([]);
        }
      } catch (err) {
        console.error('Error loading stages:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStages();
  }, [sessionId]);
  
  // Handler for generating stages
  const handleGenerateStages = async () => {
    try {
      setGeneratingStages(true);
      setError(null);
      
      const result = await generateLifecycleStages();
      
      if (result.success) {
        setStages(result.data);
        
        // Determine current stage
        const now = new Date();
        const currentStage = result.data.find(stage => 
          new Date(stage.start_date) <= now && new Date(stage.end_date) >= now
        );
        
        if (currentStage) {
          setCurrentStage(currentStage);
        } else {
          // If no current stage, find the next upcoming stage
          const upcomingStages = result.data.filter(stage => new Date(stage.start_date) > now);
          if (upcomingStages.length > 0) {
            // Sort by start date and get the closest upcoming stage
            upcomingStages.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
            setCurrentStage({ ...upcomingStages[0], isUpcoming: true });
          }
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error handling stage generation:', err);
      setError('An unexpected error occurred. Please try again.');
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center">
        <span className="text-lg mr-2">🌱</span>
        Growth Lifecycle Stages
      </h2>
      
      {error && (
        <div className="bg-red-900/30 text-red-400 border border-red-500/50 p-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {stages.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/50 rounded-lg border border-gray-800">
          <div className="text-4xl mb-4">🌱</div>
          <h3 className="text-lg font-medium text-cyan-400 mb-2">No Lifecycle Stages Found</h3>
          <p className="text-gray-300 mb-6">
            Generate lifecycle stages based on your crop type and sowing date.
          </p>
          <button
            onClick={handleGenerateStages}
            disabled={generatingStages}
            className={`px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg shadow-lg shadow-cyan-500/20 hover:from-cyan-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all ${
              generatingStages ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {generatingStages ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Stages...
              </span>
            ) : (
              'Generate Lifecycle Stages'
            )}
          </button>
        </div>
      ) : (
        <>
          {/* Current Stage Information */}
          {currentStage && (
            <div className="mb-8 p-6 bg-cyan-900/20 backdrop-blur-sm rounded-xl border border-cyan-500/30">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <div className="text-sm font-medium text-cyan-400 mb-1">
                    {currentStage.isUpcoming ? 'Upcoming Stage' : 'Current Stage'}
                  </div>
                  <h3 className="text-2xl font-bold text-cyan-300 mb-1">{currentStage.name}</h3>
                  <p className="text-cyan-400">
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
                  <div className="flex justify-between text-sm text-cyan-400 mb-1">
                    <span>Progress</span>
                    <span>{calculateStageProgress(currentStage)}%</span>
                  </div>
                  <div className="w-full bg-cyan-900/50 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full" 
                      style={{ width: `${calculateStageProgress(currentStage)}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {currentStage.description && (
                <div className="mt-4 pt-4 border-t border-cyan-800">
                  <p className="text-cyan-300">{currentStage.description}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Timeline View */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-cyan-300 mb-4">Growth Timeline</h3>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-cyan-900/50"></div>
              
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
                          isActive ? 'bg-cyan-400 ring-4 ring-cyan-900/50' : 
                          isPast ? 'bg-cyan-600' : 
                          'bg-gray-600'
                        }`}
                      ></div>
                      
                      {/* Timeline Content */}
                      <div 
                        className={`ml-10 p-4 rounded-lg backdrop-blur-sm border ${
                          isActive ? 'bg-cyan-900/20 border-cyan-500/30' : 
                          isPast ? 'bg-gray-900/30 border-cyan-800/20' : 
                          'bg-gray-900/20 border-gray-800'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                          <div>
                            <h4 className={`text-md font-medium ${
                              isActive ? 'text-cyan-300' : 
                              isPast ? 'text-cyan-400' : 
                              'text-gray-400'
                            }`}>{stage.name}</h4>
                            <p className={`text-sm ${
                              isActive ? 'text-cyan-400' : 
                              isPast ? 'text-cyan-500' : 
                              'text-gray-500'
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
                            isActive ? 'text-cyan-400' : 
                            isPast ? 'text-cyan-500' : 
                            'text-gray-500'
                          }`}>
                            {stage.description}
                          </p>
                        )}
                        
                        {isActive && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-cyan-400 mb-1">
                              <span>Progress</span>
                              <span>{calculateStageProgress(stage)}%</span>
                            </div>
                            <div className="w-full bg-cyan-900/50 rounded-full h-1.5">
                              <div 
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full" 
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
              onClick={handleGenerateStages}
              disabled={generatingStages}
              className={`px-4 py-2 bg-gray-800 text-gray-300 font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors ${
                generatingStages ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {generatingStages ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Regenerating...
                </span>
              ) : (
                'Regenerate Stages'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CropLifecycleStages;
