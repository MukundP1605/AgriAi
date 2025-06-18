import React from 'react';
import { motion } from 'framer-motion';

const PrimaryButton = ({ 
  children, 
  variant = 'primary', 
  size = 'default', 
  disabled = false,
  loading = false,
  className = '',
  glow = true,
  ...props 
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white border-transparent',
    secondary: 'bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-emerald-400 border-gray-600',
    outline: 'bg-transparent hover:bg-gray-900/30 text-emerald-400 border border-emerald-500/50',
    danger: 'bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white border-transparent',
    success: 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white border-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    default: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  const glowEffects = {
    primary: glow ? 'shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40' : '',
    secondary: glow ? 'shadow-lg shadow-gray-700/20 hover:shadow-gray-700/40' : '',
    outline: glow ? 'shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/30' : '',
    danger: glow ? 'shadow-lg shadow-red-500/20 hover:shadow-red-500/40' : '',
    success: glow ? 'shadow-lg shadow-green-500/20 hover:shadow-green-500/40' : '',
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      className={`
        inline-flex items-center justify-center font-sora font-medium rounded-2xl border
        transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-gray-900
        ${variants[variant]}
        ${sizes[size]}
        ${glowEffects[variant]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      disabled={isDisabled}
      whileHover={{ scale: isDisabled ? 1 : 1.05 }}
      whileTap={{ scale: isDisabled ? 1 : 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </motion.button>
  );
};

export default PrimaryButton;
