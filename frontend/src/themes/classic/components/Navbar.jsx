import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  console.log('Auth context in Classic Navbar:', auth); // Debug log
  
  // Defensive destructuring with default values
  const { isAuthenticated, currentUser, logout } = auth || {};
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Ref for the dropdown container to handle hover interactions
  const dropdownRef = useRef(null);
  
  // Effect to handle hover on dropdown
  useEffect(() => {
    const dropdownElement = dropdownRef.current;
    
    if (!dropdownElement) return;
    
    const handleMouseEnter = () => setIsUserMenuOpen(true);
    const handleMouseLeave = () => setIsUserMenuOpen(false);
    
    dropdownElement.addEventListener('mouseenter', handleMouseEnter);
    dropdownElement.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      dropdownElement.removeEventListener('mouseenter', handleMouseEnter);
      dropdownElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
  
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
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">🌱</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              AgriAI
            </span>
          </Link>

          {/* Navigation Links - Centered */}
          <div className="hidden md:flex items-center space-x-1">            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-green-500 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}{/* User Profile */}
            <div className="flex items-center ml-4">
              {isAuthenticated && currentUser ? (
                <div className="relative" ref={dropdownRef}>
                  <div 
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-gray-600 hover:text-gray-800 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm">
                      M
                    </div>
                    <span>{currentUser.fullName || currentUser.email.split('@')[0]}</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                    {/* User dropdown menu */}                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-10 border border-gray-100">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">{currentUser.fullName || currentUser.email.split('@')[0]}</p>
                        <p className="text-xs text-gray-500 mt-1">{currentUser.email}</p>
                      </div>
                      <Link 
                        to="/profile" 
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <span className="mr-3">👤</span>
                        Your Profile
                      </Link>
                      <Link 
                        to="/history" 
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <span className="mr-3">📊</span>
                        Activity History
                      </Link>
                      <Link 
                        to="/enhanced-dashboard" 
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <span className="mr-3">📈</span>
                        Advanced Dashboard
                      </Link>
                      <Link 
                        to="/settings" 
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <span className="mr-3">⚙️</span>
                        Settings
                      </Link>                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button 
                          onClick={handleLogout}
                          className="flex items-center w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <span className="mr-3">🚪</span>
                          Sign out                        </button>                      </div>
                    </div>
                  )}
                </div>
              ) : (<>
                  {authLinks.map((item, index) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        index === 1 
                          ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 shadow-md' 
                          : location.pathname === item.path
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{item.label}</span>                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>{/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button className="p-2.5 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
