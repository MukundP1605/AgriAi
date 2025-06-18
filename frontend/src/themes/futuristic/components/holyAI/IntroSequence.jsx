import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const IntroSequence = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  
  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 1500);
    const timer2 = setTimeout(() => setStage(2), 3000);
    const timer3 = setTimeout(() => {
      setStage(3);
      if (onComplete) onComplete();
    }, 4500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);
  
  // Glitch animation variants
  const glitchText = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.1,
        yoyo: 5,
        repeat: 2,
      }
    }
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
      {stage < 3 && (
        <motion.div 
          className="flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: stage > 0 ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {stage === 0 && (
            <div className="w-16 h-16 border-t-2 border-emerald-500 rounded-full animate-spin"></div>
          )}
          
          {stage === 1 && (
            <motion.div
              variants={glitchText}
              initial="hidden"
              animate="visible"
              className="text-emerald-500 font-mono text-2xl"
            >
              Initializing AgriAI...
              <span className="ml-1 animate-blink">_</span>
            </motion.div>
          )}
          
          {stage === 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: [0, 0.5, 0, 1, 0.8, 1], scale: 1 }}
              transition={{ duration: 1.5, times: [0, 0.2, 0.3, 0.4, 0.6, 1] }}
              className="relative"
            >
              <div className="text-4xl font-bold text-emerald-500 font-mono relative z-10">
                <span className="relative">
                  AgriAI
                  <span className="absolute inset-0 text-white mix-blend-screen opacity-70" style={{ filter: 'blur(3px)' }}>AgriAI</span>
                  <span className="absolute inset-0 text-red-500 mix-blend-screen opacity-50 translate-x-1 -translate-y-1" style={{ filter: 'blur(2px)' }}>AgriAI</span>
                  <span className="absolute inset-0 text-blue-500 mix-blend-screen opacity-50 -translate-x-1 -translate-y-1" style={{ filter: 'blur(2px)' }}>AgriAI</span>
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
      
      <motion.div 
        className="absolute inset-0 bg-black"
        initial={{ opacity: 1 }}
        animate={{ opacity: stage === 3 ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      />
    </div>
  );
};

export default IntroSequence;
