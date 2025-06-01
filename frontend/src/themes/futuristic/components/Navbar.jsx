import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import ThemeToggle from '../../../components/ThemeToggle';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  
  const { isAuthenticated, currentUser, logout } = auth || {};
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/crop', label: 'Crop' },
    { path: '/disease', label: 'Disease' },
    { path: '/chat', label: 'Chat' },
    { path: '/about', label: 'About' }
  ];

  const authLinks = [
    { path: '/login', label: 'Login' },
    { path: '/signup', label: 'Sign Up' }
  ];

  const handleLogout = () => {
    if (logout) {
      logout();
      setIsUserMenuOpen(false);
      navigate('/');
    }
  };

  return (
    <nav>
      <Link to="/">AgriAI</Link>
      {navItems.map((item) => (
        <Link key={item.path} to={item.path}>{item.label}</Link>
      ))}
      {isAuthenticated && currentUser ? (
        <div>
          <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
            {currentUser.fullName || currentUser.email.split('@')[0]}
          </button>
          {isUserMenuOpen && (
            <div>
              <Link to="/profile">Profile</Link>
              <Link to="/history">History</Link>
              <Link to="/enhanced-dashboard">Dashboard</Link>
              <Link to="/settings">Settings</Link>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
          <ThemeToggle />
        </div>
      ) : (
        <div>
          {authLinks.map((item) => (
            <Link key={item.path} to={item.path}>{item.label}</Link>
          ))}
          <ThemeToggle />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
