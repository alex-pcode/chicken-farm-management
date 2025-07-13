import React from 'react';
import { motion } from 'framer-motion';
import { getTallAnimationClasses } from '../utils/animationUtils';

/**
 * AnimatedFarm - A welcome animation component featuring a characteristic rooster,
 * hens, and chicks in a farm setting
 * Used to welcome users to the flock profile application
 */
const AnimatedFarm: React.FC = () => {
  return (
    <motion.div 
      className={getTallAnimationClasses()}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, type: "spring" }}
    >
      {/* Welcome Message Bubble */}
      <motion.div 
        className="absolute top-2 left-2 bg-white rounded-lg px-3 py-1 shadow-md border border-gray-200 z-20"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <div className="text-xs font-medium text-gray-700">Welcome to your farm!</div>
        <div className="absolute bottom-0 left-4 w-2 h-2 bg-white border-r border-b border-gray-200 transform rotate-45 translate-y-1"></div>
      </motion.div>

      {/* Info Badge */}
      <motion.div 
        className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md z-20"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.4 }}
      >
        🐓 Flock Manager
      </motion.div>

      {/* Sun */}
      <motion.div 
        className="absolute top-4 right-8 w-8 h-8 bg-yellow-400 rounded-full shadow-lg"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="absolute inset-1 bg-yellow-300 rounded-full animate-pulse"></div>
      </motion.div>
      
      {/* Clouds */}
      <motion.div 
        className="absolute top-6 left-12 w-12 h-6 bg-white rounded-full opacity-80"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 0.8 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <div className="absolute -left-1 top-0 w-4 h-4 bg-white rounded-full"></div>
        <div className="absolute -right-1 top-0 w-4 h-4 bg-white rounded-full"></div>
      </motion.div>
      
      {/* Ground/Grass */}
      <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-green-400 to-green-300 rounded-b-2xl"></div>
      
      {/* Small fence/structure in background */}
      <motion.div 
        className="absolute bottom-12 left-6 w-20 h-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="w-full h-3 bg-amber-700 rounded"></div>
        <div className="flex justify-between mt-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-1.5 h-5 bg-amber-800 rounded"></div>
          ))}
        </div>
      </motion.div>

      {/* Main Rooster - Wider, more characteristic design */}
      <motion.div 
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        {/* Rooster tail feathers - more elaborate */}
        <motion.div 
          className="absolute -top-6 -left-8 w-20 h-10"
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute top-0 left-0 w-5 h-8 bg-gradient-to-r from-green-600 to-green-700 rounded-full transform rotate-12"></div>
          <div className="absolute top-1 left-3 w-5 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full transform rotate-6"></div>
          <div className="absolute top-2 left-6 w-5 h-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full transform rotate-0"></div>
          <div className="absolute top-1 left-9 w-5 h-8 bg-gradient-to-r from-red-600 to-red-700 rounded-full transform rotate--6"></div>
        </motion.div>
        
        {/* Rooster body - broader and more robust */}
        <motion.div 
          className="relative w-16 h-12 bg-gradient-to-b from-red-600 to-red-700 rounded-full"
          animate={{ y: [0, -1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Breast/chest - prominent white */}
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-8 bg-gradient-to-b from-white to-gray-100 rounded-full"></div>
          
          {/* Wing detail */}
          <div className="absolute top-2 right-1 w-8 h-8 bg-gradient-to-b from-red-700 to-red-800 rounded-full opacity-80"></div>
        </motion.div>
        
        {/* Rooster neck - thicker */}
        <motion.div 
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-b from-red-600 to-red-700 rounded-full"
          animate={{ y: [0, -1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
        ></motion.div>
        
        {/* Rooster head - larger */}
        <motion.div 
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-7 h-7 bg-gradient-to-b from-red-500 to-red-600 rounded-full"
          animate={{ y: [0, -1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        >
          {/* Large comb */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-5 h-4 bg-red-500 rounded-t-full"></div>
          <div className="absolute -top-4 left-1 w-2.5 h-2.5 bg-red-500 rounded-full"></div>
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 bg-red-500 rounded-full"></div>
          <div className="absolute -top-4 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></div>
          
          {/* Wattles */}
          <div className="absolute bottom-0 left-1.5 w-2.5 h-2.5 bg-red-400 rounded-full"></div>
          <div className="absolute bottom-0 right-1.5 w-2.5 h-2.5 bg-red-400 rounded-full"></div>
          
          {/* Eye */}
          <div className="absolute top-2 left-4 w-1.5 h-1.5 bg-black rounded-full"></div>
          
          {/* Beak */}
          <div className="absolute top-3 left-6 w-3 h-1.5 bg-orange-400 rounded-r-full"></div>
        </motion.div>
        
        {/* Rooster legs - sturdier */}
        <div className="absolute bottom-0 left-3 w-1.5 h-4 bg-orange-400 rounded"></div>
        <div className="absolute bottom-0 right-3 w-1.5 h-4 bg-orange-400 rounded"></div>
        
        {/* Rooster feet */}
        <div className="absolute bottom-0 left-2 w-4 h-1.5 bg-orange-300 rounded"></div>
        <div className="absolute bottom-0 right-2 w-4 h-1.5 bg-orange-300 rounded"></div>
      </motion.div>

      {/* Hen 1 */}
      <motion.div 
        className="absolute bottom-12 left-16"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <motion.div 
          className="relative w-10 h-8 bg-gradient-to-b from-amber-600 to-amber-700 rounded-full"
          animate={{ y: [0, -0.5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full">
            <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-2.5 h-1.5 bg-red-400 rounded-t-full"></div>
            <div className="absolute top-1.5 left-2.5 w-1.5 h-1.5 bg-black rounded-full"></div>
            <div className="absolute top-2 right-0 w-1.5 h-1 bg-orange-400 rounded-r-full"></div>
          </div>
          <div className="absolute bottom-0 left-1.5 w-1 h-3 bg-orange-400 rounded"></div>
          <div className="absolute bottom-0 right-1.5 w-1 h-3 bg-orange-400 rounded"></div>
        </motion.div>
      </motion.div>

      {/* Hen 2 */}
      <motion.div 
        className="absolute bottom-12 right-16"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.7, duration: 0.5 }}
      >
        <motion.div 
          className="relative w-10 h-8 bg-gradient-to-b from-red-700 to-red-800 rounded-full"
          animate={{ y: [0, -0.5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-b from-red-600 to-red-700 rounded-full">
            <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-2.5 h-1.5 bg-red-400 rounded-t-full"></div>
            <div className="absolute top-1.5 left-2.5 w-1.5 h-1.5 bg-black rounded-full"></div>
            <div className="absolute top-2 right-0 w-1.5 h-1 bg-orange-400 rounded-r-full"></div>
          </div>
          <div className="absolute bottom-0 left-1.5 w-1 h-3 bg-orange-400 rounded"></div>
          <div className="absolute bottom-0 right-1.5 w-1 h-3 bg-orange-400 rounded"></div>
        </motion.div>
      </motion.div>

      {/* Hen 3 - Pecking animation */}
      <motion.div 
        className="absolute bottom-12 left-40"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.9, duration: 0.5 }}
      >
        <motion.div 
          className="relative w-10 h-8 bg-gradient-to-b from-white to-gray-100 rounded-full"
          animate={{ 
            y: [0, -0.5, 0],
            rotateX: [0, 15, 0]
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div 
            className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-b from-gray-100 to-white rounded-full"
            animate={{ rotateX: [0, 30, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-2.5 h-1.5 bg-red-400 rounded-t-full"></div>
            <div className="absolute top-1.5 left-2.5 w-1.5 h-1.5 bg-black rounded-full"></div>
            <div className="absolute top-2 right-0 w-1.5 h-1 bg-orange-400 rounded-r-full"></div>
          </motion.div>
          <div className="absolute bottom-0 left-1.5 w-1 h-3 bg-orange-400 rounded"></div>
          <div className="absolute bottom-0 right-1.5 w-1 h-3 bg-orange-400 rounded"></div>
        </motion.div>
      </motion.div>

      {/* Hen 4 */}
      <motion.div 
        className="absolute bottom-12 right-40"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.1, duration: 0.5 }}
      >
        <motion.div 
          className="relative w-10 h-8 bg-gradient-to-b from-black to-gray-800 rounded-full"
          animate={{ y: [0, -0.5, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full">
            <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-2.5 h-1.5 bg-red-400 rounded-t-full"></div>
            <div className="absolute top-1.5 left-2.5 w-1.5 h-1.5 bg-black rounded-full"></div>
            <div className="absolute top-2 right-0 w-1.5 h-1 bg-orange-400 rounded-r-full"></div>
          </div>
          <div className="absolute bottom-0 left-1.5 w-1 h-3 bg-orange-400 rounded"></div>
          <div className="absolute bottom-0 right-1.5 w-1 h-3 bg-orange-400 rounded"></div>
        </motion.div>
      </motion.div>

      {/* Chick 1 */}
      <motion.div 
        className="absolute bottom-12 left-28"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.3, duration: 0.4 }}
      >
        <motion.div 
          className="relative w-5 h-4 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-full"
          animate={{ y: [0, -1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-full">
            <div className="absolute top-1 left-1.5 w-1 h-1 bg-black rounded-full"></div>
            <div className="absolute top-1.5 right-0 w-1 h-1 bg-orange-400 rounded-full"></div>
          </div>
          <div className="absolute bottom-0 left-1.5 w-1 h-2 bg-orange-300 rounded"></div>
          <div className="absolute bottom-0 right-1 w-1 h-2 bg-orange-300 rounded"></div>
        </motion.div>
      </motion.div>

      {/* Chick 2 */}
      <motion.div 
        className="absolute bottom-12 left-36"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.5, duration: 0.4 }}
      >
        <motion.div 
          className="relative w-5 h-4 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-full"
          animate={{ y: [0, -1, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-full">
            <div className="absolute top-1 left-1.5 w-1 h-1 bg-black rounded-full"></div>
            <div className="absolute top-1.5 right-0 w-1 h-1 bg-orange-400 rounded-full"></div>
          </div>
          <div className="absolute bottom-0 left-1.5 w-1 h-2 bg-orange-300 rounded"></div>
          <div className="absolute bottom-0 right-1 w-1 h-2 bg-orange-300 rounded"></div>
        </motion.div>
      </motion.div>

      {/* Chick 3 */}
      <motion.div 
        className="absolute bottom-12 right-36"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.7, duration: 0.4 }}
      >
        <motion.div 
          className="relative w-5 h-4 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-full"
          animate={{ y: [0, -1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-full">
            <div className="absolute top-1 left-1.5 w-1 h-1 bg-black rounded-full"></div>
            <div className="absolute top-1.5 right-0 w-1 h-1 bg-orange-400 rounded-full"></div>
          </div>
          <div className="absolute bottom-0 left-1.5 w-1 h-2 bg-orange-300 rounded"></div>
          <div className="absolute bottom-0 right-1 w-1 h-2 bg-orange-300 rounded"></div>
        </motion.div>
      </motion.div>

      {/* Small scattered feed grains for realism */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-yellow-600 rounded-full"
          style={{
            bottom: `${16 + Math.random() * 12}px`,
            left: `${15 + Math.random() * 70}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.8 + i * 0.1, duration: 0.3 }}
        />
      ))}
    </motion.div>
  );
};

export default AnimatedFarm;
