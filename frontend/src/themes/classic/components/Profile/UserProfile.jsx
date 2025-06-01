import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const UserProfile = () => {
  const { currentUser, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState(null);
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

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/user/profile/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const stats = await response.json();
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        updateProfile(updatedUser);
        setEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/user/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information Card */}
          <div className="lg:col-span-2">
            <Card>
              <Card.Header>
                <div className="flex justify-between items-center">
                  <Card.Title>Profile Information</Card.Title>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(!editing)}
                  >
                    {editing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
              </Card.Header>
              
              <Card.Content>
                {editing ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Farm Size
                        </label>
                        <input
                          type="text"
                          name="farmSize"
                          value={formData.farmSize}
                          onChange={handleInputChange}
                          placeholder="e.g., 5 acres"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Farm Type
                        </label>
                        <select
                          name="farmType"
                          value={formData.farmType}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="small">Small Scale</option>
                          <option value="medium">Medium Scale</option>
                          <option value="large">Large Scale</option>
                          <option value="organic">Organic</option>
                        </select>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Primary Crops
                        </label>
                        <input
                          type="text"
                          name="primaryCrops"
                          value={formData.primaryCrops}
                          onChange={handleInputChange}
                          placeholder="e.g., Rice, Wheat, Tomatoes"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Farming Experience
                        </label>
                        <select
                          name="farmingExperience"
                          value={formData.farmingExperience}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="">Select experience level</option>
                          <option value="beginner">Beginner (0-2 years)</option>
                          <option value="intermediate">Intermediate (3-10 years)</option>
                          <option value="experienced">Experienced (10+ years)</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        loading={loading}
                        disabled={loading}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
                        <p className="text-gray-900">{currentUser?.fullName || 'Not provided'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Email</h4>
                        <p className="text-gray-900">{currentUser?.email}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                        <p className="text-gray-900">{formData.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Location</h4>
                        <p className="text-gray-900">{currentUser?.location || 'Not provided'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Farm Size</h4>
                        <p className="text-gray-900">{formData.farmSize || 'Not provided'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Farm Type</h4>
                        <Badge variant="secondary">{currentUser?.farmType || 'Not specified'}</Badge>
                      </div>
                      <div className="md:col-span-2">
                        <h4 className="text-sm font-medium text-gray-500">Primary Crops</h4>
                        <p className="text-gray-900">{formData.primaryCrops || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card.Content>
            </Card>

            {/* Password Change Section */}
            <Card className="mt-6">
              <Card.Header>
                <Card.Title>Change Password</Card.Title>
              </Card.Header>
              <Card.Content>
                {changingPassword ? (
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setChangingPassword(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        loading={loading}
                        disabled={loading}
                      >
                        Change Password
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-4">
                      Update your password to keep your account secure.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setChangingPassword(true)}
                    >
                      Change Password
                    </Button>
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div>
            <Card>
              <Card.Header>
                <Card.Title>Activity Stats</Card.Title>
              </Card.Header>
              <Card.Content>
                {userStats ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600">
                        {userStats.total_scans}
                      </div>
                      <p className="text-sm text-gray-600">Disease Scans</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {userStats.total_crop_plans}
                      </div>
                      <p className="text-sm text-gray-600">Crop Plans</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {userStats.total_chat_sessions}
                      </div>
                      <p className="text-sm text-gray-600">Chat Sessions</p>
                    </div>
                    
                    <div className="text-center pt-2 border-t">
                      <p className="text-sm text-gray-600">Member since</p>
                      <p className="font-medium">{currentUser?.created_at || 'N/A'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    Loading stats...
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;