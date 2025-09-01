import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

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

interface BenefitData {
  id: string;
  icon: string;
  title: string;
  description: string;
}

// Custom hook for intersection observer
const useInViewAnimation = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
};

// Check for reduced motion preference
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
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

const benefits: BenefitData[] = [
  {
    id: 'real-time-cost',
    icon: '📊',
    title: 'Real-time Cost Per Egg',
    description: 'See your actual costs update instantly as you log feed purchases - no more guessing if you\'re saving money.'
  },
  {
    id: 'performance-alerts',
    icon: '⚠️',
    title: 'Performance Alerts',
    description: 'Get notified before problems become expensive - spot production drops and cost spikes early.'
  },
  {
    id: 'timeline-intelligence',
    icon: '📅',
    title: 'Timeline Intelligence',
    description: 'Understand your flock\'s lifecycle with insights that suggest what to watch for at each stage.'
  }
];

const features: FeatureCardData[] = [
  {
    id: 'egg-tracking',
    icon: '🥚',
    title: 'Smart Egg Tracking',
    description: 'Daily logging with automatic calculations showing eggs per hen, cost per egg, and productivity trends that matter.',
    animationSrc: '/animated/egg-counter-demo.png'
  },
  {
    id: 'feed-intelligence',
    icon: '💰',
    title: 'Feed Cost Intelligence',
    description: 'Connect feed purchases to production for real-time cost analysis that shows if you\'re saving money.',
    animationSrc: '/animated/cost-calculator.png'
  },
  {
    id: 'performance-alerts',
    icon: '📊',
    title: 'Performance Alerts',
    description: 'Automatic notifications when production drops or costs spike - spot problems before they get expensive.',
    animationSrc: '/animated/alert-system.png'
  },
  {
    id: 'flock-management',
    icon: '🐔',
    title: 'Flock Management',
    description: 'Track individual birds or batches with health notes and timeline events that affect performance.'
  },
  {
    id: 'insights-dashboard',
    icon: '📈',
    title: 'Insights Dashboard',
    description: 'Clean, visual metrics showing cost per egg, productivity trends, and spending patterns.'
  },
  {
    id: 'export-backup',
    icon: '📋',
    title: 'Export & Backup',
    description: 'Get your data out when needed for taxes, sharing, or peace of mind that you\'re not locked in.'
  }
];

const statistics: StatisticData[] = [
  {
    id: 'time-reduction',
    value: '85%',
    label: 'Reduction in tracking time'
  },
  {
    id: 'savings',
    value: '$23',
    label: 'Average monthly savings identified'
  },
  {
    id: 'confidence',
    value: '92%',
    label: 'Feel more confident about their flock'
  }
];

const testimonials: TestimonialData[] = [
  {
    id: 'sarah-m',
    name: 'Sarah M.',
    role: 'Urban Homesteader',
    rating: 5,
    message: 'Finally know if my chickens are actually saving me money! The cost per egg tracker is a game-changer.'
  },
  {
    id: 'mike-t',
    name: 'Mike T.',
    role: 'Suburban Dad',
    rating: 5,
    message: 'The performance alerts saved me from a costly feed issue. Caught the problem before I lost weeks of production.'
  },
  {
    id: 'jennifer-l',
    name: 'Jennifer L.',
    role: 'Family Farm',
    rating: 5,
    message: 'Simple enough for my kids to help with, detailed enough to actually be useful. Perfect balance.'
  }
];

const pricingPlans: PricingPlanData[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      'Basic egg and feed tracking',
      'Cost per egg calculations',
      'Simple productivity charts',
      'Data export'
    ],
    buttonText: 'Get Started Free',
    buttonVariant: 'secondary'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 25,
    period: '/month',
    popular: true,
    features: [
      'Everything in Free',
      'Performance alerts & notifications',
      'Advanced cost analysis',
      'Timeline-based insights',
      'Community predator alerts',
      'Priority support'
    ],
    buttonText: 'Start 30-Day Free Trial',
    buttonVariant: 'primary'
  }
];

// Main Component
export const LandingPage: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useInViewAnimation();
  const problemsRef = useInViewAnimation();
  const solutionRef = useInViewAnimation();
  const featuresRef = useInViewAnimation();
  const socialProofRef = useInViewAnimation();
  const pricingRef = useInViewAnimation();
  const finalCtaRef = useInViewAnimation();

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
    // Placeholder for trial signup
    console.log('Start trial clicked');
  };

  const handleGetStartedFree = () => {
    // Placeholder for free signup
    console.log('Get started free clicked');
  };

  const handleSeeHowItWorks = () => {
    // Placeholder for demo
    console.log('See how it works clicked');
  };

  return (
    <div className="w-full bg-gray-50 font-fraunces">
      <style>{`
        body, html {
          overflow-x: hidden;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%) rotate(45deg); }
          50% { transform: translateX(100%) rotate(45deg); }
          100% { transform: translateX(-100%) rotate(45deg); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .shiny-cta {
          background: linear-gradient(135deg, #4F39F6, #7C3AED);
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .shiny-cta:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 24px rgba(79, 57, 246, 0.3);
        }
        
        .shiny-cta::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shine 2s infinite;
          pointer-events: none;
        }
      `}</style>
      
      {/* Hero Section */}
      <motion.section 
        ref={heroRef.ref}
        initial="hidden"
        animate={heroRef.inView ? "visible" : "hidden"}
        variants={fadeInUpVariants}
        className="relative py-20 lg:py-32 xl:py-40 bg-gray-50"
      >
        {/* Enhanced animated background elements */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {/* Corner gradient 1 */}
          <div 
            className="absolute pointer-events-none"
            style={{
              top: '-25%',
              right: '-15%',
              width: '35%',
              height: '30%',
              background: 'radial-gradient(circle, #4F39F6 0%, #191656 70%)',
              filter: 'blur(60px)',
              opacity: 0.3
            }}
          />
          {/* Corner gradient 2 */}
          <div 
            className="absolute pointer-events-none"
            style={{
              bottom: '-20%',
              left: '-10%',
              width: '30%',
              height: '25%',
              background: 'radial-gradient(circle, #8833D7 0%, #2A2580 70%)',
              filter: 'blur(50px)',
              opacity: 0.2
            }}
          />
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
          <div className="text-center lg:text-left lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div>
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight mb-6"
                variants={fadeInUpVariants}
              >
                Turn chicken chaos into{' '}
                <span className="text-purple-600 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  crystal-clear insights
                </span>
              </motion.h1>
              <motion.p 
                className="text-lg text-gray-600 mb-8 leading-relaxed"
                variants={fadeInUpVariants}
              >
                See exactly what's working with your chickens - connect egg counts, 
                feed costs, and flock health into insights that show you're succeeding
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                variants={fadeInUpVariants}
              >
                <button 
                  className="shiny-cta overflow-hidden px-8 py-4 text-white rounded-xl font-semibold text-base transform transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
                  onClick={handleGetStartedFree}
                  aria-label="Start tracking your chickens for free"
                >
                  Start Tracking Free
                </button>
                <button 
                  className="px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-600 hover:text-white hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300"
                  onClick={handleSeeHowItWorks}
                  aria-label="View demonstration of how the app works"
                >
                  See How It Works
                </button>
              </motion.div>
            </div>
            <div className="mt-12 lg:mt-0">
              <img 
                src={prefersReducedMotion ? "/static/dashboard-preview.png" : "/animated/hero-dashboard.png"}
                alt="Chicken Manager dashboard showing egg production insights and cost analysis"
                className="rounded-2xl shadow-2xl w-full"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Problem Statement Section */}
      <motion.section 
        ref={problemsRef.ref}
        initial="hidden"
        animate={problemsRef.inView ? "visible" : "hidden"}
        variants={staggerChildrenVariants}
        className="py-20 bg-white"
      >
        <div className="container mx-auto px-6">
          <motion.div variants={fadeInUpVariants} className="text-center mb-16">
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

      {/* Solution Preview Section */}
      <motion.section 
        ref={solutionRef.ref}
        initial="hidden"
        animate={solutionRef.inView ? "visible" : "hidden"}
        variants={fadeInUpVariants}
        className="py-20 bg-gray-50"
      >
        <div className="container mx-auto px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                One Smart System That Actually{' '}
                <span className="text-purple-600">Tells You What's Happening</span>
              </h2>

              <div className="space-y-6 mb-8">
                {benefits.map((benefit) => (
                  <motion.div 
                    key={benefit.id}
                    variants={fadeInUpVariants}
                    className="flex items-start gap-4"
                  >
                    <div className="text-2xl" aria-hidden="true">{benefit.icon}</div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div variants={fadeInUpVariants}>
              <img 
                src={prefersReducedMotion ? "/static/dashboard-full-preview.png" : "/animated/dashboard-full-preview.png"}
                alt="Complete dashboard showing egg tracking, cost analysis, and flock insights"
                className="rounded-2xl shadow-2xl w-full"
                loading="lazy"
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Grid Section */}
      <motion.section 
        ref={featuresRef.ref}
        initial="hidden"
        animate={featuresRef.inView ? "visible" : "hidden"}
        variants={staggerChildrenVariants}
        className="py-20 bg-white"
      >
        <div className="container mx-auto px-6">
          <motion.div variants={fadeInUpVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools that replace notebooks with intelligent insights
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.id}
                variants={fadeInUpVariants}
                className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl p-6 group cursor-pointer relative shadow-lg hover:shadow-xl transition-all duration-300"
                style={{animationDelay: `${index * 0.1}s`}}
                whileHover={{ scale: 1.05, y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="text-3xl mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" aria-hidden="true">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800 group-hover:text-purple-700 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4 group-hover:text-gray-700 transition-colors duration-300">
                    {feature.description}
                  </p>
                  {feature.animationSrc && (
                    <div className="relative overflow-hidden rounded-lg">
                      <img 
                        src={feature.animationSrc}
                        alt={`${feature.title} demonstration`}
                        className="mt-4 rounded-lg w-full opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Social Proof Section */}
      <motion.section 
        ref={socialProofRef.ref}
        initial="hidden"
        animate={socialProofRef.inView ? "visible" : "hidden"}
        variants={staggerChildrenVariants}
        className="py-20 bg-purple-50"
      >
        <div className="container mx-auto px-6">
          <motion.div variants={fadeInUpVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Trusted by 4,000+ Chicken Keepers
            </h2>
            <p className="text-lg text-gray-600">
              Join successful chicken keepers who replaced chaos with confidence
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
        ref={pricingRef.ref}
        initial="hidden"
        animate={pricingRef.inView ? "visible" : "hidden"}
        variants={staggerChildrenVariants}
        className="py-20 bg-white"
      >
        <div className="container mx-auto px-6">
          <motion.div variants={fadeInUpVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Choose Your Plan
            </h2>
            <p className="text-lg text-gray-600">
              Start free, upgrade when you need advanced insights
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div 
                key={plan.id}
                variants={fadeInUpVariants}
                className={`bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center relative group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 ${
                  plan.popular ? 'border-2 border-purple-600 shadow-2xl' : ''
                }`}
                style={{animationDelay: `${index * 0.2}s`}}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {plan.popular && (
                  <>
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      <span className="flex items-center gap-1">
                        <span>⭐</span>
                        Most Popular
                      </span>
                    </div>
                    {/* Subtle glow effect for popular plan */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </>
                )}
                
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
                        ? 'shiny-cta overflow-hidden w-full px-6 py-4 text-white rounded-xl font-semibold transform transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300'
                        : 'w-full py-4 px-6 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-600 hover:text-white hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300'
                    }
                    onClick={plan.buttonVariant === 'primary' ? handleStartTrial : handleGetStartedFree}
                    aria-label={`${plan.buttonText} for ${plan.name} plan`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeInUpVariants} className="text-center mt-8 text-gray-600">
            <p>30-day free trial • No credit card required • Cancel anytime</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Final CTA Section */}
      <motion.section 
        ref={finalCtaRef.ref}
        initial="hidden"
        animate={finalCtaRef.inView ? "visible" : "hidden"}
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
            Ready to Succeed at Chicken Keeping?
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 opacity-90 max-w-2xl mx-auto"
            variants={fadeInUpVariants}
          >
            Join thousands of chicken keepers who replaced guesswork with confidence. 
            Start your free trial today and see what your flock can really do.
          </motion.p>

          <motion.button 
            className="bg-white text-purple-600 px-10 py-5 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-white/20 focus:outline-none focus:ring-4 focus:ring-white/30"
            onClick={handleStartTrial}
            aria-label="Start your free trial to begin tracking chickens"
            variants={fadeInUpVariants}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center gap-2">
              Start Your Free Trial
              <span className="text-2xl">🚀</span>
            </span>
          </motion.button>

          <motion.div 
            className="mt-6 text-purple-200"
            variants={fadeInUpVariants}
          >
            <p className="flex items-center justify-center gap-2 text-sm">
              <span>⭐</span>
              No credit card required
              <span>•</span>
              Cancel anytime
              <span>•</span>
              30-day free trial
              <span>⭐</span>
            </p>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};