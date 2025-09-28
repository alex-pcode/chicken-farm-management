/**
 * Font Loading Debugger
 * 
 * Comprehensive debugging utility to track font loading behavior
 * and identify issues in production vs development environments.
 */

interface FontLoadingData {
  timestamp: number;
  event: string;
  fontFamily: string;
  fontWeight?: string;
  status?: string;
  details?: any;
}

class FontLoadingDebugger {
  private logs: FontLoadingData[] = [];
  private isDebugMode: boolean;

  constructor() {
    // Enable debug mode in development or when debug flag is set
    this.isDebugMode = !import.meta.env.PROD || localStorage.getItem('debug-fonts') === 'true';
    
    if (this.isDebugMode) {
      console.log('🎨 Font Loading Debugger initialized');
      this.setupFontLoadingTracking();
      this.logInitialFontState();
    }
  }

  private log(event: string, fontFamily: string, details?: any) {
    const entry: FontLoadingData = {
      timestamp: performance.now(),
      event,
      fontFamily,
      ...details
    };
    
    this.logs.push(entry);
    
    if (this.isDebugMode) {
      console.log(`🎨 Font Debug [${event}]:`, fontFamily, details || '');
    }
  }

  private setupFontLoadingTracking() {
    // Track when fonts are available in document.fonts
    if ('fonts' in document) {
      // Monitor when fonts are added to FontFaceSet
      const originalAdd = document.fonts.add;
      document.fonts.add = (font: FontFace) => {
        this.log('font-face-added', font.family, {
          weight: font.weight,
          style: font.style,
          status: font.status
        });
        return originalAdd.call(document.fonts, font);
      };

      // Track font loading events
      document.fonts.addEventListener('loadingdone', (event) => {
        event.fontfaces.forEach((font) => {
          this.log('font-loaded', font.family, {
            weight: font.weight,
            style: font.style,
            status: font.status
          });
        });
      });

      document.fonts.addEventListener('loadingerror', (event) => {
        event.fontfaces.forEach((font) => {
          this.log('font-error', font.family, {
            weight: font.weight,
            style: font.style,
            status: font.status,
            error: 'Font failed to load'
          });
        });
      });

      // Track when all fonts are ready
      document.fonts.ready.then(() => {
        this.log('all-fonts-ready', 'document.fonts', {
          totalFonts: document.fonts.size,
          readyState: document.readyState
        });
        this.analyzeLoadedFonts();
      });
    }
  }

  private logInitialFontState() {
    this.log('debugger-init', 'system', {
      userAgent: navigator.userAgent,
      readyState: document.readyState,
      location: window.location.href
    });

    // Check if fonts are already loaded
    if ('fonts' in document) {
      this.log('fonts-api-available', 'document.fonts', {
        size: document.fonts.size,
        status: document.fonts.status
      });
    }

    // Test initial font availability
    this.testFontAvailability();
  }

  private testFontAvailability() {
    const testWeights = ['400', '500', '600', '700'];
    
    testWeights.forEach(weight => {
      const isAvailable = this.checkFontAvailability('Fraunces', weight);
      this.log('font-check', 'Fraunces', {
        weight,
        available: isAvailable,
        method: 'document.fonts.check'
      });
    });
  }

  private checkFontAvailability(family: string, weight: string): boolean {
    if ('fonts' in document && document.fonts.check) {
      return document.fonts.check(`${weight} 16px "${family}"`);
    }
    return false;
  }

  private analyzeLoadedFonts() {
    if (!('fonts' in document)) return;

    const frauncesFonts: FontFace[] = [];
    document.fonts.forEach((font) => {
      if (font.family.includes('Fraunces')) {
        frauncesFonts.push(font);
      }
    });

    this.log('analysis-complete', 'Fraunces', {
      totalFrauncesFonts: frauncesFonts.length,
      fonts: frauncesFonts.map(f => ({
        family: f.family,
        weight: f.weight,
        style: f.style,
        status: f.status
      }))
    });

    // Test if fonts are actually being used
    this.testFontUsage();
  }

  private testFontUsage() {
    // Create a test element to see what font is actually being used
    const testElement = document.createElement('div');
    testElement.style.fontFamily = "'Fraunces', serif";
    testElement.style.fontSize = '16px';
    testElement.style.fontWeight = '400';
    testElement.style.position = 'absolute';
    testElement.style.left = '-9999px';
    testElement.style.visibility = 'hidden';
    testElement.textContent = 'Font Test';
    
    document.body.appendChild(testElement);
    
    // Get computed style
    const computedStyle = window.getComputedStyle(testElement);
    const actualFont = computedStyle.fontFamily;
    
    this.log('font-usage-test', 'Fraunces', {
      requestedFont: "'Fraunces', serif",
      actualFont: actualFont,
      isUsingFraunces: actualFont.includes('Fraunces')
    });
    
    document.body.removeChild(testElement);
  }

  public checkCurrentFontUsage(element?: HTMLElement) {
    const targetElement = element || document.body;
    const computedStyle = window.getComputedStyle(targetElement);
    
    const fontData = {
      fontFamily: computedStyle.fontFamily,
      fontSize: computedStyle.fontSize,
      fontWeight: computedStyle.fontWeight,
      fontStyle: computedStyle.fontStyle
    };
    
    this.log('current-usage-check', 'element', fontData);
    
    return fontData;
  }

  public async testFontLoading() {
    if (!('fonts' in document) || !document.fonts.load) return;

    const testWeights = ['400', '500', '600', '700'];
    
    for (const weight of testWeights) {
      try {
        const fontSpec = `${weight} 16px Fraunces`;
        const startTime = performance.now();
        
        await document.fonts.load(fontSpec);
        
        const loadTime = performance.now() - startTime;
        const isAvailable = document.fonts.check(fontSpec);
        
        this.log('explicit-load-test', 'Fraunces', {
          weight,
          loadTime: Math.round(loadTime),
          available: isAvailable
        });
      } catch (error) {
        this.log('explicit-load-error', 'Fraunces', {
          weight,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  public generateReport() {
    const report = {
      environment: {
        isDevelopment: !import.meta.env.PROD,
        location: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      },
      fontLogs: this.logs,
      currentState: this.getCurrentFontState(),
      recommendations: this.generateRecommendations()
    };

    console.log('📊 Font Loading Debug Report:', report);
    
    // Store in localStorage for later analysis
    localStorage.setItem('font-debug-report', JSON.stringify(report, null, 2));
    
    return report;
  }

  private getCurrentFontState() {
    if (!('fonts' in document)) return null;

    const state = {
      ready: document.fonts.status === 'loaded',
      size: document.fonts.size,
      status: document.fonts.status
    };

    // Get all Fraunces fonts
    const frauncesFonts: any[] = [];
    document.fonts.forEach((font) => {
      if (font.family.includes('Fraunces')) {
        frauncesFonts.push({
          family: font.family,
          weight: font.weight,
          style: font.style,
          status: font.status
        });
      }
    });

    return { ...state, frauncesFonts };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    const fontErrors = this.logs.filter(log => log.event === 'font-error');
    const loadTimes = this.logs.filter(log => log.event === 'explicit-load-test' && log.details?.loadTime);
    
    if (fontErrors.length > 0) {
      recommendations.push('Font loading errors detected - check network and file paths');
    }
    
    if (loadTimes.some(log => log.details.loadTime > 100)) {
      recommendations.push('Slow font loading detected - consider font-display: optional or preload optimization');
    }
    
    const usageTest = this.logs.find(log => log.event === 'font-usage-test');
    if (usageTest && !usageTest.details?.isUsingFraunces) {
      recommendations.push('Fraunces font not being applied - check CSS specificity or font-family declarations');
    }
    
    return recommendations;
  }
}

// Create global instance
let fontDebugger: FontLoadingDebugger;

export function initializeFontDebugger() {
  if (!fontDebugger) {
    fontDebugger = new FontLoadingDebugger();
  }
  return fontDebugger;
}

export function getFontDebugger() {
  return fontDebugger;
}

// Debug utilities for manual testing
export const fontDebugUtils = {
  enableDebugMode: () => {
    localStorage.setItem('debug-fonts', 'true');
    window.location.reload();
  },
  
  disableDebugMode: () => {
    localStorage.removeItem('debug-fonts');
    window.location.reload();
  },
  
  checkFont: (family: string, weight: string = '400') => {
    if ('fonts' in document && document.fonts.check) {
      return document.fonts.check(`${weight} 16px "${family}"`);
    }
    return false;
  },
  
  testElement: (selector: string) => {
    const element = document.querySelector(selector);
    if (element && fontDebugger) {
      return fontDebugger.checkCurrentFontUsage(element as HTMLElement);
    }
    return null;
  },
  
  loadFont: async (family: string, weight: string = '400') => {
    if ('fonts' in document && document.fonts.load) {
      try {
        await document.fonts.load(`${weight} 16px ${family}`);
        return document.fonts.check(`${weight} 16px ${family}`);
      } catch (error) {
        console.error('Font load failed:', error);
        return false;
      }
    }
    return false;
  }
};

// Make debug utils globally available for console testing
if (typeof window !== 'undefined') {
  (window as any).fontDebugUtils = fontDebugUtils;
}