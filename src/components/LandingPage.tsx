import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LandingNavbar } from './LandingNavbar';

// Import critical CSS modules
import '../styles/critical/landing-hero.css';
import '../styles/components/landing-components.css';

// TypeScript Interfaces
interface TestimonialData {
  id: string;
  name: string;
  role: string;
  rating: number;
  message: string;
}

interface FeatureCardData {
  id: string;
  icon: string;
  title: string;
  description: string;
  animationSrc?: string;
}

interface PricingPlanData {
  id: string;
  name: string;
  price: number;
  period?: string;
  popular?: boolean;
  features: string[];
  buttonText: string;
  buttonVariant: 'primary' | 'secondary';
}

interface StatisticData {
  id: string;
  value: string;
  label: string;
}

interface ProblemData {
  id: string;
  icon: string;
  title: string;
  description: string;
}



// Optimized device detection with lazy initialization
const useDeviceType = () => {
  const [isMobile, setIsMobile] = useState(() => {
    // Only check on client-side to avoid hydration mismatch
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  
  useEffect(() => {
    // Defer resize listener setup to avoid blocking initial render
    const timeoutId = setTimeout(() => {
      const checkDevice = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      window.addEventListener('resize', checkDevice, { passive: true });
      return () => window.removeEventListener('resize', checkDevice);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  return isMobile;
};

// Optimized reduced motion detection with lazy initialization
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // Initialize immediately to avoid animation flicker
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });
  
  useEffect(() => {
    // Defer media query listener to not block initial render
    const timeoutId = setTimeout(() => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handler = () => setPrefersReducedMotion(mediaQuery.matches);
      
      mediaQuery.addEventListener('change', handler, { passive: true });
      return () => mediaQuery.removeEventListener('change', handler);
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  return prefersReducedMotion;
};

// Component Data
const problems: ProblemData[] = [
  {
    id: 'scattered-notes',
    icon: '📝',
    title: 'Scattered Notes & Lost Receipts',
    description: 'Spiral notebooks get soggy, phone notes disappear, and you\'re left with incomplete pictures of your flock\'s performance.'
  },
  {
    id: 'flying-blind',
    icon: '💰',
    title: 'Flying Blind on Costs',
    description: 'No idea if feed expenses are eating all your egg savings or if you\'re actually profitable.'
  },
  {
    id: 'guessing-problems',
    icon: '🥚',
    title: 'Guessing at Problems',
    description: 'Can\'t tell if low production means sick birds, bad feed, or just normal seasonal changes.'
  }
];


// Helper function to get responsive image source (moved outside component to avoid recreating)
const getResponsiveImageSrc = (baseName: string, isMobile: boolean, _prefersReducedMotion: boolean, imageIndex?: number) => {
  // Available screenshots mapping with multiple versions
  const availableScreenshots = {
    'dashboard': { desktop: true, mobile: true, hasMultiple: false },
    'egg tracking': { desktop: true, mobile: true, hasMultiple: true, mobileCount: 2 },
    'flock': { desktop: true, mobile: true, hasMultiple: true, mobileCount: 2 },
    'crm': { desktop: true, mobile: true, hasMultiple: false },
    'feed': { desktop: true, mobile: true, hasMultiple: true, mobileCount: 2 },
    'savings': { desktop: true, mobile: true, hasMultiple: false },
    'expenses': { desktop: true, mobile: true, hasMultiple: true, mobileCount: 2 }
  };
  
  const screenshots = availableScreenshots[baseName as keyof typeof availableScreenshots];
  if (!screenshots) return `/screenshots/dashboard ${isMobile ? 'mobile' : 'desktop'}.webp`;
  
  // If requesting mobile and mobile exists, use mobile
  if (isMobile && screenshots.mobile) {
    if (screenshots.hasMultiple && typeof imageIndex === 'number' && imageIndex > 0) {
      return `/screenshots/${baseName} ${imageIndex + 1} mobile.webp`;
    }
    return `/screenshots/${baseName} mobile.webp`;
  }
  
  // If requesting desktop and desktop exists, use desktop
  if (!isMobile && screenshots.desktop) {
    return `/screenshots/${baseName} desktop.webp`;
  }
  
  // Fallback logic: if requesting desktop but only mobile exists, use mobile
  if (!isMobile && !screenshots.desktop && screenshots.mobile) {
    return `/screenshots/${baseName} mobile.webp`;
  }
  
  // Final fallback to dashboard
  return `/screenshots/dashboard ${isMobile ? 'mobile' : 'desktop'}.webp`;
};

// Helper function to get all images for a feature (moved outside component to avoid recreating)
const getFeatureImages = (baseName: string, isMobile: boolean, prefersReducedMotion: boolean) => {
  const availableScreenshots: Record<string, { desktop: boolean; mobile: boolean; hasMultiple: boolean; mobileCount?: number }> = {
    'dashboard': { desktop: true, mobile: true, hasMultiple: false },
    'egg tracking': { desktop: true, mobile: true, hasMultiple: true, mobileCount: 2 },
    'flock': { desktop: true, mobile: true, hasMultiple: true, mobileCount: 2 },
    'crm': { desktop: true, mobile: true, hasMultiple: false },
    'feed': { desktop: true, mobile: true, hasMultiple: true, mobileCount: 2 },
    'savings': { desktop: true, mobile: true, hasMultiple: false },
    'expenses': { desktop: true, mobile: true, hasMultiple: true, mobileCount: 2 }
  };
  
  const screenshots = availableScreenshots[baseName];
  if (!screenshots) return [getResponsiveImageSrc('dashboard', isMobile, prefersReducedMotion)];
  
  if (isMobile && screenshots.hasMultiple && screenshots.mobileCount) {
    const images: string[] = [];
    const count = screenshots.mobileCount;
    for (let i = 0; i < count; i++) {
      images.push(getResponsiveImageSrc(baseName, isMobile, prefersReducedMotion, i));
    }
    return images;
  }
  
  return [getResponsiveImageSrc(baseName, isMobile, prefersReducedMotion)];
};

interface FeatureWithBadges extends FeatureCardData {
  badges: string[];
}

const features: FeatureWithBadges[] = [
  {
    id: 'egg-tracking',
    icon: '🥚',
    title: 'Daily Egg Production',
    description: 'Log daily egg counts with automatic calculations for productivity trends, cost per egg, and weekly/monthly comparisons.',
    animationSrc: 'egg tracking',
    badges: ['Daily Logging', 'Cost Per Egg', 'Productivity Trends']
  },
  {
    id: 'expense-tracking',
    icon: '💰',
    title: 'Expense Tracking',
    description: 'Record farm expenses by category (feed, equipment, veterinary, etc.) to understand your true operational costs.',
    animationSrc: 'expenses',
    badges: ['8 Categories', 'Visual Charts', 'Cost Analysis']
  },
  {
    id: 'customer-management',
    icon: '👥',
    title: 'Sales & Customers',
    description: 'Track egg sales, manage customer information, and monitor revenue with detailed sales history and analytics.',
    animationSrc: 'crm',
    badges: ['Sales Tracking', 'Customer Database', 'Revenue Analytics']
  },
  {
    id: 'flock-management',
    icon: '🐔',
    title: 'Flock Management',
    description: 'Organize birds into batches, track breed information, acquisition dates, and monitor flock health events.',
    animationSrc: 'flock',
    badges: ['Batch Organization', 'Breed Tracking', 'Health Events']
  },
  {
    id: 'feed-management',
    icon: '🌾',
    title: 'Feed Cost Calculator',
    description: 'Calculate feed costs per dozen eggs and per hen to optimize your feeding strategy and budget planning.',
    animationSrc: 'feed',
    badges: ['Cost Calculations', 'Per Dozen Analysis', 'Budget Planning']
  },
  {
    id: 'savings-insights',
    icon: '💎',
    title: 'Financial Insights',
    description: 'Visualize your egg value, revenue, and savings with interactive charts and goal tracking for financial success.',
    animationSrc: 'savings',
    badges: ['Revenue Tracking', 'Savings Goals', 'Interactive Charts']
  }
];

const statistics: StatisticData[] = [
  {
    id: 'chicken-approval',
    value: '100%',
    label: 'Chicken approval rating'
  },
  {
    id: 'bawks-per-day',
    value: '247',
    label: 'Happy bawks per day'
  },
  {
    id: 'ego-boost',
    value: '∞',
    label: 'Rooster ego boost level'
  }
];

const testimonials: TestimonialData[] = [
  {
    id: 'henrietta',
    name: 'Henrietta',
    role: 'Head of Laying Operations',
    rating: 5,
    message: 'BAWK! Finally, my human knows exactly how fabulous I am at laying eggs. Five stars! 🥚✨'
  },
  {
    id: 'rooster-bob',
    name: 'Rooster Bob',
    role: 'Chief Ego Officer',
    rating: 5,
    message: 'This app makes my ladies look so productive, I take all the credit. COCK-A-DOODLE-APPROVED! 🐓'
  },
  {
    id: 'clucky',
    name: 'Clucky',
    role: 'Professional Freeloader',
    rating: 5,
    message: 'My human used to worry about feed costs. Now they just spoil me more! Smart app, happy tummy! 🌾'
  }
];

const pricingPlans: PricingPlanData[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      'Egg Tracking tab only',
      'Basic egg count logging',
      'Simple daily records',
      'Limited data storage'
    ],
    buttonText: 'Start with Free',
    buttonVariant: 'secondary'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 5,
    period: '/month',
    popular: true,
    features: [
      'All tabs unlocked',
      'Complete flock management',
      'Expense & revenue tracking', 
      'Customer relationship management',
      'Feed cost calculator',
      'Savings insights & analytics',
      'Data export & backups'
    ],
    buttonText: 'Upgrade to Pro',
    buttonVariant: 'primary'
  }
];

// Main Component
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useDeviceType();

  // Lazy-initialized modal state for fullscreen images
  const [fullscreenImage, setFullscreenImage] = useState<{
    src: string;
    alt: string;
    title: string;
  } | null>(null);

  // Lazy-initialized swiper state for features with multiple images
  const [currentImageIndex, setCurrentImageIndex] = useState<{[key: string]: number}>({});
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  // Handle keyboard events for modal (deferred to avoid blocking initial render)
  useEffect(() => {
    if (!fullscreenImage) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFullscreenImage(null);
      }
    };

    // Defer event listener attachment to not block initial render
    const timeoutId = setTimeout(() => {
      document.addEventListener('keydown', handleKeyDown, { passive: false });
      document.body.classList.add('modal-open');
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('modal-open');
    };
  }, [fullscreenImage]);

  const openFullscreen = (src: string, alt: string, title: string) => {
    setFullscreenImage({ src, alt, title });
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
  };

  const nextImage = (featureId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [featureId]: ((prev[featureId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (featureId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [featureId]: ((prev[featureId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  const setImageIndex = (featureId: string, index: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [featureId]: index
    }));
  };

  // Animation variants
  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.6,
        ease: 'easeOut'
      }
    }
  };

  const staggerChildrenVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.3,
        staggerChildren: prefersReducedMotion ? 0 : 0.1
      }
    }
  };

  const handleStartTrial = () => {
    // Disabled for now
  };

  const handleGetStartedFree = () => {
    // Disabled for now
  };

  const handleSeeHowItWorks = () => {
    // Disabled for now
  };

  // Load non-critical animations asynchronously after initial paint
  useEffect(() => {
    // Skip animation loading if user prefers reduced motion
    if (prefersReducedMotion) return;
    
    // Load animations CSS after LCP to avoid render blocking
    const loadAnimations = async () => {
      await import('../styles/animations/landing-animations.css');
    };
    
    // Defer until after initial paint and layout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadAnimations, { timeout: 2000 });
    } else {
      // Delay longer to ensure LCP has occurred
      setTimeout(loadAnimations, 300);
    }
  }, [prefersReducedMotion]);

  return (
    <div className="w-full bg-gray-50 font-fraunces">
      
      {/* Navigation */}
      <LandingNavbar />
      
      {/* Hero Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={fadeInUpVariants}
        className="relative py-10 lg:py-16 xl:py-20 bg-gray-50"
        style={{ paddingTop: '6rem' }}
      >
        {/* Enhanced animated background elements */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {/* Corner gradient 1 */}
          <div className="hero-gradient-1" />
          {/* Corner gradient 2 */}
          <div className="hero-gradient-2" />
          {!prefersReducedMotion && (
            <>
              <div className="absolute top-1/4 right-1/4 w-32 h-32 text-6xl opacity-10 animate-float">
                🐔
              </div>
              <div className="absolute top-1/3 left-1/6 w-24 h-24 text-5xl opacity-8 animate-float" style={{animationDelay: '1s'}}>
                🥚
              </div>
              <div className="absolute bottom-1/4 right-1/6 w-28 h-28 text-5xl opacity-8 animate-float" style={{animationDelay: '2s'}}>
                🌾
              </div>
            </>
          )}
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Centered Headline and Subtitle */}
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight mb-6"
              variants={fadeInUpVariants}
            >
              Turn Chicken Chaos
              <br />
              into{' '}
              <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                Crystal-Clear Insights
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto"
              variants={fadeInUpVariants}
            >
              See exactly what's working with your chickens - connect egg counts, 
              feed costs, and flock health into insights that show you're succeeding
            </motion.p>

            {/* Centered Image with Video Play Button */}
            <motion.div 
              className="mb-12 mx-[10%] relative group cursor-pointer"
              variants={fadeInUpVariants}
              onClick={handleSeeHowItWorks}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <img 
                src={getResponsiveImageSrc('dashboard', isMobile, prefersReducedMotion)}
                alt="Chicken Manager dashboard showing egg production insights and cost analysis - Click to watch demo video"
                className="rounded-2xl shadow-2xl w-full mx-auto transition-all duration-300 group-hover:shadow-3xl"
                fetchPriority="high"
                decoding="async"
              />
              
              {/* Video Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div 
                  className="bg-white bg-opacity-90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl group-hover:bg-opacity-100 transition-all duration-300 group-hover:scale-110 pointer-events-auto"
                  style={{
                    width: 'clamp(5rem, 6vw, 6rem)',
                    height: 'clamp(5rem, 6vw, 6rem)',
                    minWidth: '5rem',
                    minHeight: '5rem'
                  }}
                >
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      width: 'clamp(4rem, 5vw, 5rem)',
                      height: 'clamp(4rem, 5vw, 5rem)',
                      minWidth: '4rem',
                      minHeight: '4rem'
                    }}
                  >
                    <svg 
                      className="text-white ml-1" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                      style={{
                        width: 'clamp(2rem, 2.5vw, 2.5rem)',
                        height: 'clamp(2rem, 2.5vw, 2.5rem)',
                        minWidth: '2rem',
                        minHeight: '2rem'
                      }}
                    >
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Video hint text */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V4a2 2 0 012-2z" />
                  </svg>
                  Watch Demo Video
                </span>
              </div>
              
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-purple-600/10 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>
              
              {/* Hand-drawn scribbled arrow pointing from headline to image */}
              <div className="absolute -top-16 md:-top-20 left-1/2 md:left-3/4 transform -translate-x-1/2 md:-translate-x-1/4 pointer-events-none">
                <svg 
                  width="100" 
                  height="80" 
                  viewBox="0 0 100 80" 
                  fill="none" 
                  className="text-purple-600 opacity-80"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                >
                  <path 
                    d="M50 5c-2 8-1 16 3 22c2 4 5 7 6 12c1 3 1 6 0 9c-1 4-3 7-3 11c0 2 1 4 2 6c1 1 2 2 3 2c1 0 1-1 1-2c-1-3-2-6-2-9c0-2 1-4 2-5m-2 8c-2 2-2 5-1 8c1 2 4 3 6 2"
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    fill="none"
                    style={{
                      strokeDasharray: '4,3',
                      animation: prefersReducedMotion ? 'none' : 'drawArrow 3s ease-in-out infinite'
                    }}
                  />
                  <text 
                    x="15" 
                    y="15" 
                    className="fill-purple-600 text-xs font-medium"
                    style={{ fontFamily: 'Comic Sans MS, cursive, sans-serif' }}
                  >
                    See it in action!
                  </text>
                </svg>
              </div>
            </motion.div>

            {/* Centered Button Below Image */}
            <motion.div 
              className="flex justify-center"
              variants={fadeInUpVariants}
            >
              <button 
                className="bg-gray-400 overflow-hidden px-8 py-4 text-white rounded-xl font-semibold text-base cursor-not-allowed transition-all duration-300 focus:outline-none"
                onClick={handleSeeHowItWorks}
                disabled
                aria-label="Demo video - Coming Soon"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Watch 2-Minute Demo
                </span>
              </button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Problem Statement Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerChildrenVariants}
        className="py-10 bg-white"
      >
        <div className="container mx-auto px-6">
          <motion.div variants={fadeInUpVariants} className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Stop Flying Blind with Your Flock
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Chicken keepers are drowning in paper chaos and missing critical insights about their flock's performance
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {problems.map((problem, index) => (
              <motion.div 
                key={problem.id}
                variants={fadeInUpVariants}
                className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
                style={{animationDelay: `${index * 0.1}s`}}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="text-4xl mb-4 group-hover:animate-bounce transition-all duration-300" aria-hidden="true">
                  {problem.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800 group-hover:text-purple-700 transition-colors duration-300">
                  {problem.title}
                </h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  {problem.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Who is it for Section */}
      <motion.section 
        className="py-10 bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-50 relative overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={staggerChildrenVariants}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-10 left-10 w-32 h-32 bg-purple-200/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-indigo-200/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-violet-200/20 rounded-full blur-2xl animate-float" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div variants={fadeInUpVariants} className="text-center mb-10">
            <div className="inline-block mb-4">
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent text-lg font-semibold tracking-wide">
                FIND YOUR FIT
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Who is this{' '}
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                perfect for?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From backyard hobbyists to egg entrepreneurs - we've designed features for every chicken keeper's journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-7xl mx-4 md:mx-[5%]">
            {/* Hobby/Family Focus */}
            <motion.div 
              variants={fadeInUpVariants}
              className="relative group"
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Glowing background effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-all duration-500"></div>
              
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl group-hover:shadow-2xl transition-all duration-500 border border-white/50">
                {/* Header with large icon */}
                <div className="text-center mb-6 md:mb-8">
                  <div className="inline-block p-4 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-5xl">🏠</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">
                    Family & Hobby
                  </h3>
                  <div className="w-20 h-1 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Perfect for backyard enthusiasts who want to:
                  </p>
                </div>
                
                <div className="space-y-4 mb-8">
                  {[
                    { icon: "🥚", text: "Feed your family fresh, healthy eggs" },
                    { icon: "🤝", text: "Share extras with neighbors and friends" },
                    { icon: "💰", text: "Earn pocket money from occasional sales" },
                    { icon: "🧘", text: "Enjoy the therapeutic hobby of chicken keeping" },
                    { icon: "💚", text: "Save money vs expensive organic store eggs" }
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-xl bg-purple-50/50 hover:bg-purple-50 transition-colors duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-gray-700 font-medium">{item.text}</span>
                    </motion.div>
                  ))}
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200/50">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">📊</span>
                    <p className="font-semibold text-gray-900">Your Savings Dashboard:</p>
                  </div>
                  <p className="text-gray-600">Track money saved vs buying organic store eggs - see your real household cost benefits!</p>
                </div>
              </div>
            </motion.div>

            {/* Business/Profit Focus */}
            <motion.div 
              variants={fadeInUpVariants}
              className="relative group"
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Glowing background effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-violet-400 to-purple-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-all duration-500"></div>
              
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl group-hover:shadow-2xl transition-all duration-500 border border-white/50">
                {/* Header with large icon */}
                <div className="text-center mb-6 md:mb-8">
                  <div className="inline-block p-4 bg-gradient-to-br from-violet-100 to-purple-200 rounded-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-5xl">💼</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">
                    Business & Profit
                  </h3>
                  <div className="w-20 h-1 bg-gradient-to-r from-violet-400 to-purple-600 rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Great for aspiring entrepreneurs who want to:
                  </p>
                </div>
                
                <div className="space-y-4 mb-8">
                  {[
                    { icon: "📈", text: "Generate consistent income from egg sales" },
                    { icon: "🤝", text: "Build customer relationships and local brand" },
                    { icon: "🚀", text: "Scale operation for maximum profitability" },
                    { icon: "📊", text: "Track real business metrics and cash flow" }
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-xl bg-violet-50/50 hover:bg-violet-50 transition-colors duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-gray-700 font-medium">{item.text}</span>
                    </motion.div>
                  ))}
                </div>
                
                <div className="bg-gradient-to-r from-violet-50 to-purple-100 rounded-2xl p-6 border border-violet-200/50">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">💰</span>
                    <p className="font-semibold text-gray-900">Your Revenue Dashboard:</p>
                  </div>
                  <p className="text-gray-600">Monitor actual revenue vs expenses - perfect for tracking business profitability and growth!</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom CTA */}
          <motion.div 
            variants={fadeInUpVariants}
            className="text-center mt-16"
          >
            <p className="text-lg text-gray-600 mb-6">
              Ready to see which path fits your chicken keeping goals?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <span className="text-2xl animate-bounce">👇</span>
              <p className="text-purple-600 font-semibold">Check out our features below!</p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced Features Showcase Section */}
      <motion.section 
        id="features"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerChildrenVariants}
        className="py-10 bg-gradient-to-br from-gray-50 to-white"
      >
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <motion.div variants={fadeInUpVariants} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-6 mx-6">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-8">
              Comprehensive tools that replace scattered notebooks with intelligent, 
              actionable insights for your chicken operation
            </p>
          </motion.div>

          {/* Features showcase with alternating layout */}
          <div className="space-y-16 md:space-y-32">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.id}
                variants={fadeInUpVariants}
                className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
                style={{animationDelay: `${index * 0.2}s`}}
              >
                {/* Content Side */}
                <div className={`space-y-4 md:space-y-6 px-4 md:px-6 lg:px-8 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                    <div className="text-4xl md:text-5xl p-3 md:p-4 bg-purple-100 rounded-xl md:rounded-2xl shadow-lg hover:scale-110 transition-transform duration-300" aria-hidden="true">
                      {feature.icon}
                    </div>
                    <div className="w-8 md:w-12 h-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"></div>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                    {feature.title}
                  </h3>
                  
                  <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Feature-specific badges */}
                  <div className="flex flex-wrap gap-2 md:gap-3 mt-4 md:mt-6">
                    {feature.badges.map((badge, badgeIndex) => (
                      <span 
                        key={badgeIndex}
                        className="px-3 md:px-4 py-1.5 md:py-2 bg-purple-50 text-purple-700 rounded-full text-xs md:text-sm font-medium border border-purple-200 hover:bg-purple-100 transition-colors duration-200"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Screenshot Side */}
                <div className={`${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                  {feature.animationSrc && (() => {
                    const images = getFeatureImages(feature.animationSrc, isMobile, prefersReducedMotion);
                    const currentIndex = currentImageIndex[feature.id] || 0;
                    const hasMultipleImages = images.length > 1;
                    
                    return (
                      <div 
                        className="relative group cursor-pointer"
                        onMouseEnter={() => setHoveredFeature(feature.id)}
                        onMouseLeave={() => setHoveredFeature(null)}
                        onClick={() => openFullscreen(
                          images[currentIndex],
                          `${feature.title} demonstration`,
                          feature.title
                        )}
                      >
                        {/* Background decorative elements */}
                        <div className="absolute -inset-4 bg-gradient-to-br from-purple-200/30 to-purple-400/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                        
                        {/* Main image container */}
                        <div className="relative bg-white/80 backdrop-blur-sm border border-white/40 rounded-3xl p-4 shadow-2xl group-hover:shadow-3xl transition-all duration-500 image-navigation-container">
                          <div className="relative overflow-hidden rounded-2xl">
                            <img 
                              src={images[currentIndex]}
                              alt={`${feature.title} demonstration ${hasMultipleImages ? `(${currentIndex + 1}/${images.length})` : ''}`}
                              className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105"
                              loading="lazy"
                            />
                            
                            {/* Overlay effects */}
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            {/* Swiper navigation for multiple images */}
                            {hasMultipleImages && (
                              <>
                                {/* Previous button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    prevImage(feature.id, images.length);
                                  }}
                                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center transition-all duration-200 z-20 shadow-lg hover:shadow-xl hover:scale-110 ${
                                    hoveredFeature === feature.id ? 'opacity-100' : 'opacity-20 hover:opacity-100'
                                  }`}
                                  aria-label="Previous image"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                  </svg>
                                </button>

                                {/* Next button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    nextImage(feature.id, images.length);
                                  }}
                                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center transition-all duration-200 z-20 shadow-lg hover:shadow-xl hover:scale-110 ${
                                    hoveredFeature === feature.id ? 'opacity-100' : 'opacity-20 hover:opacity-100'
                                  }`}
                                  aria-label="Next image"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>

                                {/* Image counter */}
                                <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs font-medium">
                                  {currentIndex + 1}/{images.length}
                                </div>

                                {/* Hover hint for navigation */}
                                <div className={`absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs font-medium transition-opacity duration-200 ${
                                  hoveredFeature === feature.id ? 'opacity-100' : 'opacity-40'
                                }`}>
                                  ← →
                                </div>

                                {/* Dots indicator */}
                                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 opacity-70 group-hover:opacity-100 transition-opacity duration-200">
                                  {images.map((_, dotIndex) => (
                                    <button
                                      key={dotIndex}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setImageIndex(feature.id, dotIndex);
                                      }}
                                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                        dotIndex === currentIndex 
                                          ? 'bg-white' 
                                          : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                                      }`}
                                      aria-label={`View image ${dotIndex + 1}`}
                                    />
                                  ))}
                                </div>
                              </>
                            )}
                            
                            {/* Click to expand icon */}
                            <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                              </svg>
                            </div>
                          </div>
                          
                          {/* Device frame effect for mobile screenshots */}
                          {isMobile && (
                            <div className="absolute -inset-2 border-2 border-gray-300 rounded-3xl opacity-20 pointer-events-none"></div>
                          )}
                        </div>

                        {/* Floating feature badge */}
                        <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-95 transition-all duration-300">
                          {hasMultipleImages ? `${currentIndex + 1}/${images.length} - Click to Expand` : 'Click to Expand'}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </motion.section>

      {/* Social Proof Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerChildrenVariants}
        className="py-10 bg-purple-50 mx-[5%]"
      >
        <div className="container mx-auto px-6">
          <motion.div variants={fadeInUpVariants} className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Trusted by 25 Chickens
            </h2>
            <p className="text-lg text-gray-600">
              Even the chickens approve of this app (we asked them personally)
            </p>
          </motion.div>

          {/* Statistics */}
          <motion.div variants={fadeInUpVariants} className="grid md:grid-cols-3 gap-8 mb-16">
            {statistics.map((stat) => (
              <div key={stat.id} className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={testimonial.id}
                variants={fadeInUpVariants}
                className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl p-6 group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
                style={{animationDelay: `${index * 0.1}s`}}
                whileHover={{ scale: 1.02, y: -3 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="flex mb-4" aria-label={`${testimonial.rating} star rating`}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span 
                      key={i} 
                      className="text-yellow-400 text-lg group-hover:animate-pulse group-hover:scale-110 transition-all duration-300" 
                      style={{animationDelay: `${i * 100}ms`}}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 text-lg leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                  "{testimonial.message}"
                </p>
                <div className="text-sm text-gray-600 font-medium group-hover:text-purple-700 transition-colors duration-300">
                  <div className="flex items-center gap-2">
                    <span className="text-base">👤</span>
                    <span>{testimonial.name}, {testimonial.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section 
        id="pricing"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerChildrenVariants}
        className="py-10 bg-white"
      >
        <div className="container mx-auto px-6">
          <motion.div variants={fadeInUpVariants} className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Choose Your Plan
            </h2>
            <p className="text-lg text-gray-600">
              Start free, upgrade when you need advanced insights
            </p>
          </motion.div>

          <div className="max-w-4xl grid md:grid-cols-2 gap-8 mx-[5%]">
            {pricingPlans.map((plan, index) => (
              <motion.div 
                key={plan.id}
                variants={fadeInUpVariants}
                className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center relative group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
                style={{animationDelay: `${index * 0.2}s`}}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Corner badges with user intent */}
                <div className="absolute -top-3 -right-3 transform rotate-12">
                  <div className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-lg ${
                    plan.id === 'free' 
                      ? 'bg-green-100 text-green-700 border border-green-300' 
                      : 'bg-purple-100 text-purple-700 border border-purple-300'
                  }`}>
                    {plan.id === 'free' ? 'I just wanna track eggs' : 'How much am I really spending?'}
                  </div>
                </div>

                
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-800 transition-colors duration-300">
                    {plan.name}
                  </h3>
                  <div className="text-5xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                    ${plan.price}
                  </div>
                  {plan.period && (
                    <div className="text-gray-600 mb-6">{plan.period}</div>
                  )}
                  
                  <ul className="text-left space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li 
                        key={featureIndex} 
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (index * 0.2) + (featureIndex * 0.1) }}
                      >
                        <span className="text-green-500 text-lg font-bold">✓</span>
                        <span className="group-hover:text-gray-800 transition-colors duration-300">
                          {feature}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                  
                  <button 
                    className={
                      plan.buttonVariant === 'primary' 
                        ? 'bg-gray-400 overflow-hidden w-full px-6 py-4 text-white rounded-xl font-semibold cursor-not-allowed transition-all duration-300 focus:outline-none'
                        : 'w-full py-4 px-6 border-2 border-gray-400 text-gray-400 rounded-xl font-semibold cursor-not-allowed transition-all duration-300 focus:outline-none'
                    }
                    onClick={plan.buttonVariant === 'primary' ? handleStartTrial : handleGetStartedFree}
                    disabled
                    aria-label={`${plan.buttonText} for ${plan.name} plan - Coming Soon`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeInUpVariants} className="text-center mt-8 text-gray-600">
            <p>No credit card required for Free plan • Cancel Pro anytime</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Final CTA Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={fadeInUpVariants}
        className="relative py-20 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white text-center"
      >
        {/* Enhanced background elements */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-300/10 rounded-full blur-2xl" />
          {!prefersReducedMotion && (
            <>
              <div className="absolute top-10 left-10 text-4xl opacity-10 animate-float">🥚</div>
              <div className="absolute top-20 right-20 text-3xl opacity-10 animate-float" style={{animationDelay: '1s'}}>🐔</div>
              <div className="absolute bottom-10 left-1/4 text-3xl opacity-10 animate-float" style={{animationDelay: '2s'}}>🌾</div>
            </>
          )}
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            variants={fadeInUpVariants}
          >
            🐔 A Message from Your Chickens
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 opacity-90 max-w-2xl mx-4 md:mx-16 lg:mx-[10%]"
            variants={fadeInUpVariants}
          >
            "BAWK BAWK! We've been working hard laying eggs, and frankly, we're tired of you not knowing how awesome we are. 
            This app will finally give us the recognition we deserve! Start tracking so we can show off our productivity stats to the neighbor's chickens. 
            Trust us, we're worth it." 🥚✨
          </motion.p>

          <motion.button 
            className="bg-gray-400 text-white px-10 py-5 rounded-xl font-bold text-lg cursor-not-allowed transition-all duration-300 shadow-2xl focus:outline-none"
            onClick={handleGetStartedFree}
            disabled
            aria-label="Coming Soon - Chickens are still being onboarded"
            variants={fadeInUpVariants}
          >
            <span className="flex items-center gap-2">
              Yes, My Chickens Deserve Recognition! 
              <span className="text-2xl">🐓</span>
            </span>
          </motion.button>

          <motion.div 
            className="mt-6 text-purple-200"
            variants={fadeInUpVariants}
          >
            <p className="flex items-center justify-center gap-2 text-sm">
              <span>🥚</span>
              No credit card required
              <span>•</span>
              Make your chickens famous
              <span>•</span>
              Cancel anytime (but why would you?)
              <span>🐔</span>
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={closeFullscreen}
        >
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 z-10 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              aria-label="Close fullscreen image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image container */}
            <div 
              className="relative max-w-full max-h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                src={fullscreenImage.src}
                alt={fullscreenImage.alt}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
              
              {/* Image title */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded-full text-sm font-medium">
                {fullscreenImage.title}
              </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-4 text-white text-sm opacity-70">
              Press ESC to close or click outside
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};