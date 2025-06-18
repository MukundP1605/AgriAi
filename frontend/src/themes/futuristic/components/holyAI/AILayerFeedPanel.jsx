import React from 'react';
import { motion } from 'framer-motion';
import { FaRobot, FaSeedling, FaMicrochip, FaVial, FaCloudSunRain } from 'react-icons/fa';

const AILayerFeedPanel = () => {
  const feedItems = [
    {
      icon: FaRobot,
      title: 'AI Farm Assistant',
      status: 'Active',
      color: 'cyan',
      offset: { x: '-5vw', y: '-2vh' },
    },
    {
      icon: FaSeedling,
      title: 'Smart Crop Planning',
      status: 'Analyzing',
      color: 'emerald',
      offset: { x: '3vw', y: '4vh' },
    },
    {
      icon: FaMicrochip,
      title: 'Disease Watcher',
      status: 'Scanning',
      color: 'red',
      offset: { x: '-4vw', y: '8vh' },
    },
    {
      icon: FaVial,
      title: 'Soil Sensor',
      status: 'Connected',
      color: 'amber',
      offset: { x: '6vw', y: '-4vh' },
    },
    {
      icon: FaCloudSunRain,
      title: 'Weather Sync',
      status: 'Updated',
      color: 'blue',
      offset: { x: '8vw', y: '2vh' },
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      }
    }
  };

  return (
    <motion.div 
      className="relative max-w-6xl mx-auto py-20"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <h2 className="text-2xl font-bold text-center mb-16 text-cyan-400">
        <span className="tracking-widest">SYSTEM MONITORING</span>
        <span className="block text-sm text-cyan-600 mt-1 font-mono">// AI LAYER FEED ACTIVE</span>
      </h2>

      <div className="relative h-[60vh] w-full">
        {feedItems.map((item, index) => (
          <FeedPanel 
            key={index}
            icon={item.icon}
            title={item.title}
            status={item.status}
            color={item.color}
            offset={item.offset}
            delay={index * 0.15}
            index={index}
          />
        ))}
        
        {/* Background grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICA8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMjAzMjQyIiBzdHJva2Utd2lkdGg9IjAuNSIvPgo8L3BhdHRlcm4+CjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiIC8+Cjwvc3ZnPg==')]" style={{ opacity: 0.2, zIndex: -1 }}></div>
      </div>
    </motion.div>
  );
};

const FeedPanel = ({ icon: Icon, title, status, color, offset, delay, index }) => {
  const colorMap = {
    cyan: 'from-cyan-600/20 to-cyan-900/10 border-cyan-500/30 text-cyan-400',
    emerald: 'from-emerald-600/20 to-emerald-900/10 border-emerald-500/30 text-emerald-400',
    red: 'from-red-600/20 to-red-900/10 border-red-500/30 text-red-400',
    amber: 'from-amber-600/20 to-amber-900/10 border-amber-500/30 text-amber-400',
    blue: 'from-blue-600/20 to-blue-900/10 border-blue-500/30 text-blue-400',
  };

  const colorClasses = colorMap[color] || colorMap.cyan;
  const position = index % 2 === 0 ? 'left-1/4' : 'left-1/2';

  return (
    <motion.div
      className={`absolute ${position}`}
      initial={{ opacity: 0, scale: 0.9, x: offset.x, y: offset.y }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        x: offset.x, 
        y: offset.y,
        transition: { delay, duration: 0.5 }
      }}
      whileHover={{ scale: 1.05, rotate: '-1deg' }}
      style={{ zIndex: 10 - index }}
    >
      <div className={`w-64 h-48 backdrop-blur-md bg-gradient-to-b ${colorClasses} rounded-lg border shadow-lg`}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center mb-3">
            <Icon className="text-xl mr-2" />
            <h3 className="font-bold">{title}</h3>
          </div>
          
          <div className="flex-grow relative">
            {/* Simulated activity graph */}
            <div className="absolute inset-0">
              <svg width="100%" height="100%" viewBox="0 0 100 60" preserveAspectRatio="none">
                <motion.path
                  d={`M 0,${30 + Math.random() * 20} 
                      ${Array.from({ length: 10 }).map((_, i) => 
                        `L ${i * 10},${30 + Math.sin(i) * (15 + Math.random() * 10)}`
                      ).join(' ')} 
                      L 100,${30 + Math.random() * 20}`}
                  fill="none"
                  stroke={`currentColor`}
                  strokeWidth="1"
                  strokeOpacity="0.5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: 1, 
                    opacity: 0.5,
                    transition: { delay: delay + 0.3, duration: 1.5 }
                  }}
                />
              </svg>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-auto">
            <div className="text-xs font-mono opacity-80">MODULE ID: {index + 1}</div>
            <div className="text-xs font-semibold flex items-center">
              <span className="w-2 h-2 rounded-full bg-current mr-1 animate-pulse"></span>
              {status}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AILayerFeedPanel;
