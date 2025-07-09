import { motion } from 'framer-motion';

/**
 * AnimatedCoin - A welcome animation component featuring a spinning Euro coin
 * Used to welcome new users to the expense tracking application
 */
export const AnimatedCoin = () => (
  <motion.div 
    className="relative w-full h-48 overflow-hidden bg-gradient-to-b from-blue-100 to-yellow-100 rounded-2xl border-2 border-gray-200 shadow-lg"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8, type: "spring" }}
  >
    {/* Ground/Surface */}
    <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-gray-200 to-gray-100 rounded-b-2xl"></div>
    
    {/* Main spinning Euro coin */}
    <motion.div
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: [0, -10, 0], // Gentle floating motion
      }}
      transition={{
        opacity: { duration: 0.8, delay: 0.5 },
        scale: { duration: 0.8, delay: 0.5, type: "spring" },
        y: { 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        }
      }}
      style={{ zIndex: 100 }}
    >
      {/* The spinning coin with 3D effect */}
      <motion.div
        className="relative w-24 h-24"
        animate={{
          rotateY: [0, 360], // Continuous spinning
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
          delay: 1
        }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Euro side (€) */}
        <motion.div
          className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full border-4 border-yellow-600 shadow-2xl flex items-center justify-center"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(0deg)",
          }}
        >
          <span className="text-4xl font-bold text-yellow-800">€</span>
          {/* Coin edge details */}
          <div className="absolute inset-2 border border-yellow-700 rounded-full opacity-30"></div>
          <div className="absolute inset-4 border border-yellow-700 rounded-full opacity-20"></div>
        </motion.div>

        {/* Chicken side */}
        <motion.div
          className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full border-4 border-yellow-600 shadow-2xl flex items-center justify-center"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Simplified chicken icon */}
          <div className="relative">
            {/* Chicken body */}
            <div className="w-12 h-8 bg-gradient-to-br from-amber-800 to-amber-900 rounded-full"></div>
            
            {/* Chicken head */}
            <div className="absolute -top-3 left-2 w-6 h-6 bg-gradient-to-br from-amber-700 to-amber-800 rounded-full"></div>
            
            {/* Comb */}
            <div className="absolute -top-5 left-3 w-4 h-2 bg-gradient-to-t from-red-500 to-red-400 rounded-t-full"></div>
            
            {/* Beak */}
            <div className="absolute -top-2 left-1 w-2 h-1 bg-yellow-400 rounded-full"></div>
            
            {/* Eye */}
            <div className="absolute -top-2 left-3 w-1 h-1 bg-white rounded-full">
              <div className="absolute top-0 left-0 w-0.5 h-0.5 bg-black rounded-full"></div>
            </div>
            
            {/* Wing */}
            <div className="absolute top-1 left-7 w-3 h-4 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full transform rotate-12"></div>
            
            {/* Tail */}
            <div className="absolute top-0 left-10 w-2 h-3 bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-full transform rotate-45"></div>
            
            {/* Wattle */}
            <div className="absolute -top-1 left-0.5 w-1.5 h-1.5 bg-gradient-to-b from-red-400 to-red-500 rounded-full"></div>
          </div>
          
          {/* Coin edge details */}
          <div className="absolute inset-2 border border-yellow-700 rounded-full opacity-30"></div>
          <div className="absolute inset-4 border border-yellow-700 rounded-full opacity-20"></div>
        </motion.div>
      </motion.div>
    </motion.div>

    {/* Scattered smaller coins around */}
    <motion.div className="absolute inset-0">
      {Array.from({ length: 6 }, (_, i) => (
        <motion.div
          key={`small-coin-${i}`}
          className="absolute w-8 h-8 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full border-2 border-yellow-500 shadow-lg flex items-center justify-center"
          style={{
            top: `${20 + Math.random() * 60}%`,
            left: `${10 + Math.random() * 80}%`,
          }}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{ 
            opacity: 0.7, 
            scale: 1,
            rotate: 360,
          }}
          transition={{ 
            duration: 0.8,
            delay: 1.5 + (i * 0.2),
            type: "spring",
            rotate: {
              duration: 4 + i,
              repeat: Infinity,
              ease: "linear"
            }
          }}
        >
          <span className="text-xs font-bold text-yellow-800">
            {i % 2 === 0 ? '€' : '🐔'}
          </span>
        </motion.div>
      ))}
    </motion.div>

    {/* Coin flip sound effect indicator */}
    <motion.div
      className="absolute top-8 left-1/2 transform -translate-x-1/2"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 0],
        scale: [0, 1.2, 0],
      }}
      transition={{
        duration: 0.6,
        repeat: Infinity,
        repeatDelay: 1.4,
        delay: 1
      }}
    >
      <div className="text-2xl">✨</div>
    </motion.div>

    {/* Welcome message bubble */}
    <motion.div
      className="absolute top-3 left-3 bg-white rounded-lg px-2 py-1 shadow-lg text-xs font-medium text-gray-700"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.2 }}
    >
      "Track every Euro and cent! 🐔💰"
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
        € Expense tracking
      </span>
    </motion.div>
  </motion.div>
);
