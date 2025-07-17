import React from 'react';
import { motion } from 'framer-motion';

const AnimatedSavingsPNG: React.FC = () => {
  return (
    <motion.div 
      className="relative w-full h-64 flex justify-center items-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.img
        src="/cute-chicken-pecking-a-calculator.png"
        alt="Cute chicken pecking a calculator"
        className="w-auto h-full object-contain"
        initial={{ scale: 0.8, y: 20 }}
        animate={{ 
          scale: 1,
          y: 0
        }}
        transition={{
          duration: 1,
          type: "spring",
          stiffness: 100
        }}
      />
      
      {/* Welcome Message */}
      <motion.div 
        className="absolute top-14 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-gray-200"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="text-lg font-medium text-gray-800">Track your savings!</div>
      </motion.div>

      {/* Info Badge */}
      <motion.div 
        className="absolute top-14 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        💰 Savings Tracker
      </motion.div>
    </motion.div>
  );
};

export default AnimatedSavingsPNG;
