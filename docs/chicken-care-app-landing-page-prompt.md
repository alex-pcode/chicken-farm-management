# 🎨 Master AI Prompt: Chicken Care App Landing Page

*Comprehensive prompt for generating a professional, conversion-optimized landing page using AI tools like v0, Lovable.ai, or similar platforms*

---

## 📋 Project Context

Create a modern, mobile-first landing page for **"Chicken Care App"** - a web application that helps backyard chicken keepers track egg production, feed costs, and flock health. The target audience consists of tech-savvy urban homesteaders (28-42 years old) and suburban families who want to replace messy notebooks with intelligent insights about their chickens' performance.

### Core Value Proposition
**"Turn chicken chaos into crystal-clear insights"** - Connect egg counts, feed costs, and flock health into actionable data that shows chicken keepers they're not just keeping chickens, they're succeeding at it.

### Primary Problem Statement
Chicken keepers are drowning in paper chaos and flying blind on their flock's real performance. Scattered notebooks get soggy, receipts disappear, and there's no way to tell if they're actually saving money or spending it on an expensive hobby.

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4.x with custom design tokens
- **Animations**: Framer Motion
- **Deployment**: Vercel
- **Approach**: Mobile-first responsive design

---

## 🎨 Design System Requirements

### Color Palette
```css
/* Primary Brand Colors */
--primary-purple: #4F39F6;      /* Main brand color */
--secondary-purple: #2A2580;    /* Secondary elements */
--dark-purple: #191656;         /* Deep accents */
--light-purple: #6B5CE6;        /* Light accents */
--accent-purple: #8833D7;       /* Highlights */

/* Supporting Colors */
--success-green: #10B981;       /* Positive indicators */
--warning-orange: #F59E0B;      /* Attention items */
--error-red: #EF4444;           /* Errors/alerts */
--info-blue: #3B82F6;           /* Information */

/* Neutral Palette */
--background-light: #F9FAFB;    /* Main background */
--background-white: #FFFFFF;    /* Card backgrounds */
--text-primary: #111827;        /* Main text */
--text-secondary: #6B7280;      /* Secondary text */
--border: #E5E7EB;              /* Borders/dividers */
```

### Typography System
- **Font Family**: Fraunces (serif) for all text elements
- **Display Text**: 64px (mobile) / 80px (desktop), font-weight 700, line-height 1.1
- **Page Title**: 32px (mobile) / 40px (desktop), font-weight 600, line-height 1.25
- **Section Title**: 24px, font-weight 600, line-height 1.3
- **Body Text**: 16px, font-weight 400, line-height 1.6
- **Caption**: 12px, font-weight 500, line-height 1.4

### Visual Design Language

#### Glass Morphism Cards (Primary Pattern)
```css
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(243, 229, 215, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(243, 229, 215, 0.15);
}
```

#### Gradient Overlays
```css
.corner-gradient {
  position: absolute;
  top: -25%;
  right: -15%;
  width: 35%;
  height: 30%;
  background: radial-gradient(circle, #4F39F6 0%, #191656 70%);
  filter: blur(60px);
  opacity: 0.3;
}
```

#### Primary CTA Button
```css
.shiny-cta {
  background: linear-gradient(135deg, #4F39F6, #7C3AED);
  color: white;
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
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
  transform: rotate(45deg);
  animation: shine 2s infinite;
}
```

---

## 📱 Visual Enhancement with Animated PNGs

### Strategic Animation Placement

#### Hero Section Animations
- **Floating Eggs**: Gentle floating animation in background
- **Pulsing CTA**: Subtle pulse effect on primary button
- **Gradient Movement**: Soft movement in corner blur effects

#### Feature Demonstrations
- **Dashboard Preview**: Animated chart data updates
- **Egg Counter**: Numbers incrementing in real-time
- **Cost Calculator**: Live calculation animations

### Implementation Guidelines
```tsx
// Animated hero background element
<div className="relative overflow-hidden">
  <img 
    src="/animated/floating-eggs-bg.png" 
    alt="Floating eggs animation"
    className="absolute top-0 right-0 w-64 h-64 opacity-20 pointer-events-none"
    loading="lazy"
  />
</div>

// Animated dashboard preview with motion respect
<div className="relative">
  <img 
    src={prefersReducedMotion ? "/static/dashboard-preview.png" : "/animated/dashboard-live.png"}
    alt="Live dashboard preview showing real-time egg tracking"
    className="rounded-2xl shadow-2xl border border-purple-100 w-full max-w-2xl"
    loading="lazy"
  />
</div>

// Performance-optimized animation loading
<img 
  src="/animated/feature-demo.png"
  alt="Feature demonstration"
  loading="lazy"
  className="intersection-observer-animate"
  onLoad={(e) => {
    if (e.currentTarget.complete) {
      e.currentTarget.classList.add('loaded');
    }
  }}
/>
```

### Specific Animation Opportunities
1. **Egg Production Counter**: Rolling numbers showing daily counts
2. **Cost Savings Meter**: Dollar amounts incrementing to show savings
3. **Flock Health Indicators**: Color-coded status animations
4. **Chart Visualizations**: Data lines drawing themselves
5. **Mobile Interface**: Screen transitions between app sections
6. **Problem/Solution**: Paper notes transforming into digital insights

### Performance Best Practices
- Keep APNG files under 500KB each
- Use 15-30 frames with 2-3 second loops
- Implement lazy loading for below-the-fold content
- Respect `prefers-reduced-motion` accessibility setting
- Include fallback static images
- Use intersection observers to trigger animations when in viewport

---

## 🏗️ Detailed Step-by-Step Instructions

### 1. Hero Section (Mobile-First Layout)
Create a compelling above-the-fold section that immediately communicates value:

**Mobile Layout:**
- Full-width container with vertical centering
- Large headline: "Turn chicken chaos into crystal-clear insights"
- Supporting subheadline: "See exactly what's working with your chickens - connect egg counts, feed costs, and flock health into insights that show you're succeeding"
- Primary CTA: "Start Tracking Free" (shiny purple gradient)
- Secondary CTA: "See How It Works" (outline button)
- Background: Soft gradient with animated floating elements

**Desktop Enhancements:**
- Two-column layout: text left, visual/animation right
- Larger typography scaling
- More generous white space
- Enhanced hover effects on CTAs

```tsx
<section className="relative min-h-screen flex items-center justify-center bg-gray-50 overflow-hidden">
  {/* Animated background elements */}
  <div className="absolute inset-0">
    <div className="corner-gradient"></div>
    <img 
      src="/animated/floating-chickens.png" 
      alt=""
      className="absolute top-1/4 right-1/4 w-32 h-32 opacity-10 animate-float"
    />
  </div>
  
  <div className="container mx-auto px-6 lg:px-8 relative z-10">
    <div className="text-center lg:text-left lg:grid lg:grid-cols-2 lg:gap-12 items-center">
      <div>
        <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Turn chicken chaos into 
          <span className="text-purple-600"> crystal-clear insights</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          See exactly what's working with your chickens - connect egg counts, 
          feed costs, and flock health into insights that show you're succeeding
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="shiny-cta">Start Tracking Free</button>
          <button className="px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300">
            See How It Works
          </button>
        </div>
      </div>
      <div className="mt-12 lg:mt-0">
        <img 
          src="/animated/hero-dashboard.png" 
          alt="Chicken Manager dashboard showing egg production insights"
          className="rounded-2xl shadow-2xl"
        />
      </div>
    </div>
  </div>
</section>
```

### 2. Problem Statement Section
Address the core pain points with emotional resonance:

**Structure:**
- Compelling headline: "Stop Flying Blind with Your Flock"
- Three problem cards in glass morphism style
- Each card includes icon, headline, and description
- Mobile: stacked vertically, Desktop: 3-column grid

```tsx
<section className="py-20 bg-white">
  <div className="container mx-auto px-6">
    <div className="text-center mb-16">
      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
        Stop Flying Blind with Your Flock
      </h2>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Chicken keepers are drowning in paper chaos and missing critical insights about their flock's performance
      </p>
    </div>
    
    <div className="grid md:grid-cols-3 gap-8">
      <div className="glass-card text-center">
        <div className="text-4xl mb-4">📝</div>
        <h3 className="text-xl font-semibold mb-3">Scattered Notes & Lost Receipts</h3>
        <p className="text-gray-600">Spiral notebooks get soggy, phone notes disappear, and you're left with incomplete pictures of your flock's performance.</p>
      </div>
      
      <div className="glass-card text-center">
        <div className="text-4xl mb-4">💰</div>
        <h3 className="text-xl font-semibold mb-3">Flying Blind on Costs</h3>
        <p className="text-gray-600">No idea if feed expenses are eating all your egg savings or if you're actually profitable.</p>
      </div>
      
      <div className="glass-card text-center">
        <div className="text-4xl mb-4">🥚</div>
        <h3 className="text-xl font-semibold mb-3">Guessing at Problems</h3>
        <p className="text-gray-600">Can't tell if low production means sick birds, bad feed, or just normal seasonal changes.</p>
      </div>
    </div>
  </div>
</section>
```

### 3. Solution Preview Section
Showcase the app's intelligence with visual proof:

**Elements:**
- Compelling headline: "One Smart System That Actually Tells You What's Happening"
- Large dashboard mockup with animated data
- Three key benefit highlights
- Mobile: stacked layout, Desktop: side-by-side with image

```tsx
<section className="py-20 bg-gray-50">
  <div className="container mx-auto px-6">
    <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
      <div>
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
          One Smart System That Actually 
          <span className="text-purple-600">Tells You What's Happening</span>
        </h2>
        
        <div className="space-y-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="text-2xl">📊</div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Real-time Cost Per Egg</h3>
              <p className="text-gray-600">See your actual costs update instantly as you log feed purchases - no more guessing if you're saving money.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="text-2xl">⚠️</div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Performance Alerts</h3>
              <p className="text-gray-600">Get notified before problems become expensive - spot production drops and cost spikes early.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="text-2xl">📅</div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Timeline Intelligence</h3>
              <p className="text-gray-600">Understand your flock's lifecycle with insights that suggest what to watch for at each stage.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <img 
          src="/animated/dashboard-full-preview.png"
          alt="Complete dashboard showing egg tracking, cost analysis, and flock insights"
          className="rounded-2xl shadow-2xl w-full"
        />
      </div>
    </div>
  </div>
</section>
```

### 4. Features Grid
Detailed feature showcase with visual hierarchy:

**Layout:**
- Six main features in responsive grid
- Each feature card with icon, title, description
- Glass morphism styling with hover effects
- Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns

```tsx
<section className="py-20 bg-white">
  <div className="container mx-auto px-6">
    <div className="text-center mb-16">
      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
        Everything You Need to Succeed
      </h2>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Comprehensive tools that replace notebooks with intelligent insights
      </p>
    </div>
    
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Smart Egg Tracking */}
      <div className="glass-card group hover:scale-105 transition-all duration-300">
        <div className="text-3xl mb-4">🥚</div>
        <h3 className="text-xl font-semibold mb-3">Smart Egg Tracking</h3>
        <p className="text-gray-600">Daily logging with automatic calculations showing eggs per hen, cost per egg, and productivity trends that matter.</p>
        <img 
          src="/animated/egg-counter-demo.png" 
          alt="Egg tracking interface showing daily counts and trends"
          className="mt-4 rounded-lg w-full opacity-90"
        />
      </div>
      
      {/* Feed Cost Intelligence */}
      <div className="glass-card group hover:scale-105 transition-all duration-300">
        <div className="text-3xl mb-4">💰</div>
        <h3 className="text-xl font-semibold mb-3">Feed Cost Intelligence</h3>
        <p className="text-gray-600">Connect feed purchases to production for real-time cost analysis that shows if you're saving money.</p>
        <img 
          src="/animated/cost-calculator.png" 
          alt="Cost analysis showing feed expenses vs egg value"
          className="mt-4 rounded-lg w-full opacity-90"
        />
      </div>
      
      {/* Performance Alerts */}
      <div className="glass-card group hover:scale-105 transition-all duration-300">
        <div className="text-3xl mb-4">📊</div>
        <h3 className="text-xl font-semibold mb-3">Performance Alerts</h3>
        <p className="text-gray-600">Automatic notifications when production drops or costs spike - spot problems before they get expensive.</p>
        <img 
          src="/animated/alert-system.png" 
          alt="Alert notifications for production and cost changes"
          className="mt-4 rounded-lg w-full opacity-90"
        />
      </div>
      
      {/* Additional features... */}
      <div className="glass-card group hover:scale-105 transition-all duration-300">
        <div className="text-3xl mb-4">🐔</div>
        <h3 className="text-xl font-semibold mb-3">Flock Management</h3>
        <p className="text-gray-600">Track individual birds or batches with health notes and timeline events that affect performance.</p>
      </div>
      
      <div className="glass-card group hover:scale-105 transition-all duration-300">
        <div className="text-3xl mb-4">📈</div>
        <h3 className="text-xl font-semibold mb-3">Insights Dashboard</h3>
        <p className="text-gray-600">Clean, visual metrics showing cost per egg, productivity trends, and spending patterns.</p>
      </div>
      
      <div className="glass-card group hover:scale-105 transition-all duration-300">
        <div className="text-3xl mb-4">📋</div>
        <h3 className="text-xl font-semibold mb-3">Export & Backup</h3>
        <p className="text-gray-600">Get your data out when needed for taxes, sharing, or peace of mind that you're not locked in.</p>
      </div>
    </div>
  </div>
</section>
```

### 5. Social Proof Section
Build credibility with testimonials and statistics:

```tsx
<section className="py-20 bg-purple-50">
  <div className="container mx-auto px-6">
    <div className="text-center mb-16">
      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
        Trusted by 4,000+ Chicken Keepers
      </h2>
      <p className="text-lg text-gray-600">
        Join successful chicken keepers who replaced chaos with confidence
      </p>
    </div>
    
    {/* Statistics */}
    <div className="grid md:grid-cols-3 gap-8 mb-16">
      <div className="text-center">
        <div className="text-4xl font-bold text-purple-600 mb-2">85%</div>
        <div className="text-gray-600">Reduction in tracking time</div>
      </div>
      <div className="text-center">
        <div className="text-4xl font-bold text-purple-600 mb-2">$23</div>
        <div className="text-gray-600">Average monthly savings identified</div>
      </div>
      <div className="text-center">
        <div className="text-4xl font-bold text-purple-600 mb-2">92%</div>
        <div className="text-gray-600">Feel more confident about their flock</div>
      </div>
    </div>
    
    {/* Testimonials */}
    <div className="grid md:grid-cols-3 gap-8">
      <div className="glass-card">
        <div className="flex mb-4">
          <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
        </div>
        <p className="text-gray-700 mb-4">"Finally know if my chickens are actually saving me money! The cost per egg tracker is a game-changer."</p>
        <div className="text-sm text-gray-600">- Sarah M., Urban Homesteader</div>
      </div>
      
      <div className="glass-card">
        <div className="flex mb-4">
          <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
        </div>
        <p className="text-gray-700 mb-4">"The performance alerts saved me from a costly feed issue. Caught the problem before I lost weeks of production."</p>
        <div className="text-sm text-gray-600">- Mike T., Suburban Dad</div>
      </div>
      
      <div className="glass-card">
        <div className="flex mb-4">
          <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
        </div>
        <p className="text-gray-700 mb-4">"Simple enough for my kids to help with, detailed enough to actually be useful. Perfect balance."</p>
        <div className="text-sm text-gray-600">- Jennifer L., Family Farm</div>
      </div>
    </div>
  </div>
</section>
```

### 6. Pricing Section
Simple, clear pricing with strong value proposition:

```tsx
<section className="py-20 bg-white">
  <div className="container mx-auto px-6">
    <div className="text-center mb-16">
      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
        Choose Your Plan
      </h2>
      <p className="text-lg text-gray-600">
        Start free, upgrade when you need advanced insights
      </p>
    </div>
    
    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
      {/* Free Plan */}
      <div className="glass-card text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Free</h3>
        <div className="text-4xl font-bold text-purple-600 mb-6">$0</div>
        <ul className="text-left space-y-3 mb-8">
          <li className="flex items-center gap-3">
            <span className="text-green-500">✓</span>
            <span>Basic egg and feed tracking</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-green-500">✓</span>
            <span>Cost per egg calculations</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-green-500">✓</span>
            <span>Simple productivity charts</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-green-500">✓</span>
            <span>Data export</span>
          </li>
        </ul>
        <button className="w-full py-3 px-6 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300">
          Get Started Free
        </button>
      </div>
      
      {/* Pro Plan */}
      <div className="glass-card text-center relative border-2 border-purple-600">
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Pro</h3>
        <div className="text-4xl font-bold text-purple-600 mb-2">$25</div>
        <div className="text-gray-600 mb-6">/month</div>
        <ul className="text-left space-y-3 mb-8">
          <li className="flex items-center gap-3">
            <span className="text-green-500">✓</span>
            <span>Everything in Free</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-green-500">✓</span>
            <span>Performance alerts & notifications</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-green-500">✓</span>
            <span>Advanced cost analysis</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-green-500">✓</span>
            <span>Timeline-based insights</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-green-500">✓</span>
            <span>Community predator alerts</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-green-500">✓</span>
            <span>Priority support</span>
          </li>
        </ul>
        <button className="shiny-cta w-full">Start 30-Day Free Trial</button>
      </div>
    </div>
    
    <div className="text-center mt-8 text-gray-600">
      <p>30-day free trial • No credit card required • Cancel anytime</p>
    </div>
  </div>
</section>
```

### 7. Final CTA Section
Strong closing with urgency and trust signals:

```tsx
<section className="py-20 bg-gradient-to-r from-purple-600 to-purple-800 text-white text-center">
  <div className="container mx-auto px-6">
    <h2 className="text-3xl lg:text-5xl font-bold mb-6">
      Ready to Succeed at Chicken Keeping?
    </h2>
    <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
      Join thousands of chicken keepers who replaced guesswork with confidence. 
      Start your free trial today and see what your flock can really do.
    </p>
    
    <button className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-2xl">
      Start Your Free Trial
    </button>
    
    <div className="mt-6 text-purple-200">
      <p>No credit card required • Cancel anytime • 30-day free trial</p>
    </div>
  </div>
</section>
```

---

## 📱 Responsive Design Requirements

### Mobile-First Approach (320px - 640px)
- **Single column layouts** throughout
- **Large touch targets** (minimum 44px height)
- **Readable fonts** without zooming (16px+ body text)
- **Thumb-friendly navigation** with bottom-aligned CTAs
- **Reduced animations** to preserve battery and data
- **Stacked hero content** with prominent CTA buttons
- **Horizontal scroll** for feature cards if needed

### Tablet Optimization (641px - 1023px)
- **2-3 column grids** for feature sections
- **Side-by-side** hero layout where appropriate
- **Medium spacing** and padding adjustments
- **Balanced typography** scaling
- **Touch-optimized** interactive elements

### Desktop Enhancement (1024px+)
- **3-4 column grids** for maximum content density
- **Side-by-side layouts** with visual hierarchy
- **Generous whitespace** and larger padding
- **Enhanced hover effects** and micro-interactions
- **Larger typography** for display elements
- **Complex animations** for engaging experience

### Accessibility Requirements
- **High contrast ratios** (minimum 4.5:1 for text)
- **Keyboard navigation** support
- **Screen reader compatibility** with semantic HTML
- **Motion respect** with `prefers-reduced-motion` handling
- **Focus indicators** for interactive elements
- **Alt text** for all images and animations

---

## 💻 Code Examples & Constraints

### Required Dependencies
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "framer-motion": "^10.0.0"
  }
}
```

### Animation Utilities
```tsx
// Respect motion preferences
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Intersection observer for scroll animations
const useInViewAnimation = () => {
  const ref = useRef(null);
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
```

### Required Emojis for Agricultural Context
Use these specific emojis to maintain brand consistency:
- **🥚** (eggs/production)
- **🐔** (chickens/birds)
- **📊** (analytics/charts)
- **💰** (costs/money)
- **📝** (tracking/notes)
- **⚠️** (alerts/warnings)
- **📅** (timeline/scheduling)
- **🌾** (agriculture/farming)
- **⭐** (ratings/quality)
- **✓** (checkmarks/features)

### CSS Animation Keyframes
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-shine {
  animation: shine 2s linear infinite;
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}
```

---

## 🚫 Strict Scope Definition

### ✅ You Should Create:
- **Single React component** named `LandingPage.tsx`
- **TypeScript interfaces** for all props and data structures
- **Tailwind CSS classes** exclusively (no separate CSS files)
- **Responsive breakpoints** using Tailwind's system
- **Semantic HTML structure** with proper ARIA labels
- **Smooth scroll behavior** and hover animations
- **Performance optimizations** with lazy loading
- **Accessibility features** including keyboard navigation

### ❌ You Should NOT:
- **Create separate CSS files** (use Tailwind utilities only)
- **Add external dependencies** beyond those specified
- **Modify existing component files** or architecture
- **Include complex form validation** (simple CTAs only)
- **Add actual API integrations** (use placeholder functions)
- **Include auto-playing videos** or heavy media
- **Override Tailwind's default configuration**
- **Create multiple component files** (single component only)

### 🎯 Performance Guidelines:
- **Optimize images** with appropriate formats and lazy loading
- **Minimize bundle size** by avoiding unnecessary imports
- **Use CSS transforms** for animations over layout changes
- **Implement intersection observers** for scroll-triggered animations
- **Respect motion preferences** with `prefers-reduced-motion`
- **Provide loading states** for dynamic content
- **Include error boundaries** for robust user experience

---

## 🧪 Testing & Quality Assurance

### Accessibility Checklist:
- [ ] All images have descriptive alt text
- [ ] Color contrast ratios meet WCAG AA standards (4.5:1)
- [ ] Interactive elements are keyboard accessible
- [ ] Focus indicators are clearly visible
- [ ] Screen reader compatibility tested
- [ ] Motion respects user preferences

### Performance Checklist:
- [ ] Images optimized and lazy loaded
- [ ] Animations use CSS transforms
- [ ] Bundle size under 500KB gzipped
- [ ] First Contentful Paint under 1.5s
- [ ] Mobile-optimized touch targets
- [ ] Responsive images for different screen densities

### Browser Compatibility:
- [ ] Chrome 90+ (primary target)
- [ ] Firefox 88+ 
- [ ] Safari 14+
- [ ] Edge 90+
- [ ] Mobile Safari (iOS 14+)
- [ ] Chrome Mobile (Android 10+)

---

## 🚀 Implementation Notes

This comprehensive prompt provides everything needed to generate a professional, conversion-optimized landing page that:

1. **Addresses real user pain points** from the project brief
2. **Follows established brand guidelines** from the style guide
3. **Implements modern UX best practices** with mobile-first design
4. **Includes performance optimizations** and accessibility features
5. **Maintains consistency** with the existing application ecosystem

### Usage Instructions:
1. **Copy the entire prompt** into your AI tool (v0, Lovable.ai, etc.)
2. **Generate the initial component** and review the output
3. **Iterate on specific sections** using the detailed instructions
4. **Test thoroughly** across devices and browsers
5. **Optimize performance** and accessibility before deployment

### Post-Generation Review Required:
- **Code quality** and TypeScript correctness
- **Performance optimization** and loading speeds
- **Accessibility compliance** and keyboard navigation
- **Cross-browser compatibility** testing
- **Mobile responsiveness** across device sizes
- **Content accuracy** and brand voice consistency

---

*This prompt ensures your AI-generated landing page will be production-ready with minimal manual refinement while maintaining the professional quality and user experience your Chicken Care App deserves.*