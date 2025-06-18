import React from 'react';
import { motion } from 'framer-motion';
import NeonText from '../ui/NeonText';
import PrimaryButton from '../ui/PrimaryButton';

const HeroSection = () => {
  return (
    <section className="h-screen relative flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6 py-16">
      {/* Background Animation Blob */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-1/2 h-1/2 rounded-full bg-gradient-to-tr from-purple-500/10 to-pink-500/10 blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Grid Lines Overlay */}
      <div className="absolute inset-0 z-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICA8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjODg4IiBzdHJva2Utd2lkdGg9IjAuNSIvPgo8L3BhdHRlcm4+CjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiIC8+Cjwvc3ZnPg==')]" />
      
      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Logo Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <svg width="80" height="80" viewBox="0 0 80 80" className="text-emerald-500">
              <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="1,6" className="animate-spin-slow" />
              <circle cx="40" cy="40" r="24" fill="rgba(16, 185, 129, 0.1)" stroke="currentColor" strokeWidth="2" />
              <path d="M40 16 L46 28 L60 28 L48 36 L54 48 L40 40 L26 48 L32 36 L20 28 L34 28 Z" fill="currentColor" opacity="0.7" />
            </svg>
          </motion.div>
          
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-4"
          >
            <NeonText as="h1" color="emerald" size="5xl" className="font-bold mb-2">
              AgriAI
            </NeonText>
            <NeonText as="p" color="cyan" size="xl" className="font-light">
              The Future of Farming is Here
            </NeonText>
          </motion.div>
          
          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-gray-300 max-w-2xl mb-8 text-lg"
          >
            Revolutionize your agricultural practices with cutting-edge AI technology.
            Monitor, analyze, and optimize your farm's performance with precision never before possible.
          </motion.p>
          
          {/* CTA Buttons */}          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <PrimaryButton 
              size="lg"
              onClick={() => document.getElementById('cta').scrollIntoView({ behavior: 'smooth' })}
            >
              Get Started
            </PrimaryButton>
            <PrimaryButton 
              variant="outline" 
              size="lg"
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Features
            </PrimaryButton>
          </motion.div>
        </div>
      </div>
      
      {/* Bottom Scan Line Animation */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent animate-scan-line" />
    </section>
  );
};

export default HeroSection;
