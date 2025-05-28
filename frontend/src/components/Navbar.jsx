import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  
  const linkStyle = {
    margin: '0 15px', 
    color: 'white', 
    textDecoration: 'none',
    fontWeight: 500,
    padding: '5px 10px',
    borderRadius: '4px',
    transition: 'background-color 0.2s'
  };
  
  const activeLinkStyle = {
    ...linkStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    fontWeight: 700
  };
    return (
    <nav>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🌿 AgriAI</div>
        <div>          <Link to="/" style={location.pathname === '/' ? activeLinkStyle : linkStyle}>Home</Link>
          <Link to="/crop" style={location.pathname === '/crop' ? activeLinkStyle : linkStyle}>Crop</Link>
          <Link to="/disease" style={location.pathname === '/disease' ? activeLinkStyle : linkStyle}>Disease</Link>
          <Link to="/chat" style={location.pathname === '/chat' ? activeLinkStyle : linkStyle}>Chat</Link>
          <Link to="/login" style={location.pathname === '/login' ? activeLinkStyle : linkStyle}>Login</Link>
        </div>
      </div>
    </nav>
  );
};


export default Navbar;
