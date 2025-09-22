import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const EnhancedDashboard = () => {
  const { currentUser, getToken } = useAuth(); // <-- FIXED: get getToken here
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Add error state
  const [timeRange, setTimeRange] = useState('30'); // days
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      const token = getToken(); // <-- FIXED: just call it here

      if (!token) {
        console.error('No authentication token found');
        setError('Authentication error. Please try logging in again.');
        return;
      }      const response = await fetch(`/api/user/history/dashboard?days=${timeRange}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });      if (!response.ok) {
        const errorText = await response.text();
        console.error('Dashboard API error:', response.status, errorText);
        
        // Set a user-friendly error message based on status code
        if (response.status === 404) {
          setError('Dashboard data is not available. The service might be under maintenance.');
        } else if (response.status === 401 || response.status === 403) {
          setError('You are not authorized to view this dashboard. Please log in again.');
        } else {
          setError(`Error loading dashboard: ${response.status}. Please try again later.`);
        }
        
        throw new Error(`Failed to fetch dashboard data: ${errorText}`);
      }

      const data = await response.json();
      
      // Validate required data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid dashboard data received');
      }

      // Initialize missing fields with defaults
      const dashboardData = {
        total_scans: data.total_scans || 0,
        total_crop_plans: data.total_crop_plans || 0,
        total_chat_sessions: data.total_chat_sessions || 0,
        accuracy_rate: data.accuracy_rate || 0,
        implementation_success_rate: data.implementation_success_rate || 0,
        most_common_diseases: data.most_common_diseases || [],
        most_recommended_crops: data.most_recommended_crops || [],
        recent_achievements: data.recent_achievements || [],
        monthly_activity: data.monthly_activity || {
          scans: Array(12).fill(0),
          crop_plans: Array(12).fill(0),
          chat_sessions: Array(12).fill(0)
        }
      };

      console.log('Processed dashboard data:', dashboardData);
      setDashboardData(dashboardData);    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color = 'emerald' }) => (
    <Card>
      <Card.Content className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`text-${color}-600 text-3xl`}>
            {icon}
          </div>
        </div>
      </Card.Content>
    </Card>
  );

  const DiseaseChart = ({ diseases }) => (
    <div className="space-y-3">
      {diseases.map((disease, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full bg-emerald-${(index + 1) * 100}`}></div>
            <span className="text-sm font-medium">{disease.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{disease.count}</span>
            <Badge variant="secondary" size="sm">{disease.percentage}%</Badge>
          </div>
        </div>
      ))}
    </div>
  );

  const CropChart = ({ crops }) => (
    <div className="space-y-3">
      {crops.map((crop, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full bg-blue-${(index + 1) * 100}`}></div>
            <span className="text-sm font-medium">{crop.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{crop.count}</span>
            <Badge variant="success" size="sm">{crop.success_rate}%</Badge>
          </div>
        </div>
      ))}
    </div>
  );

  const AchievementCard = ({ achievement }) => (
    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center space-x-3">
        <div className="text-2xl">🏆</div>
        <div>
          <h4 className="font-medium text-yellow-800">{achievement.name}</h4>
          <p className="text-sm text-yellow-600">
            +{achievement.points} points • {achievement.unlocked_at ? new Date(achievement.unlocked_at).toLocaleDateString() : 'Recently unlocked'}
          </p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add error state display
  if (error) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
            <h2 className="text-2xl font-bold mb-2">Dashboard Error</h2>
            <p className="mb-4">{error}</p>
            <div className="flex space-x-4">
              <button
                onClick={() => fetchDashboardData()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition"
              >
                Retry
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {currentUser?.fullName || 'User'}!</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Disease Scans"
            value={dashboardData?.total_scans || 0}
            subtitle="Total scans performed"
            icon="🔍"
            color="emerald"
          />
          <StatCard
            title="Crop Plans"
            value={dashboardData?.total_crop_plans || 0}
            subtitle="Recommendations received"
            icon="🌱"
            color="blue"
          />
          <StatCard
            title="Chat Sessions"
            value={dashboardData?.total_chat_sessions || 0}
            subtitle="AI conversations"
            icon="💬"
            color="purple"
          />
          <StatCard
            title="Success Rate"
            value={`${dashboardData?.implementation_success_rate || 0}%`}
            subtitle="Plan implementation"
            icon="📈"
            color="green"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Most Common Diseases */}
            <Card>
              <Card.Header>
                <Card.Title>Most Common Diseases</Card.Title>
                <Card.Description>
                  Diseases detected in your scans over the selected period
                </Card.Description>
              </Card.Header>
              <Card.Content>
                {dashboardData?.most_common_diseases?.length > 0 ? (
                  <DiseaseChart diseases={dashboardData.most_common_diseases} />
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">🔍</div>
                    <p>No disease scans yet</p>
                    <p className="text-sm">Start scanning your plants to see insights here</p>
                  </div>
                )}
              </Card.Content>
            </Card>

            {/* Recommended Crops */}
            <Card>
              <Card.Header>
                <Card.Title>Most Recommended Crops</Card.Title>
                <Card.Description>
                  Crops suggested by our AI based on your conditions
                </Card.Description>
              </Card.Header>
              <Card.Content>
                {dashboardData?.most_recommended_crops?.length > 0 ? (
                  <CropChart crops={dashboardData.most_recommended_crops} />
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">🌾</div>
                    <p>No crop recommendations yet</p>
                    <p className="text-sm">Get crop suggestions to see insights here</p>
                  </div>
                )}
              </Card.Content>
            </Card>

            {/* Quick Actions */}
            <Card>
              <Card.Header>
                <Card.Title>Quick Actions</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => window.location.href = '/disease'}
                  >
                    <span className="text-2xl mb-1">📱</span>
                    <span className="text-sm">Scan Disease</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => window.location.href = '/crop'}
                  >
                    <span className="text-2xl mb-1">🌱</span>
                    <span className="text-sm">Get Crop Advice</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => window.location.href = '/chat'}
                  >
                    <span className="text-2xl mb-1">💬</span>
                    <span className="text-sm">Ask AI</span>
                  </Button>
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Achievements */}
            <Card>
              <Card.Header>
                <Card.Title>Recent Achievements</Card.Title>
                <Card.Description>
                  Your latest farming milestones
                </Card.Description>
              </Card.Header>
              <Card.Content>
                {dashboardData?.recent_achievements?.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.recent_achievements.map((achievement, index) => (
                      <AchievementCard key={index} achievement={achievement} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">🏆</div>
                    <p>No achievements yet</p>
                    <p className="text-sm">Start using AgriAI to unlock achievements</p>
                  </div>
                )}
              </Card.Content>
            </Card>

            {/* Accuracy Rate */}
            <Card>
              <Card.Header>
                <Card.Title>AI Accuracy</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600 mb-2">
                    {dashboardData?.accuracy_rate || 0}%
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Average confidence in AI predictions
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${dashboardData?.accuracy_rate || 0}%` }}
                    ></div>
                  </div>
                </div>
              </Card.Content>
            </Card>

            {/* Export Data */}
            <Card>
              <Card.Header>
                <Card.Title>Export Data</Card.Title>
                <Card.Description>
                  Download your farming data
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        const response = await fetch('http://127.0.0.1:8000/api/user/history/export/all', {
                          headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const data = await response.json();
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'agriai-data.json';
                        a.click();
                      } catch (error) {
                        console.error('Export failed:', error);
                      }
                    }}
                  >
                    📄 Export All Data
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        const response = await fetch('http://127.0.0.1:8000/api/user/history/export/scans', {
                          headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const data = await response.json();
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'scan-history.json';
                        a.click();
                      } catch (error) {
                        console.error('Export failed:', error);
                      }
                    }}
                  >
                    🔍 Export Scans
                  </Button>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
