import React from 'react';
import { motion } from 'framer-motion';

const AnimatedFarmPNG: React.FC = () => {
  return (
    <div className="w-full">
      <motion.div 
        className="relative w-full h-64 flex justify-center items-center overflow-hidden mt-[60px] md:mt-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.img
          src="/chickens-on-a-farm.png"
          alt="Chickens on a farm"
          className="w-auto h-full object-contain"
          initial={{ scale: 0.8, y: 20 }}
          animate={{ 
            scale: 1,
            y: 0,
            rotate: [-5, 5, -5], // Gentle left-right rotation like coin
          }}
          transition={{
            scale: { duration: 1, type: "spring", stiffness: 100 },
            y: { duration: 1, type: "spring", stiffness: 100 },
            rotate: {
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5
            }
          }}
        />

        {/* Info Badge */}
        <motion.div 
          className="absolute top-14 right-4 bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          🐓 Flock Manager
        </motion.div>
      </motion.div>

      {/* Welcome Message - moved below image */}
      <div className="flex justify-start">
        <motion.div 
          className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="text-lg font-medium text-gray-800">Welcome to your farm!</div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnimatedFarmPNG;
