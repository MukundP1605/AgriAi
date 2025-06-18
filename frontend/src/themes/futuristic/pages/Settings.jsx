import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useUITheme } from '../../../context/UIThemeContext';

const Settings = () => {
  const auth = useAuth();
  const { currentUser, logout, isAuthenticated } = auth || {};
  const navigate = useNavigate();
  const { theme, setTheme } = useUITheme();
  const [showConfirmChat, setShowConfirmChat] = useState(false);
  const [showConfirmDisease, setShowConfirmDisease] = useState(false);
  const [showConfirmCrop, setShowConfirmCrop] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    dataSharing: false,
    autoSave: true,
    language: 'en'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleClearChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/user/history/chat', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setShowConfirmChat(false);
        alert('Chat history cleared successfully');
      }
    } catch (error) {
      console.error('Error clearing chat history:', error);
      alert('Error clearing chat history');
    }
  };
  
  const handleClearDiseaseScans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/user/history/scans', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setShowConfirmDisease(false);
        alert('Disease scan history cleared successfully');
      }
    } catch (error) {
      console.error('Error clearing disease scans:', error);
      alert('Error clearing disease scans');
    }
  };
  
  const handleClearCropPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/user/history/crops', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setShowConfirmCrop(false);
        alert('Crop planning history cleared successfully');
      }
    } catch (error) {
      console.error('Error clearing crop plans:', error);
      alert('Error clearing crop plans');
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setMessage('Settings saved successfully!');
      } else {
        setMessage('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings');
    }

    setLoading(false);
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const exportUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/user/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agriai_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data');
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        alert('Account deleted successfully');
        logout();
        navigate('/');
      } else {
        alert('Error deleting account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Error deleting account');
    }
  };

  // If no user is logged in, show a placeholder
  if (!currentUser) {
    return (
      <div>
        <h2>Loading settings...</h2>
      </div>
    );
  }  

  return (
    <div>
      <h1>Settings</h1>
      
      <div>
        <h2>User Information</h2>
        <p><strong>Name:</strong> {currentUser.fullName}</p>
        <p><strong>Email:</strong> {currentUser.email}</p>
        <p><strong>Account Type:</strong> Standard</p>
        <button onClick={() => navigate('/profile')}>Edit Profile</button>
      </div>

      <div>
        <h2>UI Theme</h2>
        <label>
          Theme: 
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="classic">Classic</option>
            <option value="futuristic">Futuristic</option>
          </select>
        </label>
      </div>

      <div>
        <h2>Application Settings</h2>
        {message && <div style={{color: message.includes('success') ? 'green' : 'red'}}>{message}</div>}
        
        <div>
          <label>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => handleSettingChange('notifications', e.target.checked)}
            />
            Enable Notifications
          </label>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={settings.emailAlerts}
              onChange={(e) => handleSettingChange('emailAlerts', e.target.checked)}
            />
            Email Alerts
          </label>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={settings.dataSharing}
              onChange={(e) => handleSettingChange('dataSharing', e.target.checked)}
            />
            Allow Data Sharing for Research
          </label>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
            />
            Auto-save Data
          </label>
        </div>

        <div>
          <label>
            Language: 
            <select 
              value={settings.language} 
              onChange={(e) => handleSettingChange('language', e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="hi">Hindi</option>
            </select>
          </label>
        </div>

        <button onClick={handleSaveSettings} disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div>
        <h2>Data Management</h2>
        
        <div>
          <h3>Clear Chat History</h3>
          <p>This will permanently delete all your chat conversations with the AI assistant.</p>
          {!showConfirmChat ? (
            <button onClick={() => setShowConfirmChat(true)}>Clear Chat History</button>
          ) : (
            <div>
              <p style={{color: 'red'}}>Are you sure? This cannot be undone.</p>
              <button onClick={handleClearChatHistory}>Yes, Clear</button>
              <button onClick={() => setShowConfirmChat(false)}>Cancel</button>
            </div>
          )}
        </div>

        <div>
          <h3>Clear Disease Scan History</h3>
          <p>This will delete all your disease detection scans and results.</p>
          {!showConfirmDisease ? (
            <button onClick={() => setShowConfirmDisease(true)}>Clear Disease Scans</button>
          ) : (
            <div>
              <p style={{color: 'red'}}>Are you sure? This cannot be undone.</p>
              <button onClick={handleClearDiseaseScans}>Yes, Clear</button>
              <button onClick={() => setShowConfirmDisease(false)}>Cancel</button>
            </div>
          )}
        </div>

        <div>
          <h3>Clear Crop Planning History</h3>
          <p>This will delete all your crop recommendation history.</p>
          {!showConfirmCrop ? (
            <button onClick={() => setShowConfirmCrop(true)}>Clear Crop Plans</button>
          ) : (
            <div>
              <p style={{color: 'red'}}>Are you sure? This cannot be undone.</p>
              <button onClick={handleClearCropPlans}>Yes, Clear</button>
              <button onClick={() => setShowConfirmCrop(false)}>Cancel</button>
            </div>
          )}
        </div>

        <div>
          <h3>Export Data</h3>
          <p>Download a copy of all your AgriAI data.</p>
          <button onClick={exportUserData}>Export My Data</button>
        </div>
      </div>

      <div>
        <h2>Account Management</h2>
        <div>
          <button onClick={handleLogout}>Logout</button>
        </div>
        
        <div>
          <h3>Delete Account</h3>
          <p style={{color: 'red'}}>
            Warning: This will permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button onClick={deleteAccount} style={{backgroundColor: 'red', color: 'white'}}>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
