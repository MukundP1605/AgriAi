import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  
  const { isAuthenticated, currentUser, logout } = auth || {};
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAIMenuOpen, setIsAIMenuOpen] = useState(false);
  
  // Refs for the dropdown containers
  const aiDropdownRef = useRef(null);
  // Effect to handle hover on AI dropdown
  useEffect(() => {
    const aiDropdownElement = aiDropdownRef.current;
    
    if (aiDropdownElement) {
      const handleMouseEnter = () => setIsAIMenuOpen(true);
      const handleMouseLeave = () => setIsAIMenuOpen(false);
      
      aiDropdownElement.addEventListener('mouseenter', handleMouseEnter);
      aiDropdownElement.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        aiDropdownElement.removeEventListener('mouseenter', handleMouseEnter);
        aiDropdownElement.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (aiDropdownRef.current && !aiDropdownRef.current.contains(event.target)) {
        setIsAIMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  // Navigation items - reorganized with AI Tools dropdown
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/marketplace', label: 'Marketplace' },
    { path: '/chat', label: 'AI Chat' },
    { path: '/about', label: 'About' }
  ];

  // AI Tools dropdown items (only crop, disease, fertilizer)
  const aiToolsItems = [
    { path: '/crop', label: 'Crop Planner' },
    { path: '/disease', label: 'Disease Detection' },
    { path: '/fertilizer', label: 'Fertilizer Guide' }
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
    <nav style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '20px', 
      padding: '10px 20px',
      backgroundColor: '#1a1a1a',
      color: 'white'
    }}>
      <Link to="/" style={{ fontWeight: 'bold', fontSize: '20px', color: '#00ff88' }}>
        AgriAI
      </Link>
      
      {navItems.map((item) => (
        <Link 
          key={item.path} 
          to={item.path}
          style={{ 
            color: location.pathname === item.path ? '#00ff88' : 'white',
            textDecoration: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            backgroundColor: location.pathname === item.path ? 'rgba(0, 255, 136, 0.1)' : 'transparent'
          }}
        >
          {item.label}
        </Link>
      ))}      {/* AI Tools Dropdown */}
      <div style={{ position: 'relative' }} ref={aiDropdownRef}>        <div 
          onClick={() => setIsAIMenuOpen(!isAIMenuOpen)}
          style={{ 
            color: ['/crop', '/disease', '/fertilizer'].includes(location.pathname) ? '#00ff88' : 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            backgroundColor: ['/crop', '/disease', '/fertilizer'].includes(location.pathname) ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          🤖 AI Tools ▼
        </div>

        {/* AI Tools dropdown menu */}
        {isAIMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            backgroundColor: '#2a2a2a',
            border: '1px solid #444',
            borderRadius: '8px',
            padding: '10px 0',
            minWidth: '200px',
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <div style={{ 
              padding: '10px 15px', 
              borderBottom: '1px solid #444',
              color: '#00ff88',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              🤖 AI-Powered Tools
            </div>
            
            {aiToolsItems.map((tool) => (
              <Link 
                key={tool.path}
                to={tool.path} 
                style={{
                  display: 'block',
                  padding: '10px 15px',
                  color: location.pathname === tool.path ? '#00ff88' : 'white',
                  textDecoration: 'none',
                  backgroundColor: location.pathname === tool.path ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
                  borderLeft: location.pathname === tool.path ? '3px solid #00ff88' : '3px solid transparent'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 255, 136, 0.05)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = location.pathname === tool.path ? 'rgba(0, 255, 136, 0.1)' : 'transparent'}
              >
                {tool.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginLeft: 'auto' }}>
        {isAuthenticated && currentUser ? (
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              style={{
                background: 'none',
                border: '1px solid #00ff88',
                color: '#00ff88',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {currentUser.fullName || currentUser.email.split('@')[0]} ▼
            </button>

            {isUserMenuOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '8px',
                padding: '10px 0',
                minWidth: '180px',
                zIndex: 10,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}>
                <Link to="/profile" style={{ display: 'block', padding: '8px 15px', color: 'white', textDecoration: 'none' }}>Profile</Link>
                <Link to="/cart" style={{ display: 'block', padding: '8px 15px', color: 'white', textDecoration: 'none' }}>Cart</Link>
                <Link to="/order-history" style={{ display: 'block', padding: '8px 15px', color: 'white', textDecoration: 'none' }}>Order History</Link>                <Link to="/history" style={{ display: 'block', padding: '8px 15px', color: 'white', textDecoration: 'none' }}>History</Link>                <Link to="/enhanced-dashboard" style={{ display: 'block', padding: '8px 15px', color: 'white', textDecoration: 'none' }}>Dashboard</Link>
                <Link to="/settings" style={{ display: 'block', padding: '8px 15px', color: 'white', textDecoration: 'none' }}>Settings</Link>
                <button 
                  onClick={handleLogout}
                  style={{ 
                    display: 'block', 
                    width: '100%',
                    padding: '8px 15px', 
                    color: '#ff4444',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            {authLinks.map((item) => (              <Link 
                key={item.path} 
                to={item.path}
                style={{
                  textDecoration: 'none',
                  padding: '8px 12px',
                  border: '1px solid #00ff88',
                  borderRadius: '4px',
                  backgroundColor: item.path === '/signup' ? '#00ff88' : 'transparent',
                  color: item.path === '/signup' ? 'black' : '#00ff88'
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
