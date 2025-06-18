import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import NeonText from './NeonText';

const FeatureCard = ({ 
  title,
  description,
  path,
  icon: Icon,
  color = 'emerald',
  delay = 0 
}) => {
  const colorStyles = {
    emerald: 'border-emerald-500/20 hover:border-emerald-500/40 bg-gradient-to-b from-emerald-900/20 to-emerald-900/5',
    cyan: 'border-cyan-500/20 hover:border-cyan-500/40 bg-gradient-to-b from-cyan-900/20 to-cyan-900/5',
    purple: 'border-purple-500/20 hover:border-purple-500/40 bg-gradient-to-b from-purple-900/20 to-purple-900/5',
    red: 'border-red-500/20 hover:border-red-500/40 bg-gradient-to-b from-red-900/20 to-red-900/5',
    blue: 'border-blue-500/20 hover:border-blue-500/40 bg-gradient-to-b from-blue-900/20 to-blue-900/5',
    amber: 'border-amber-500/20 hover:border-amber-500/40 bg-gradient-to-b from-amber-900/20 to-amber-900/5',
    green: 'border-green-500/20 hover:border-green-500/40 bg-gradient-to-b from-green-900/20 to-green-900/5',
  };

  return (
    <motion.div
      className={`
        relative p-6 rounded-2xl border backdrop-blur-sm
        transition-all duration-300 cursor-pointer group
        ${colorStyles[color]}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: delay,
        ease: [0.43, 0.13, 0.23, 0.96]
      }}
      whileHover={{ 
        scale: 1.05,
        boxShadow: `0 0 20px 0 rgba(16, 185, 129, 0.2)`      }}
    >      
      {/* Top Glow Effect */}
      {color === 'emerald' && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1/4 h-px bg-emerald-500 opacity-50 blur-sm" />}
      {color === 'green' && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1/4 h-px bg-green-500 opacity-50 blur-sm" />}
      {color === 'red' && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1/4 h-px bg-red-500 opacity-50 blur-sm" />}
      {color === 'blue' && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1/4 h-px bg-blue-500 opacity-50 blur-sm" />}
      {color === 'cyan' && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1/4 h-px bg-cyan-500 opacity-50 blur-sm" />}
      {color === 'purple' && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1/4 h-px bg-purple-500 opacity-50 blur-sm" />}
      {color === 'amber' && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1/4 h-px bg-amber-500 opacity-50 blur-sm" />}
      
      <div className="flex flex-col h-full">
        <div className="mb-4">
          {Icon && (
            <div className={color === 'emerald' ? 'text-emerald-500 text-4xl mb-2' : 
                           color === 'green' ? 'text-green-500 text-4xl mb-2' :
                           color === 'red' ? 'text-red-500 text-4xl mb-2' :
                           color === 'blue' ? 'text-blue-500 text-4xl mb-2' :
                           color === 'cyan' ? 'text-cyan-500 text-4xl mb-2' :
                           color === 'purple' ? 'text-purple-500 text-4xl mb-2' :
                           color === 'amber' ? 'text-amber-500 text-4xl mb-2' : 'text-emerald-500 text-4xl mb-2'}>
              <Icon />
            </div>
          )}
          <NeonText as="h3" color={color} size="xl" className="font-medium mb-2">
            {title}
          </NeonText>
          <p className="text-gray-300 text-sm leading-relaxed">
            {description}
          </p>
        </div>
          <div className="mt-auto">
          <Link 
            to={path} 
            className={
              (color === 'emerald' ? 'text-emerald-400 hover:text-emerald-300' :
               color === 'green' ? 'text-green-400 hover:text-green-300' :
               color === 'red' ? 'text-red-400 hover:text-red-300' :
               color === 'blue' ? 'text-blue-400 hover:text-blue-300' :
               color === 'cyan' ? 'text-cyan-400 hover:text-cyan-300' :
               color === 'purple' ? 'text-purple-400 hover:text-purple-300' :
               color === 'amber' ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300') +
              ' text-sm font-medium flex items-center gap-1 transition-colors duration-300'
            }
          >
            Learn More
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 7l5 5m0 0l-5 5m5-5H6" 
              />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default FeatureCard;
