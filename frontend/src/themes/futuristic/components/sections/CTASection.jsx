import React from 'react';
import { motion } from 'framer-motion';
import PrimaryButton from '../ui/PrimaryButton';
import NeonText from '../ui/NeonText';

const CTASection = () => {  return (
    <section className="py-32 px-4 sm:px-6 relative flex items-center justify-center">
      {/* Background Radial Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0,transparent_70%)]" />
      </div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div 
            key={i}
            className="absolute w-1 h-1 bg-emerald-500 rounded-full opacity-40"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
      
      {/* Animated Border Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center text-center backdrop-blur-sm p-10 rounded-2xl border border-emerald-500/10 bg-gradient-to-b from-emerald-900/10 to-transparent"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <NeonText as="h2" color="emerald" size="4xl" className="font-bold mb-4">
              Ready to Revolutionize Your Farm?
            </NeonText>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-gray-300 max-w-2xl mb-10 text-lg"
          >
            Join thousands of farmers who are already experiencing the power of AgriAI technology.
            Transform your agricultural practices and boost your productivity today.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap gap-6 justify-center"
          >
            <PrimaryButton size="lg" variant="primary">
              Start Free Trial
            </PrimaryButton>
            <PrimaryButton variant="secondary" size="lg">
              Schedule Demo
            </PrimaryButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
