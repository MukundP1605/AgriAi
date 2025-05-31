import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DarkModeToggle from './DarkModeToggle';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/crop', label: 'Crop Planner', icon: '🌾' },
    { path: '/disease', label: 'Disease Detection', icon: '🔍' },
    { path: '/chat', label: 'AI Assistant', icon: '💬' },
    { path: '/about', label: 'About', icon: 'ℹ️' }
  ];

  // Authentication links are handled separately for better styling
  const authLinks = [
    { path: '/login', label: 'Login', icon: '🔑' },
    { path: '/signup', label: 'Sign Up', icon: '👤' }
  ];

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };  return (
    <nav className="sticky top-0 z-50 navbar bg-white border-b border-green-100 shadow-sm transition-all duration-300 dark:apple-nav dark:backdrop-blur-lg dark:bg-[rgba(30,30,30,0.85)] dark:shadow-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 dark:from-neon-pink dark:to-neon-purple rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-md dark:shadow-neon">
              <span className="text-white font-bold text-lg">🌿</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-neon-pink dark:to-neon-purple bg-clip-text text-transparent">
              AgriAI
            </span>
          </Link>
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 dark:from-neon-pink dark:to-neon-purple dark:shadow-neon'
                    : 'text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-neon-pink hover:bg-green-50 dark:hover:bg-dark-card/60'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            {/* Dark Mode Toggle */}
            <div className="ml-2">
              <DarkModeToggle />
            </div>
            
            {/* Auth Links or User Profile */}
            <div className="flex items-center ml-4 border-l border-gray-200 pl-4">
              {isAuthenticated && currentUser ? (
                <div className="relative">
                  <button 
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-gray-600 hover:text-green-600 hover:bg-green-50"
                  >
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
                      {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
                    </div>
                    <span>{currentUser.fullName || currentUser.email.split('@')[0]}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                    {/* User dropdown menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-200 rounded-xl shadow-lg py-1 z-10 border border-gray-100 dark:border-gray-700">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{currentUser.fullName || currentUser.email.split('@')[0]}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                      </div>                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-emerald-900/30"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Your Profile
                      </Link>                      <Link 
                        to="/history" 
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-emerald-900/30"
                        onClick={() => setIsUserMenuOpen(false)}                      >
                        Activity History
                      </Link>                      <Link 
                        to="/enhanced-dashboard" 
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-emerald-900/30"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Enhanced Dashboard
                      </Link>
                      <Link 
                        to="/settings" 
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-emerald-900/30"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>                  {authLinks.map((item, index) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        index === 1 
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800' 
                          : location.pathname === item.path
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25'
                            : 'text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-emerald-400 hover:bg-green-50 dark:hover:bg-emerald-900/30'
                      }`}
                    >
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
            {/* Mobile Menu Button and Dark Mode Toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <DarkModeToggle />
            <button className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-emerald-400 hover:bg-green-50 dark:hover:bg-emerald-900/30 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
