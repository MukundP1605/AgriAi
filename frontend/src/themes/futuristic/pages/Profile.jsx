import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const auth = useAuth();
  const { currentUser, updateProfile, isAuthenticated } = auth || {};
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
    try {
      const token = localStorage.getItem('token');
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
    try {
      const token = localStorage.getItem('token');
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
      const response = await fetch('http://127.0.0.1:8000/api/user/change-password', {
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>User Profile</h1>
      
      {userStats && (
        <div>
          <h3>Quick Stats</h3>
          <p>Total Scans: {userStats.total_scans || 0}</p>
          <p>Recent Activity: {userStats.recent_activity || 0}</p>
          <p>Last Login: {userStats.last_login ? new Date(userStats.last_login).toLocaleDateString() : 'N/A'}</p>
        </div>
      )}

      {!editing ? (
        <div>
          <h2>Profile Information</h2>
          <p><strong>Name:</strong> {formData.fullName}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          <p><strong>Location:</strong> {formData.location}</p>
          <p><strong>Farm Type:</strong> {formData.farmType}</p>
          <p><strong>Phone:</strong> {formData.phone}</p>
          <p><strong>Farm Size:</strong> {formData.farmSize}</p>
          <p><strong>Primary Crops:</strong> {formData.primaryCrops}</p>
          <p><strong>Farming Experience:</strong> {formData.farmingExperience}</p>
          
          <button onClick={() => setEditing(true)}>Edit Profile</button>
          <button onClick={() => setChangingPassword(true)}>Change Password</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h2>Edit Profile</h2>
          
          <div>
            <label>Full Name:</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled
            />
          </div>

          <div>
            <label>Location:</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Farm Type:</label>
            <select name="farmType" value={formData.farmType} onChange={handleChange}>
              <option value="small">Small Scale</option>
              <option value="medium">Medium Scale</option>
              <option value="large">Large Scale</option>
              <option value="organic">Organic</option>
              <option value="greenhouse">Greenhouse</option>
              <option value="livestock">Livestock</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div>
            <label>Phone:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Farm Size:</label>
            <input
              type="text"
              name="farmSize"
              value={formData.farmSize}
              onChange={handleChange}
              placeholder="e.g., 50 acres"
            />
          </div>

          <div>
            <label>Primary Crops:</label>
            <input
              type="text"
              name="primaryCrops"
              value={formData.primaryCrops}
              onChange={handleChange}
              placeholder="e.g., Corn, Wheat, Soybeans"
            />
          </div>

          <div>
            <label>Farming Experience:</label>
            <input
              type="text"
              name="farmingExperience"
              value={formData.farmingExperience}
              onChange={handleChange}
              placeholder="e.g., 10 years"
            />
          </div>

          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => setEditing(false)}>Cancel</button>
        </form>
      )}

      {changingPassword && (
        <form onSubmit={handlePasswordSubmit}>
          <h2>Change Password</h2>
          
          <div>
            <label>Current Password:</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <div>
            <label>New Password:</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <div>
            <label>Confirm New Password:</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>          <button type="submit">Change Password</button>
          <button type="button" onClick={() => setChangingPassword(false)}>Cancel</button>
        </form>
      )}
    </div>
  );
};

export default Profile;
