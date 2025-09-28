/**
 * Font Loading Optimizer
 * 
 * Implements various strategies to ensure fonts load and are applied
 * before the critical rendering path completes.
 */

class FontLoadingOptimizer {
  private loadedFonts = new Set<string>();

  constructor() {
    this.setupOptimizations();
  }

  private setupOptimizations() {
    // Strategy 1: Preload critical fonts immediately
    this.preloadCriticalFonts();
    
    // Strategy 2: Force font loading before render
    this.forceFontLoadingBeforeRender();
    
    // Strategy 3: Apply fonts after loading with CSS injection
    this.setupDynamicFontApplication();
  }

  private preloadCriticalFonts() {
    const criticalFonts = [
      { family: 'Fraunces', weight: '400', url: '/fonts/fraunces-400.woff2' },
      { family: 'Fraunces', weight: '600', url: '/fonts/fraunces-600.woff2' }
    ];

    criticalFonts.forEach(font => {
      this.preloadFont(font.url, font.family, font.weight);
    });
  }

  private preloadFont(url: string, family: string, weight: string) {
    // Check if already preloaded
    const existing = document.querySelector(`link[href="${url}"]`);
    if (existing) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    
    // Add high fetchpriority for critical fonts
    if (weight === '400' || weight === '600') {
      (link as any).fetchPriority = 'high';
    }

    document.head.appendChild(link);

    // Track loading
    link.addEventListener('load', () => {
      console.log(`🎨 Font preloaded: ${family} ${weight}`);
      this.loadedFonts.add(`${family}-${weight}`);
    });

    link.addEventListener('error', () => {
      console.error(`❌ Font preload failed: ${family} ${weight} from ${url}`);
    });
  }

  private forceFontLoadingBeforeRender() {
    if (!('fonts' in document) || !document.fonts.load) return;

    const criticalFonts = [
      'normal 400 16px Fraunces',
      'normal 600 16px Fraunces'
    ];

    // Force load critical fonts immediately
    const loadPromises = criticalFonts.map(async (fontSpec) => {
      try {
        await document.fonts.load(fontSpec);
        console.log(`🎨 Force loaded: ${fontSpec}`);
        return true;
      } catch (error) {
        console.error(`❌ Force load failed: ${fontSpec}`, error);
        return false;
      }
    });

    // Ensure fonts are loaded before proceeding
    Promise.all(loadPromises).then((results) => {
      const successCount = results.filter(Boolean).length;
      console.log(`🎨 Critical fonts loaded: ${successCount}/${results.length}`);
      
      if (successCount > 0) {
        this.applyCriticalFontStyles();
      }
    });
  }

  private applyCriticalFontStyles() {
    // Inject CSS to force font application with higher specificity
    const criticalFontCSS = `
      /* Critical font application with high specificity */
      html body,
      html body *,
      .font-sans,
      h1, h2, h3, h4, h5, h6 {
        font-family: 'Fraunces', 'Times New Roman', 'Georgia', serif !important;
      }
      
      /* Force font features */
      body {
        font-optical-sizing: auto !important;
        font-variation-settings: 'opsz' 14 !important;
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'critical-font-styles';
    styleElement.textContent = criticalFontCSS;
    document.head.appendChild(styleElement);

    console.log('🎨 Critical font styles applied with high specificity');
  }

  private setupDynamicFontApplication() {
    // Watch for font loading completion and apply styles dynamically
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        this.optimizeFontRendering();
      });
      
      // Also listen for individual font loads
      document.fonts.addEventListener('loadingdone', (event) => {
        const frauncesFonts = Array.from(event.fontfaces).filter(font => 
          font.family.includes('Fraunces')
        );
        
        if (frauncesFonts.length > 0) {
          this.optimizeFontRendering();
        }
      });
    }
  }

  private optimizeFontRendering() {
    // Remove any font-display that might cause issues
    const existingStyles = document.querySelectorAll('style');
    existingStyles.forEach(style => {
      if (style.textContent?.includes('font-display')) {
        // Replace font-display: swap with font-display: block for immediate rendering
        style.textContent = style.textContent.replace(/font-display:\s*swap/g, 'font-display: block');
      }
    });

    // Force repaint to ensure font application
    this.forceRepaint();
    
    console.log('🎨 Font rendering optimized');
  }

  private forceRepaint() {
    // Force browser to repaint with new fonts
    const body = document.body;
    const display = body.style.display;
    body.style.display = 'none';
    // Trigger reflow
    body.offsetHeight;
    body.style.display = display;
  }

  // Public methods for manual optimization
  public async ensureFontLoaded(family: string, weight: string = '400'): Promise<boolean> {
    if (!('fonts' in document) || !document.fonts.load) return false;

    const fontSpec = `normal ${weight} 16px ${family}`;
    
    try {
      await document.fonts.load(fontSpec);
      const isLoaded = document.fonts.check(fontSpec);
      console.log(`🎨 Font ensure result: ${family} ${weight} = ${isLoaded}`);
      return isLoaded;
    } catch (error) {
      console.error(`❌ Font ensure failed: ${family} ${weight}`, error);
      return false;
    }
  }

  public checkAllFontsLoaded(): boolean {
    if (!('fonts' in document)) return false;
    
    const requiredFonts = [
      'normal 400 16px Fraunces',
      'normal 500 16px Fraunces', 
      'normal 600 16px Fraunces',
      'normal 700 16px Fraunces'
    ];

    const results = requiredFonts.map(fontSpec => ({
      spec: fontSpec,
      loaded: document.fonts.check(fontSpec)
    }));

    console.log('🎨 Font availability check:', results);
    
    return results.every(result => result.loaded);
  }

  public async waitForFonts(timeout: number = 3000): Promise<boolean> {
    if (!('fonts' in document)) return false;

    return new Promise((resolve) => {
      const checkInterval = 100;
      const maxAttempts = timeout / checkInterval;
      let attempts = 0;

      const check = () => {
        attempts++;
        
        if (this.checkAllFontsLoaded()) {
          console.log(`🎨 All fonts ready after ${attempts * checkInterval}ms`);
          resolve(true);
          return;
        }

        if (attempts >= maxAttempts) {
          console.warn(`⚠️ Font loading timeout after ${timeout}ms`);
          resolve(false);
          return;
        }

        setTimeout(check, checkInterval);
      };

      check();
    });
  }

  public injectFontOptimizationCSS() {
    // Inject additional CSS optimizations
    const optimizationCSS = `
      /* Font optimization styles */
      @media (prefers-reduced-motion: no-preference) {
        * {
          font-synthesis: none;
          -webkit-font-feature-settings: "kern" 1;
          font-feature-settings: "kern" 1;
        }
      }
      
      /* Ensure font display behavior */
      @font-face {
        font-family: 'Fraunces-Optimized';
        src: url('/fonts/fraunces-400.woff2') format('woff2');
        font-weight: 400;
        font-style: normal;
        font-display: block; /* Changed from swap to block */
        unicode-range: U+0000-00FF;
      }
      
      /* High-priority text elements */
      h1, h2, h3, .text-title, .text-display {
        font-family: 'Fraunces-Optimized', 'Fraunces', 'Times New Roman', serif !important;
      }
      
      /* Prevent invisible text during font loading */
      .font-loading-optimization {
        font-display: block !important;
        text-rendering: optimizeSpeed;
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'font-optimization-styles';
    styleElement.textContent = optimizationCSS;
    document.head.appendChild(styleElement);

    console.log('🎨 Font optimization CSS injected');
  }
}

// Initialize optimizer immediately
let fontOptimizer: FontLoadingOptimizer;

export function initializeFontOptimizer() {
  if (!fontOptimizer) {
    fontOptimizer = new FontLoadingOptimizer();
  }
  return fontOptimizer;
}

export function getFontOptimizer() {
  return fontOptimizer;
}

// Auto-initialize if not in SSR environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Initialize optimizer as early as possible
  document.addEventListener('DOMContentLoaded', () => {
    initializeFontOptimizer();
  });
  
  // Fallback for cases where DOMContentLoaded already fired
  if (document.readyState === 'loading') {
    // DOMContentLoaded hasn't fired yet
  } else {
    // DOM is already ready
    initializeFontOptimizer();
  }
}

export type { FontLoadingOptimizer };