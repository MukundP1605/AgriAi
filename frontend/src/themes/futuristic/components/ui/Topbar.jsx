import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, User, Wifi, Battery, Signal, X } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

const Topbar = () => {
  const auth = useAuth();
  const { currentUser } = auth || {};
  const [isMobile, setIsMobile] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Optimized rendering for mobile
  const renderMobileTopbar = () => (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 h-16 bg-black/20 backdrop-blur-md border-b border-cyan-400/20 z-30 topbar-mobile"
    >
      <div className="flex items-center justify-between h-full px-16">
        {/* Title */}
        <div className="flex items-center">
          <div>
            <h2 className="text-lg font-semibold text-white">AgriAI</h2>
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-3">
          {/* Search Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 bg-white/5 border border-cyan-400/20 rounded-lg hover:bg-cyan-400/10 transition-colors"
          >
            <Search className="w-4 h-4 text-gray-300" />
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 bg-white/5 border border-cyan-400/20 rounded-lg hover:bg-cyan-400/10 transition-colors"
          >
            <Bell className="w-4 h-4 text-gray-300" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
              3
            </span>
          </motion.button>

          {/* User Profile - simplified */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative p-2 bg-white/5 border border-cyan-400/20 rounded-lg cursor-pointer hover:bg-cyan-400/10 transition-colors"
          >
            <User className="w-4 h-4 text-cyan-400" />
          </motion.div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-16 left-0 right-0 bg-black/80 backdrop-blur-md border-b border-cyan-400/20 z-40 p-4"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search crops, diseases, or ask AI..."
              className="w-full bg-white/5 border border-cyan-400/20 rounded-lg pl-10 pr-10 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
              autoFocus
            />
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              onClick={() => setIsSearchOpen(false)}
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  // Standard desktop rendering
  const renderDesktopTopbar = () => (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-64 right-0 h-16 bg-black/20 backdrop-blur-md border-b border-cyan-400/20 z-30"
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Section - Title & Status */}
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-lg font-semibold text-white">AI Control Center</h2>
            <p className="text-xs text-cyan-400">Agricultural Intelligence Dashboard</p>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search crops, diseases, or ask AI..."
              className="w-full bg-white/5 border border-cyan-400/20 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
            />
          </div>
        </div>

        {/* Right Section - Status & User */}
        <div className="flex items-center space-x-4">
          {/* System Status Indicators */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Wifi className="w-4 h-4 text-green-400" />
              <Signal className="w-4 h-4 text-green-400" />
              <Battery className="w-4 h-4 text-green-400" />
            </div>
          </div>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 bg-white/5 border border-cyan-400/20 rounded-lg hover:bg-cyan-400/10 transition-colors"
          >
            <Bell className="w-4 h-4 text-gray-300" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
              3
            </span>
          </motion.button>

          {/* User Profile */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center space-x-3 bg-white/5 border border-cyan-400/20 rounded-lg px-3 py-2 cursor-pointer hover:bg-cyan-400/10 transition-colors"
          >
            <div className="relative">
              <User className="w-6 h-6 text-cyan-400" />
              <div className="absolute inset-0 w-6 h-6 bg-cyan-400/20 rounded-full blur-sm"></div>
            </div>            <div className="text-sm">
              <p className="text-white font-medium">
                {currentUser?.fullName || currentUser?.email || 'Guest'}
              </p>
              <p className="text-xs text-gray-400">{currentUser?.role || 'User'}</p>
            </div>
          </motion.div>

          {/* Real-time Clock */}
          <div className="text-right">
            <p className="text-xs text-cyan-400 font-mono">
              {new Date().toLocaleTimeString()}
            </p>
            <p className="text-xs text-gray-400">
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Render based on device type
  return isMobile ? renderMobileTopbar() : renderDesktopTopbar();
};

export default Topbar;
