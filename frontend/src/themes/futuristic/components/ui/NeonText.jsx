import React from 'react';

const NeonText = ({ 
  children, 
  color = 'emerald', 
  size = 'default', 
  className = '',
  as = 'span'
}) => {
  const colors = {
    emerald: 'text-emerald-500',
    cyan: 'text-cyan-500',
    purple: 'text-purple-500',
    amber: 'text-amber-500',
    red: 'text-red-500',
    blue: 'text-blue-500',
    green: 'text-green-500',
  };
  
  const sizes = {
    sm: 'text-sm',
    default: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
  };
  
  const glowEffects = {
    emerald: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.7))',
    cyan: 'drop-shadow(0 0 10px rgba(6, 182, 212, 0.7))',
    purple: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.7))',
    amber: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.7))',
    red: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.7))',
    blue: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.7))',
    green: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.7))',
  };
  
  const Component = as;
  
  return (
    <Component 
      className={`
        font-sora ${colors[color]} ${sizes[size]}
        [text-shadow:0_0_10px_currentColor] 
        [filter:${glowEffects[color]}]
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </Component>
  );
};

export default NeonText;
