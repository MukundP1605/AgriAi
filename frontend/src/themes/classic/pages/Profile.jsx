import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const Profile = () => {
  const { currentUser, updateProfile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    location: currentUser?.location || '',
    farmType: currentUser?.farmType || 'small',
    phone: '',
    farmSize: '',
    primaryCrops: '',
    farmingExperience: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchUserProfile();
      fetchUserStats();
    }
  }, [isAuthenticated, navigate]);
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const profile = await response.json();
        setFormData({
          fullName: profile.full_name || '',
          email: profile.email || '',
          location: profile.location || '',
          farmType: profile.farm_type || 'small',
          phone: profile.phone || '',
          farmSize: profile.farm_size || '',
          primaryCrops: profile.primary_crops || '',
          farmingExperience: profile.farming_experience || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserStats = async () => {
    try {      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/user/profile/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const stats = await response.json();
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };
    const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: formData.fullName,
          location: formData.location,
          farm_type: formData.farmType,
          phone: formData.phone,
          farm_size: formData.farmSize,
          primary_crops: formData.primaryCrops,
          farming_experience: formData.farmingExperience
        })
      });
      
      if (response.ok) {
        await fetchUserProfile();
        setEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
      try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/user/profile/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword
        })
      });
      
      if (response.ok) {
        setChangingPassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        alert('Password changed successfully!');
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password');
    }
  };
    // If no user is logged in or loading, show placeholder
  if (!currentUser || loading) {    return (
      <>
        <div className="max-w-4xl mx-auto mt-12 p-8 min-h-[calc(100vh-4rem)]">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-700">Loading profile...</h2>
          </div>
        </div>
      </>
    );
  }

  const farmTypeOptions = [
    { value: 'small', label: 'Small Farm (< 10 acres)' },
    { value: 'medium', label: 'Medium Farm (10-100 acres)' },
    { value: 'large', label: 'Large Farm (> 100 acres)' },
    { value: 'garden', label: 'Home Garden' },
    { value: 'other', label: 'Other' }
  ];

  const farmSizeOptions = [
    { value: '< 1 acre', label: '< 1 acre' },
    { value: '1-5 acres', label: '1-5 acres' },
    { value: '5-10 acres', label: '5-10 acres' },
    { value: '10-50 acres', label: '10-50 acres' },
    { value: '50-100 acres', label: '50-100 acres' },
    { value: '> 100 acres', label: '> 100 acres' }
  ];

  const experienceOptions = [
    { value: 'beginner', label: 'Beginner (< 1 year)' },
    { value: 'intermediate', label: 'Intermediate (1-5 years)' },
    { value: 'experienced', label: 'Experienced (5-15 years)' },
    { value: 'expert', label: 'Expert (> 15 years)' }
  ];    return (    <div className="flex-grow bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      <div className="max-w-6xl mx-auto mt-12 p-8 mb-12">
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-emerald-700">Your Profile</h2>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/history')}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-300"
              >
                View History
              </button>
              {!editing && !changingPassword && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition duration-300"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
          
          {!editing && !changingPassword ? (
            <>
              <div className="mb-8 flex items-center justify-center">
                <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-5xl font-bold">
                  {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : formData.email.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-lg font-medium">{formData.fullName || 'Not provided'}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-lg">{formData.email}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-lg">{formData.phone || 'Not provided'}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-lg">{formData.location || 'Not provided'}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Farm Type</p>
                  <p className="text-lg">
                    {farmTypeOptions.find(option => option.value === formData.farmType)?.label || 'Not provided'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Farm Size</p>
                  <p className="text-lg">{formData.farmSize || 'Not provided'}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Primary Crops</p>
                  <p className="text-lg">{formData.primaryCrops || 'Not provided'}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Farming Experience</p>
                  <p className="text-lg">
                    {experienceOptions.find(option => option.value === formData.farmingExperience)?.label || 'Not provided'}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4 mb-8">
                <button
                  onClick={() => setChangingPassword(true)}
                  className="px-6 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition duration-300"
                >
                  Change Password
                </button>
              </div>
            </>
          ) : changingPassword ? (
            <form onSubmit={handlePasswordSubmit} className="max-w-md mx-auto space-y-6">
              <h3 className="text-xl font-bold text-center text-gray-700 mb-6">Change Password</h3>
              
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="currentPassword">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="newPassword">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="confirmPassword">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => setChangingPassword(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition duration-300"
                >
                  Change Password
                </button>
              </div>
            </form>        ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-xl font-bold text-center text-gray-700 mb-6">Edit Profile</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-1" htmlFor="fullName">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1" htmlFor="email">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-100"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1" htmlFor="phone">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1" htmlFor="location">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="City, State, Country"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1" htmlFor="farmType">
                    Farm Type
                  </label>
                  <select
                    id="farmType"
                    name="farmType"
                    value={formData.farmType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {farmTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1" htmlFor="farmSize">
                    Farm Size
                  </label>
                  <select
                    id="farmSize"
                    name="farmSize"
                    value={formData.farmSize}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select farm size</option>
                    {farmSizeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1" htmlFor="primaryCrops">
                    Primary Crops
                  </label>
                  <input
                    type="text"
                    id="primaryCrops"
                    name="primaryCrops"
                    value={formData.primaryCrops}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g., Rice, Wheat, Corn"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1" htmlFor="farmingExperience">
                    Farming Experience
                  </label>
                  <select
                    id="farmingExperience"
                    name="farmingExperience"
                    value={formData.farmingExperience}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select experience level</option>
                    {experienceOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition duration-300"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
            
            {/* Enhanced Statistics Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-2xl font-bold mb-6 text-gray-700">Account Statistics</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Scans</p>
                    <p className="text-3xl font-bold text-emerald-700">
                      {userStats?.scan_count || 0}
                    </p>
                  </div>
                  <div className="text-emerald-600 text-2xl">🔍</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-sky-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Crop Plans</p>
                    <p className="text-3xl font-bold text-blue-700">
                      {userStats?.crop_count || 0}
                    </p>
                  </div>
                  <div className="text-blue-600 text-2xl">🌾</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Chat Messages</p>
                    <p className="text-3xl font-bold text-purple-700">
                      {userStats?.chat_count || 0}
                    </p>
                  </div>
                  <div className="text-purple-600 text-2xl">💬</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Favorites</p>
                    <p className="text-3xl font-bold text-amber-700">
                      {userStats?.favorites_count || 0}
                    </p>
                  </div>
                  <div className="text-amber-600 text-2xl">⭐</div>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            {userStats?.recent_activity && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4 text-gray-700">Recent Activity</h4>
                <div className="space-y-3">
                  {userStats.recent_activity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{activity.description}</span>
                      <span className="text-sm text-gray-500">{activity.date}</span>
                    </div>
                  ))}
                </div>              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
