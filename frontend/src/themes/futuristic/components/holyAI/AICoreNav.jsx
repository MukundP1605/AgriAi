import React from 'react';
import { motion } from 'framer-motion';
import { HiHome, HiChatAlt2, HiChartBar, HiShoppingCart, HiCog } from 'react-icons/hi';

const AICoreNav = () => {
  const navItems = [
    { icon: HiHome, label: 'Home', href: '/' },
    { icon: HiChatAlt2, label: 'Assistant', href: '/chat' },
    { icon: HiChartBar, label: 'Analytics', href: '/analytics' },
    { icon: HiShoppingCart, label: 'Market', href: '/marketplace' },
    { icon: HiCog, label: 'Settings', href: '/settings' }
  ];

  return (
    <motion.div 
      className="fixed top-8 right-8 z-50"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 1.5 }}
    >
      <div className="flex flex-col gap-6">
        {navItems.map((item, index) => (
          <NavItem 
            key={item.label} 
            icon={item.icon} 
            label={item.label} 
            href={item.href} 
            delay={index * 0.1}
          />
        ))}
      </div>
    </motion.div>
  );
};

const NavItem = ({ icon: Icon, label, href, delay = 0 }) => {
  return (
    <motion.a
      href={href}
      className="group relative flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.8, x: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: 1.5 + delay,
        ease: [0.19, 1.0, 0.22, 1.0]
      }}
      whileHover={{ scale: 1.1 }}
    >
      <div className="relative">
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-cyan-500 blur-md opacity-30 group-hover:opacity-70 transition-opacity duration-300"></div>
        
        {/* Icon Circle */}
        <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-gray-900/90 border border-cyan-500/30 backdrop-blur-sm text-cyan-400 group-hover:text-cyan-300 transition-all duration-300 z-10">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      {/* Tooltip */}
      <div className="absolute right-full mr-3 px-3 py-1.5 rounded-md bg-gray-900/80 backdrop-blur-sm border border-cyan-500/20 text-xs text-cyan-400 whitespace-nowrap opacity-0 scale-90 translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-300">
        {label}
      </div>
    </motion.a>
  );
};

export default AICoreNav;
