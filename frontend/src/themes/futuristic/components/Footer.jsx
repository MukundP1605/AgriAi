import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer>
      <div>
        <p>&copy; 2025 AgriAI. All rights reserved.</p>
        <div>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
