import { motion } from 'framer-motion';
import { getStandardAnimationClasses } from '../utils/animationUtils';

/**
 * AnimatedHen - A welcome animation component featuring a hen sitting on a pyramid of eggs
 * Used to welcome new users to the egg tracking application
 * Enhanced with realistic hen animations: wing flapping, head bobbing, breathing, and blinking
 */
export const AnimatedHen = () => (
  <motion.div 
    className={getStandardAnimationClasses()}
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8, type: "spring" }}
  >
    {/* Ground/Nest */}
    <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-yellow-200 to-yellow-100 rounded-b-2xl"></div>
    
    {/* Small pyramid of eggs */}
    <motion.div
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
    >
      {/* Top row - 1 egg */}
      <div className="flex items-end mb-0.5">
        <motion.div
          className="w-3 h-4 bg-gradient-to-b from-yellow-100 to-yellow-200 rounded-full border border-yellow-300 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            rotate: Math.random() * 15 - 7.5,
          }}
          transition={{ 
            duration: 0.5,
            delay: 1.6,
            type: "spring"
          }}
        />
      </div>
      
      {/* Middle row - 3 eggs */}
      <div className="flex items-end mb-0.5">
        {Array.from({ length: 3 }, (_, i) => (
          <motion.div
            key={`middle-${i}`}
            className="w-3 h-4 bg-gradient-to-b from-yellow-100 to-yellow-200 rounded-full border border-yellow-300 shadow-sm mx-0.5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              rotate: Math.random() * 15 - 7.5,
            }}
            transition={{ 
              duration: 0.5,
              delay: 1.2 + (i * 0.08),
              type: "spring"
            }}
          />
        ))}
      </div>

      {/* Bottom row - 5 eggs */}
      <div className="flex items-end">
        {Array.from({ length: 5 }, (_, i) => (
          <motion.div
            key={`bottom-${i}`}
            className="w-3 h-4 bg-gradient-to-b from-yellow-100 to-yellow-200 rounded-full border border-yellow-300 shadow-sm mx-0.5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              rotate: Math.random() * 15 - 7.5,
            }}
            transition={{ 
              duration: 0.5,
              delay: 0.8 + (i * 0.08),
              type: "spring"
            }}
          />
        ))}
      </div>
    </motion.div>

    {/* Hen sitting on top of egg pyramid */}
    <motion.div
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      animate={{
        y: -35, // Much higher up on the pyramid
        rotate: [-1, 1, -1], // Gentle wobble
      }}
      transition={{
        y: { duration: 1.5, type: "spring", delay: 1.8 },
        rotate: { 
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
      style={{ zIndex: 100 }}
    >
      {/* Hen body */}
      <div className="relative">
        {/* Main body with breathing animation */}
        <motion.div 
          className="w-16 h-12 bg-gradient-to-br from-amber-800 to-amber-900 rounded-full shadow-lg"
          animate={{
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        
        {/* Head with bobbing animation */}
        <motion.div 
          className="absolute -top-4 left-2 w-8 h-8 bg-gradient-to-br from-amber-700 to-amber-800 rounded-full shadow-md"
          animate={{
            rotate: [-2, 2, -2],
            y: [0, -1, 0],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        
        {/* Comb */}
        <motion.div 
          className="absolute -top-6 left-3 w-6 h-3 bg-gradient-to-t from-red-500 to-red-400 rounded-t-full shadow-sm"
          animate={{
            rotate: [-1, 1, -1],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        
        {/* Beak */}
        <motion.div 
          className="absolute -top-2 left-1 w-2 h-1 bg-yellow-400 rounded-full"
          animate={{
            rotate: [-2, 2, -2],
            y: [0, -1, 0],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        
        {/* Eye with blinking */}
        <motion.div 
          className="absolute -top-3 left-4 w-1.5 h-1.5 bg-white rounded-full"
          animate={{
            rotate: [-2, 2, -2],
            y: [0, -1, 0],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <motion.div 
            className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-black rounded-full"
            animate={{
              scaleY: [1, 0.1, 1],
            }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut"
            }}
          ></motion.div>
        </motion.div>
        
        {/* Wattle */}
        <motion.div 
          className="absolute -top-1 left-0.5 w-2 h-2 bg-gradient-to-b from-red-400 to-red-500 rounded-full"
          animate={{
            rotate: [-3, 3, -3],
            y: [0, -1, 0],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        
        {/* Wing with flapping animation */}
        <motion.div 
          className="absolute top-2 left-8 w-6 h-8 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full shadow-md"
          style={{ transformOrigin: "20% 30%" }}
          animate={{
            rotate: [12, 25, 12],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        
        {/* Tail feathers with swaying */}
        <motion.div 
          className="absolute top-0 left-12 w-4 h-6 bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-full shadow-sm"
          style={{ transformOrigin: "50% 100%" }}
          animate={{
            rotate: [45, 55, 45],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        
        {/* Feet dangling down */}
        <motion.div
          className="absolute top-10 left-6 flex space-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <div className="w-1 h-3 bg-orange-400 rounded-full"></div>
          <div className="w-1 h-3 bg-orange-400 rounded-full"></div>
        </motion.div>
      </div>
    </motion.div>

    {/* Welcome message bubble */}
    <motion.div
      className="absolute top-3 left-3 bg-white rounded-lg px-2 py-1 shadow-lg text-xs font-medium text-gray-700"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.2 }}
    >
      "Welcome! Start logging your eggs! 🥚"
      <div className="absolute bottom-0 left-4 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-white"></div>
    </motion.div>

    {/* Small info badge */}
    <motion.div
      className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg border border-gray-200"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
    >
      <span className="text-xs font-bold text-gray-800">
        🥚 Get started
      </span>
    </motion.div>
  </motion.div>
);
