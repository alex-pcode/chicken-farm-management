"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  name: string;
  link: string;
}

interface LandingNavbarProps {
  className?: string;
}

export const LandingNavbar = ({ className = '' }: LandingNavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const navItems: NavItem[] = [
    {
      name: "Features",
      link: "#features",
    },
    {
      name: "Pricing",
      link: "#pricing",
    },
    {
      name: "Cost Calculator",
      link: "/costs",
    },
  ];

  // Scroll detection with RAF throttle
  useEffect(() => {
    let rafId = 0;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.min(scrollY / scrollHeight, 1);

        setIsScrolled(scrollY > 50);
        setScrollProgress(progress);
        rafId = 0;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const handleNavClick = (link: string) => {
    setIsMobileMenuOpen(false);
    
    if (link.startsWith('#')) {
      const element = document.querySelector(link);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (link.startsWith('/')) {
      // Navigate to internal page
      window.location.href = link;
    }
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans ${className}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        background: isScrolled 
          ? 'rgba(255, 255, 255, 0.95)' 
          : 'rgba(255, 255, 255, 0.80)',
        backdropFilter: 'blur(12px)',
        borderBottom: isScrolled 
          ? '1px solid rgba(229, 231, 235, 0.8)' 
          : '1px solid rgba(229, 231, 235, 0.3)',
        boxShadow: isScrolled 
          ? '0 4px 20px rgba(0, 0, 0, 0.1)' 
          : '0 2px 10px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
        style={{ 
          width: `${scrollProgress * 100}%`,
          opacity: isScrolled ? 1 : 0
        }}
        transition={{ duration: 0.2 }}
      />
      
      <motion.div 
        className="mx-auto px-4 sm:px-6 transition-all duration-300"
        animate={{
          maxWidth: isScrolled ? '1200px' : '1280px',
          paddingLeft: isScrolled ? '1.5rem' : '1rem',
          paddingRight: isScrolled ? '1.5rem' : '1rem',
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <motion.div 
          className="flex justify-between items-center transition-all duration-300"
          animate={{
            height: isScrolled ? '3.5rem' : '4rem'
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Logo */}
          <motion.div 
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <a href="/" className="flex items-center space-x-2">
              <motion.div 
                className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center transition-all duration-300"
                animate={{
                  width: isScrolled ? '2rem' : '2.25rem',
                  height: isScrolled ? '2rem' : '2.25rem'
                }}
                whileHover={{ rotate: 10 }}
                transition={{ duration: 0.2 }}
              >
                <span className={`text-white font-bold transition-all duration-300 ${
                  isScrolled ? 'text-xs' : 'text-sm'
                }`}>🐔</span>
              </motion.div>
              <motion.span
                className="font-sans font-bold text-gray-900 transition-all duration-300"
                animate={{
                  fontSize: isScrolled ? '1.125rem' : '1.25rem'
                }}
              >
                ChickenCare
              </motion.span>
            </a>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <motion.div 
              className="ml-10 flex items-baseline space-x-1"
              animate={{
                gap: isScrolled ? '0.25rem' : '1rem'
              }}
              transition={{ duration: 0.3 }}
            >
              {navItems.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.link}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.link);
                  }}
                  className={`text-gray-600 hover:text-purple-600 rounded-md font-semibold transition-all duration-200 relative group ${
                    isScrolled ? 'px-2 py-1 text-sm' : 'px-3 py-2 text-sm'
                  }`}
                  whileHover={{ 
                    scale: 1.05,
                    color: '#7c3aed'
                  }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: index * 0.1,
                    duration: 0.3
                  }}
                >
                  {item.name}
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Desktop Buttons */}
          <motion.div 
            className="hidden md:flex items-center"
            animate={{
              gap: isScrolled ? '0.75rem' : '1rem'
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.button
              onClick={() => window.location.href = '/app'}
              className={`text-gray-600 hover:text-purple-600 font-semibold transition-all duration-200 ${
                isScrolled ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-sm'
              }`}
              whileHover={{ 
                scale: 1.05,
                color: '#7c3aed'
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              Login
            </motion.button>
            <motion.button
              onClick={() => {/* Disabled for now */}}
              disabled
              className={`bg-gray-400 text-white rounded-lg font-semibold cursor-not-allowed transition-all duration-200 shadow-md ${
                isScrolled ? 'px-4 py-1.5 text-sm' : 'px-6 py-2 text-sm'
              }`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              Get Started
            </motion.button>
          </motion.div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`inline-flex items-center justify-center rounded-md text-gray-600 hover:text-purple-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 transition-all duration-200 ${
                isScrolled ? 'p-1.5' : 'p-2'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <motion.div 
                className="relative w-6 h-6 flex flex-col justify-center items-center"
                animate={{
                  width: isScrolled ? '1.25rem' : '1.5rem',
                  height: isScrolled ? '1.25rem' : '1.5rem'
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.span
                  className="absolute block h-0.5 bg-current rounded-full"
                  animate={{
                    rotate: isMobileMenuOpen ? 45 : 0,
                    y: isMobileMenuOpen ? 0 : -6,
                    width: isScrolled ? '1.25rem' : '1.5rem'
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />
                <motion.span
                  className="absolute block h-0.5 bg-current rounded-full"
                  animate={{
                    opacity: isMobileMenuOpen ? 0 : 1,
                    width: isScrolled ? '1.25rem' : '1.5rem'
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />
                <motion.span
                  className="absolute block h-0.5 bg-current rounded-full"
                  animate={{
                    rotate: isMobileMenuOpen ? -45 : 0,
                    y: isMobileMenuOpen ? 0 : 6,
                    width: isScrolled ? '1.25rem' : '1.5rem'
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden bg-white border-t border-gray-200 shadow-lg"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.link}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.link);
                  }}
                  className="text-gray-600 hover:text-purple-600 block px-3 py-2 rounded-md text-base font-semibold transition-colors duration-200"
                >
                  {item.name}
                </a>
              ))}
              
              {/* Mobile buttons */}
              <div className="pt-4 pb-3 border-t border-gray-200 space-y-3">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    window.location.href = '/app';
                  }}
                  className="w-full text-left text-gray-600 hover:text-purple-600 block px-3 py-2 rounded-md text-base font-semibold transition-colors duration-200"
                >
                  Login
                </button>
                <button
                  onClick={() => {/* Disabled for now */}}
                  disabled
                  className="w-full bg-gray-400 text-white px-3 py-2 rounded-lg text-base font-semibold cursor-not-allowed transition-all duration-200 shadow-md"
                >
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};