import React from 'react';
import { motion } from 'framer-motion';
import FeatureCard from '../ui/FeatureCard';
import { 
  FaSeedling, 
  FaMicrochip, 
  FaRobot, 
  FaChartLine, 
  FaStore, 
  FaCloudSunRain 
} from 'react-icons/fa';

const FeatureGrid = () => {
  const features = [
    {
      title: 'Smart Crop Planning',
      description: 'Get AI-powered crop recommendations based on your soil conditions, climate, and farming goals.',
      path: '/crop',
      icon: FaSeedling,
      color: 'green'
    },
    {
      title: 'Disease Detection',
      description: 'Upload plant images for instant disease identification and treatment recommendations.',
      path: '/disease',
      icon: FaMicrochip,
      color: 'red'
    },
    {
      title: 'AI Farm Assistant',
      description: 'Chat with our agricultural AI expert for personalized farming advice and tips.',
      path: '/chat',
      icon: FaRobot,
      color: 'cyan'
    },
    {
      title: 'Farm Analytics',
      description: 'Track your farming progress and get insights to optimize your agricultural practices.',
      path: '/forms',
      icon: FaChartLine,
      color: 'purple'
    },
    {
      title: 'Marketplace Access',
      description: 'Browse and purchase agricultural supplies directly from trusted vendors.',
      path: '/marketplace',
      icon: FaStore,
      color: 'amber'
    },
    {
      title: 'Weather Integration',
      description: 'Get real-time weather updates and forecasts tailored to your farm location.',
      path: '/weather',
      icon: FaCloudSunRain,
      color: 'blue'
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  return (
    <section className="py-32 px-4 sm:px-6 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-900/80" />
      </div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4 text-white">
            Futuristic Farming <span className="text-emerald-500">Features</span>
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Discover how our AI-powered tools can transform your agricultural operation with
            cutting-edge technology designed for the modern farmer.
          </p>
        </motion.div>
        
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              title={feature.title}
              description={feature.description}
              path={feature.path}
              icon={feature.icon}
              color={feature.color}
              delay={index * 0.1}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureGrid;
