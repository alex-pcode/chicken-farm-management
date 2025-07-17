import { motion } from 'framer-motion';
import { getGoldAnimationClasses } from '../utils/animationUtils';

/**
 * AnimatedCoinPNG - A welcome animation component using PNG image
 * Used to welcome new users to the expense tracking application
 */
export const AnimatedCoinPNG = () => (
  <motion.div 
    className={getGoldAnimationClasses()}
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8, type: "spring" }}
  >
    {/* Enhanced ground/surface with subtle glow */}
    <div className="absolute bottom-0 w-full h-10 bg-gradient-to-t from-yellow-100 via-gray-100 to-transparent rounded-b-3xl shadow-inner"></div>
    
    {/* Subtle background glow */}
    <div className="absolute inset-0 bg-gradient-radial from-yellow-200/20 via-transparent to-transparent rounded-2xl"></div>
    
    {/* Main PNG chicken with coin */}
    <motion.div
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: [0, -8, 0], // Slightly more gentle floating motion
      }}
      transition={{
        opacity: { duration: 0.8, delay: 0.5 },
        scale: { duration: 0.8, delay: 0.5, type: "spring" },
        y: { 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        }
      }}
      style={{ zIndex: 100 }}
    >
      {/* PNG Image with gentle left-right rotation */}
      <motion.img
        src="/chicken-coin.png"
        alt="Chicken with coin - expense tracking"
        className="w-28 h-28 drop-shadow-2xl"
        initial={{ scale: 0.8, y: 20 }}
        animate={{
          scale: 1,
          y: 0,
          rotate: [-5, 5, -5], // Gentle left-right rotation to match other tabs
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
        style={{
          filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.4)) brightness(1.1) contrast(1.1)",
          imageRendering: "crisp-edges",
        }}
      />
    </motion.div>

    {/* Subtle sparkle effects (reduced) */}
    <motion.div className="absolute inset-0">
      {Array.from({ length: 3 }, (_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-3 h-3 text-yellow-400"
          style={{
            top: `${20 + Math.random() * 60}%`,
            left: `${10 + Math.random() * 80}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 0.6, 0], 
            scale: [0, 1, 0],
          }}
          transition={{ 
            duration: 2,
            delay: 2 + (i * 0.8),
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut"
          }}
        >
          ✨
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
      <div className="text-xl opacity-75">$</div>
    </motion.div>

    {/* Welcome message bubble */}
    <motion.div
      className="absolute top-3 left-3 bg-white rounded-lg px-2 py-1 shadow-lg text-xs font-medium text-gray-700"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.2 }}
    >
      "Track every dollar and cent! 🐔"
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
        $ Expense tracking
      </span>
    </motion.div>
  </motion.div>
);
