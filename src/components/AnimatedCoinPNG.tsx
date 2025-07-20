import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedCoinPNG: React.FC = () => {
  return (
    <motion.div 
      className="relative w-full h-64 flex justify-center items-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.img
        src="/chicken-coin.png"
        alt="Chicken with coin - expense tracking"
        className="w-auto h-full object-contain"
        initial={{ scale: 0.8, y: 20 }}
        animate={{ 
          scale: 1,
          y: 0,
          rotate: [0, 2, -2, 0]
        }}
        transition={{
          duration: 1,
          type: "spring",
          stiffness: 100,
          rotate: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }
        }}
      />
      
      {/* Welcome Message - Bottom Left */}
      <motion.div 
        className="absolute bottom-0.5 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-gray-200"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="text-lg font-medium text-gray-800">Track every expense!</div>
      </motion.div>

      {/* Info Badge - Top Right */}
      <motion.div 
        className="absolute top-2 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        💰 Expense Tracker
      </motion.div>
    </motion.div>
  );
};
