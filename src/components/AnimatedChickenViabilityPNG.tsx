import React from 'react';
import { motion } from 'framer-motion';

const AnimatedChickenViabilityPNG: React.FC = () => {
  return (
    <div className="mt-[70px] md:mt-0">
      {/* Animation container */}
      <motion.div 
        className="relative w-full h-64 flex justify-center items-center overflow-hidden mt-8 md:mt-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.img
          src="/cute-chickens-discussing.png"
          alt="Cute chickens discussing viability"
          className="w-auto h-full object-contain"
          initial={{ scale: 0.8, y: 20 }}
          animate={{ 
            scale: 1,
            y: 0,
            rotate: [-2, 2, -2], // Gentle left-right rotation
          }}
          transition={{
            scale: { duration: 1, type: "spring", stiffness: 100 },
            y: { duration: 1, type: "spring", stiffness: 100 },
            rotate: {
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5
            }
          }}
        />

        {/* Info Badge */}
        <motion.div 
          className="absolute top-2 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          🐔 Viability Calculator
        </motion.div>
      </motion.div>

      {/* Welcome Message - now below animation */}
      <div className="flex justify-start pl-4">
        <motion.div 
          className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-gray-200"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="text-lg font-medium text-gray-800">Calculate your chicken venture!</div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnimatedChickenViabilityPNG;