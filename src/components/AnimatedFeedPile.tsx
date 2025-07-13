import React from 'react';
import { motion } from 'framer-motion';
import { getFeedTrackerAnimationClasses } from '../utils/animationUtils';

/**
 * AnimatedFeedPile - A welcome animation component featuring a pile of grains that gets smaller
 * as more chickens appear and consume the feed
 * Used to welcome users to the feed tracking application
 */
const AnimatedFeedPile: React.FC = () => {
  return (
    <motion.div 
      className={getFeedTrackerAnimationClasses()}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, type: "spring" }}
    >
      {/* Sun */}
      <motion.div 
        className="absolute top-4 right-4 w-8 h-8 bg-yellow-400 rounded-full shadow-lg"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="absolute inset-1 bg-yellow-300 rounded-full animate-pulse"></div>
      </motion.div>
      
      {/* Clouds */}
      <motion.div 
        className="absolute top-6 left-8 w-12 h-6 bg-white rounded-full opacity-80"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 0.8 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <div className="absolute -left-1 top-0 w-4 h-4 bg-white rounded-full"></div>
        <div className="absolute -right-1 top-0 w-4 h-4 bg-white rounded-full"></div>
      </motion.div>
      
      {/* Ground/Grass */}
      <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-green-400 to-green-300 rounded-b-2xl"></div>
      
      {/* Feed Pile - Center, gets progressively smaller - SVG Mound Shape */}
      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        {/* Ground patch under pile for contrast */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-gradient-to-t from-yellow-200 to-yellow-100 rounded-full opacity-60"></div>
        
        {/* SVG Feed Pile */}
        <motion.svg
          width="200"
          height="100"
          viewBox="0 0 200 100"
          className="absolute bottom-[-2.5rem] left-1/2 transform -translate-x-1/2"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
        >
          <defs>
            <linearGradient id="feedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" /> {/* yellow-400 */}
              <stop offset="50%" stopColor="#F59E0B" /> {/* amber-500 */}
              <stop offset="100%" stopColor="#D97706" /> {/* amber-600 */}
            </linearGradient>
          </defs>
          <motion.path
            fill="url(#feedGradient)"
            stroke="#B45309" /* amber-700 */
            strokeWidth="1.5"
            animate={{ 
              d: [
                "M10,95 C40,95 30,20 100,20 C170,20 160,95 190,95 Z", // Initial large pile
                "M25,95 C50,95 50,45 100,45 C150,45 150,95 175,95 Z", // smaller
                "M45,95 C65,95 70,65 100,65 C130,65 135,95 155,95 Z", // even smaller
                "M65,95 C75,95 80,80 100,80 C120,80 125,95 135,95 Z", // tiny
                "M85,95 C90,95 95,92 100,92 C105,92 110,95 115,95 Z"  // almost gone
              ]
            }}
            transition={{ 
              delay: 2, 
              duration: 7.5, // Total duration for the shrink animation
              times: [0, 0.2, 0.5, 0.8, 1], // Corresponds to the delays of the chickens appearing
              ease: "easeInOut"
            }}
          />
        </motion.svg>
        
        {/* Individual grain details scattered on the mound - adjusted for SVG */}
        <motion.div
          className="absolute bottom-6 left-[48%] w-2 h-2 bg-orange-600 rounded-full border border-orange-800 shadow-sm"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 2.5, duration: 0.5 }}
        />
        <motion.div
          className="absolute bottom-8 left-[52%] w-2 h-2 bg-orange-700 rounded-full border border-orange-900 shadow-sm"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 3, duration: 0.5 }}
        />
        <motion.div
          className="absolute bottom-7 left-[45%] w-2 h-2 bg-yellow-700 rounded-full border border-yellow-900 shadow-sm"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 4, duration: 0.5 }}
        />
        <motion.div
          className="absolute bottom-9 left-[55%] w-2 h-2 bg-orange-500 rounded-full border border-orange-700 shadow-sm"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 4.5, duration: 0.5 }}
        />
        <motion.div
          className="absolute bottom-5 left-[50%] w-2 h-2 bg-yellow-600 rounded-full border border-yellow-800 shadow-sm"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 5, duration: 0.5 }}
        />
        <motion.div
          className="absolute bottom-10 left-[49%] w-1.5 h-1.5 bg-orange-400 rounded-full border border-orange-600 shadow-sm"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 7, duration: 0.5 }}
        />
        <motion.div
          className="absolute bottom-11 left-[51%] w-1 h-1 bg-yellow-500 rounded-full border border-yellow-700 shadow-sm"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 8.5, duration: 0.5 }}
        />
      </motion.div>
      
      {/* Chicken 1 - Appears first, starts consuming the huge pile */}
      <motion.div 
        className="absolute bottom-12 left-[30%] transform hover:scale-110 transition-transform duration-300"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <motion.div 
          className="relative"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2.3, repeat: Infinity, delay: 2 }}
        >
          {/* Pecking animation */}
          <motion.div
            animate={{ rotateZ: [0, 15, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            {/* Chicken Body */}
            <div className="w-4 h-5 bg-gradient-to-b from-white to-gray-100 rounded-full relative">
              {/* Chicken Head */}
              <div className="absolute -top-2 left-0.5 w-3 h-3 bg-white rounded-full">
                {/* Comb */}
                <div className="absolute -top-0.5 left-1 w-1 h-1 bg-red-500 rounded-t-full"></div>
                {/* Beak */}
                <div className="absolute top-1 -left-0.5 w-0.5 h-0.5 bg-orange-400 transform rotate-45"></div>
                {/* Eye */}
                <div className="absolute top-0.5 left-1 w-0.5 h-0.5 bg-black rounded-full"></div>
              </div>
              {/* Wings */}
              <div className="absolute top-0.5 -right-0.5 w-1.5 h-2 bg-gray-200 rounded-full transform rotate-12"></div>
            </div>
            {/* Chicken Legs */}
            <div className="absolute -bottom-0.5 left-0.5 w-0.5 h-1.5 bg-orange-400"></div>
            <div className="absolute -bottom-0.5 left-2 w-0.5 h-1.5 bg-orange-400"></div>
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Chicken 2 - Appears second, pile gets smaller */}
      <motion.div 
        className="absolute bottom-12 right-[30%] transform hover:scale-110 transition-transform duration-300"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 3, duration: 0.8 }}
      >
        <motion.div 
          className="relative"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2.7, repeat: Infinity, delay: 3.5 }}
        >
          <motion.div
            animate={{ rotateZ: [0, -12, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1.8 }}
          >
            {/* Chicken Body */}
            <div className="w-4 h-5 bg-gradient-to-b from-amber-100 to-amber-200 rounded-full relative">
              {/* Chicken Head */}
              <div className="absolute -top-2 left-0.5 w-3 h-3 bg-amber-100 rounded-full">
                {/* Comb */}
                <div className="absolute -top-0.5 left-1 w-1 h-1 bg-red-500 rounded-t-full"></div>
                {/* Beak */}
                <div className="absolute top-1 -left-0.5 w-0.5 h-0.5 bg-orange-400 transform rotate-45"></div>
                {/* Eye */}
                <div className="absolute top-0.5 left-1 w-0.5 h-0.5 bg-black rounded-full"></div>
              </div>
              {/* Wings */}
              <div className="absolute top-0.5 -right-0.5 w-1.5 h-2 bg-amber-300 rounded-full transform rotate-12"></div>
            </div>
            {/* Chicken Legs */}
            <div className="absolute -bottom-0.5 left-0.5 w-0.5 h-1.5 bg-orange-400"></div>
            <div className="absolute -bottom-0.5 left-2 w-0.5 h-1.5 bg-orange-400"></div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Chicken 3 - Appears third, medium pile consumption */}
      <motion.div 
        className="absolute bottom-12 left-[15%] transform hover:scale-110 transition-transform duration-300"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 5, duration: 0.8 }}
      >
        <motion.div 
          className="relative"
          animate={{ y: [0, -1.5, 0] }}
          transition={{ duration: 2.9, repeat: Infinity, delay: 5.5 }}
        >
          <motion.div
            animate={{ rotateZ: [0, 10, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 2.2 }}
          >
            {/* Chicken Body */}
            <div className="w-3.5 h-4.5 bg-gradient-to-b from-orange-100 to-orange-200 rounded-full relative">
              {/* Chicken Head */}
              <div className="absolute -top-2 left-0.5 w-2.5 h-2.5 bg-orange-100 rounded-full">
                {/* Comb */}
                <div className="absolute -top-0.5 left-0.5 w-1 h-1 bg-red-500 rounded-t-full"></div>
                {/* Beak */}
                <div className="absolute top-1 -left-0.5 w-0.5 h-0.5 bg-orange-400 transform rotate-45"></div>
                {/* Eye */}
                <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-black rounded-full"></div>
              </div>
              {/* Wings */}
              <div className="absolute top-0.5 -right-0.5 w-1 h-1.5 bg-orange-300 rounded-full transform rotate-12"></div>
            </div>
            {/* Chicken Legs */}
            <div className="absolute -bottom-0.5 left-0.5 w-0.5 h-1.5 bg-orange-400"></div>
            <div className="absolute -bottom-0.5 left-2 w-0.5 h-1.5 bg-orange-400"></div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Chicken 4 - Appears fourth, small pile consumption */}
      <motion.div 
        className="absolute bottom-12 right-[15%] transform hover:scale-110 transition-transform duration-300"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 7, duration: 0.8 }}
      >
        <motion.div 
          className="relative"
          animate={{ y: [0, -1.5, 0] }}
          transition={{ duration: 3.1, repeat: Infinity, delay: 7.5 }}
        >
          <motion.div
            animate={{ rotateZ: [0, -15, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1.5 }}
          >
            {/* Chicken Body */}
            <div className="w-3.5 h-4.5 bg-gradient-to-b from-gray-200 to-gray-300 rounded-full relative">
              {/* Chicken Head */}
              <div className="absolute -top-2 left-0.5 w-2.5 h-2.5 bg-gray-200 rounded-full">
                {/* Comb */}
                <div className="absolute -top-0.5 left-0.5 w-1 h-1 bg-red-500 rounded-t-full"></div>
                {/* Beak */}
                <div className="absolute top-1 -left-0.5 w-0.5 h-0.5 bg-orange-400 transform rotate-45"></div>
                {/* Eye */}
                <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-black rounded-full"></div>
              </div>
              {/* Wings */}
              <div className="absolute top-0.5 -right-0.5 w-1 h-1.5 bg-gray-400 rounded-full transform rotate-12"></div>
            </div>
            {/* Chicken Legs */}
            <div className="absolute -bottom-0.5 left-0.5 w-0.5 h-1.5 bg-orange-400"></div>
            <div className="absolute -bottom-0.5 left-2 w-0.5 h-1.5 bg-orange-400"></div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Chicken 5 - Appears last, finishes the tiny pile */}
      <motion.div 
        className="absolute bottom-12 left-[50%] transform -translate-x-1/2 hover:scale-110 transition-transform duration-300"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 8.5, duration: 0.8 }}
      >
        <motion.div 
          className="relative"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2.1, repeat: Infinity, delay: 9 }}
        >
          <motion.div
            animate={{ rotateZ: [0, 8, 0] }}
            transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 2.5 }}
          >
            {/* Chicken Body */}
            <div className="w-4 h-5 bg-gradient-to-b from-yellow-100 to-yellow-200 rounded-full relative">
              {/* Chicken Head */}
              <div className="absolute -top-2 left-0.5 w-3 h-3 bg-yellow-100 rounded-full">
                {/* Comb */}
                <div className="absolute -top-0.5 left-1 w-1 h-1 bg-red-500 rounded-t-full"></div>
                {/* Beak */}
                <div className="absolute top-1 -left-0.5 w-0.5 h-0.5 bg-orange-400 transform rotate-45"></div>
                {/* Eye */}
                <div className="absolute top-0.5 left-1 w-0.5 h-0.5 bg-black rounded-full"></div>
              </div>
              {/* Wings */}
              <div className="absolute top-0.5 -right-0.5 w-1.5 h-2 bg-yellow-300 rounded-full transform rotate-12"></div>
            </div>
            {/* Chicken Legs */}
            <div className="absolute -bottom-0.5 left-0.5 w-0.5 h-1.5 bg-orange-400"></div>
            <div className="absolute -bottom-0.5 left-2 w-0.5 h-1.5 bg-orange-400"></div>
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Scattered individual grains falling from pile */}
      <motion.div 
        className="absolute bottom-16 left-[48%] w-0.5 h-0.5 bg-yellow-600 rounded-full"
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: [0, 1, 0], y: [0, 20, 40] }}
        transition={{ delay: 3.2, duration: 1.5 }}
      />
      <motion.div 
        className="absolute bottom-16 left-[52%] w-0.5 h-0.5 bg-orange-600 rounded-full"
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: [0, 1, 0], y: [0, 25, 50] }}
        transition={{ delay: 5.3, duration: 1.5 }}
      />
      <motion.div 
        className="absolute bottom-16 left-[50%] w-0.5 h-0.5 bg-yellow-500 rounded-full"
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: [0, 1, 0], y: [0, 15, 30] }}
        transition={{ delay: 7.1, duration: 1.5 }}
      />
      
      {/* Welcome message bubble */}
      <motion.div
        className="absolute top-3 left-3 bg-white rounded-lg px-2 py-1 shadow-lg text-xs font-medium text-gray-700"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2 }}
      >
        "Track your feed inventory! 🌾🐔"
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
          🌾 Feed Tracker
        </span>
      </motion.div>
    </motion.div>
  );
};

export default AnimatedFeedPile;
