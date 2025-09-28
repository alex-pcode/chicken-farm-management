/**
 * Font Loading Test Suite
 * 
 * Provides manual testing utilities to verify font loading works correctly
 * in both development and production environments.
 */

export interface FontTestResult {
  font: string;
  weight: string;
  loaded: boolean;
  applied: boolean;
  timing?: number;
  error?: string;
}

export interface FontTestReport {
  environment: 'development' | 'production';
  userAgent: string;
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  results: FontTestResult[];
  recommendations: string[];
}

export class FontLoadingTester {
  private testContainer: HTMLElement | null = null;

  constructor() {
    this.setupTestContainer();
  }

  private setupTestContainer() {
    // Create hidden test container
    this.testContainer = document.createElement('div');
    this.testContainer.id = 'font-test-container';
    this.testContainer.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      visibility: hidden;
      pointer-events: none;
      z-index: -1;
    `;
    document.body.appendChild(this.testContainer);
  }

  public async runFullTest(): Promise<FontTestReport> {
    console.log('🧪 Starting comprehensive font loading test...');

    const testWeights = ['400', '500', '600', '700'];
    const results: FontTestResult[] = [];

    for (const weight of testWeights) {
      const result = await this.testFontWeight('Fraunces', weight);
      results.push(result);
    }

    const report: FontTestReport = {
      environment: import.meta.env.PROD ? 'production' : 'development',
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      totalTests: results.length,
      passed: results.filter(r => r.loaded && r.applied).length,
      failed: results.filter(r => !r.loaded || !r.applied).length,
      results,
      recommendations: this.generateRecommendations(results)
    };

    this.logTestReport(report);
    return report;
  }

  private async testFontWeight(family: string, weight: string): Promise<FontTestResult> {
    const startTime = performance.now();
    
    try {
      // Test 1: Font loading via Font Loading API
      let loaded = false;
      if ('fonts' in document && document.fonts.load) {
        await document.fonts.load(`${weight} 16px ${family}`);
        loaded = document.fonts.check(`${weight} 16px ${family}`);
      }

      // Test 2: Visual rendering test
      const applied = await this.testFontApplication(family, weight);
      
      const timing = performance.now() - startTime;

      return {
        font: family,
        weight,
        loaded,
        applied,
        timing: Math.round(timing)
      };
    } catch (error) {
      return {
        font: family,
        weight,
        loaded: false,
        applied: false,
        timing: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testFontApplication(family: string, weight: string): Promise<boolean> {
    if (!this.testContainer) return false;

    // Create test elements
    const testElement = document.createElement('span');
    testElement.style.cssText = `
      font-family: '${family}', serif;
      font-weight: ${weight};
      font-size: 16px;
      visibility: hidden;
      position: absolute;
    `;
    testElement.textContent = 'Test Text for Font Measurement';

    const fallbackElement = document.createElement('span');
    fallbackElement.style.cssText = `
      font-family: serif;
      font-weight: ${weight};
      font-size: 16px;
      visibility: hidden;
      position: absolute;
    `;
    fallbackElement.textContent = 'Test Text for Font Measurement';

    this.testContainer.appendChild(testElement);
    this.testContainer.appendChild(fallbackElement);

    // Wait a frame for layout
    await new Promise(resolve => requestAnimationFrame(resolve));

    // Compare measurements
    const testWidth = testElement.offsetWidth;
    const fallbackWidth = fallbackElement.offsetWidth;

    // Clean up
    this.testContainer.removeChild(testElement);
    this.testContainer.removeChild(fallbackElement);

    // If widths differ significantly, custom font is likely applied
    const difference = Math.abs(testWidth - fallbackWidth);
    const applied = difference > 2; // Allow for small rendering differences

    console.log(`📏 Font measurement: ${family} ${weight} - Test: ${testWidth}px, Fallback: ${fallbackWidth}px, Applied: ${applied}`);

    return applied;
  }

  public async testProductionVsLocal(): Promise<{
    production: FontTestResult[];
    local: FontTestResult[];
    comparison: string[];
  }> {
    console.log('🔄 Running production vs local comparison...');

    const currentResults = await this.runQuickTest();
    
    // Store results for comparison
    const testKey = 'font-test-results';
    const storedResults = localStorage.getItem(testKey);
    
    if (import.meta.env.PROD) {
      // In production, store results
      localStorage.setItem(testKey, JSON.stringify(currentResults));
      return {
        production: currentResults,
        local: [],
        comparison: ['Production results stored for comparison']
      };
    } else {
      // In development, compare with stored production results
      const productionResults = storedResults ? JSON.parse(storedResults) : [];
      const comparison = this.compareResults(currentResults, productionResults);
      
      return {
        production: productionResults,
        local: currentResults,
        comparison
      };
    }
  }

  private async runQuickTest(): Promise<FontTestResult[]> {
    const testWeights = ['400', '600']; // Test only critical weights
    const results: FontTestResult[] = [];

    for (const weight of testWeights) {
      const result = await this.testFontWeight('Fraunces', weight);
      results.push(result);
    }

    return results;
  }

  private compareResults(local: FontTestResult[], production: FontTestResult[]): string[] {
    const comparison: string[] = [];

    if (production.length === 0) {
      comparison.push('⚠️ No production results found for comparison');
      return comparison;
    }

    local.forEach(localResult => {
      const prodResult = production.find(p => 
        p.font === localResult.font && p.weight === localResult.weight
      );

      if (!prodResult) {
        comparison.push(`❓ No production data for ${localResult.font} ${localResult.weight}`);
        return;
      }

      if (localResult.loaded !== prodResult.loaded) {
        comparison.push(`❌ Loading mismatch: ${localResult.font} ${localResult.weight} - Local: ${localResult.loaded}, Prod: ${prodResult.loaded}`);
      }

      if (localResult.applied !== prodResult.applied) {
        comparison.push(`❌ Application mismatch: ${localResult.font} ${localResult.weight} - Local: ${localResult.applied}, Prod: ${prodResult.applied}`);
      }

      if (localResult.loaded === prodResult.loaded && localResult.applied === prodResult.applied) {
        comparison.push(`✅ Match: ${localResult.font} ${localResult.weight} works consistently`);
      }
    });

    return comparison;
  }

  private generateRecommendations(results: FontTestResult[]): string[] {
    const recommendations: string[] = [];

    const failedLoading = results.filter(r => !r.loaded);
    const failedApplication = results.filter(r => r.loaded && !r.applied);
    const slowLoading = results.filter(r => r.timing && r.timing > 200);

    if (failedLoading.length > 0) {
      recommendations.push(`🔧 ${failedLoading.length} fonts failed to load - check network requests and file paths`);
    }

    if (failedApplication.length > 0) {
      recommendations.push(`🎨 ${failedApplication.length} fonts loaded but not applied - check CSS specificity and font-family declarations`);
    }

    if (slowLoading.length > 0) {
      recommendations.push(`⚡ ${slowLoading.length} fonts loaded slowly (>200ms) - consider font optimization`);
    }

    if (results.every(r => r.loaded && r.applied)) {
      recommendations.push('✅ All fonts loading and applying correctly');
    }

    return recommendations;
  }

  private logTestReport(report: FontTestReport) {
    console.group('📊 Font Loading Test Report');
    console.log(`Environment: ${report.environment}`);
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Results: ${report.passed}/${report.totalTests} passed`);
    
    if (report.failed > 0) {
      console.group('❌ Failed Tests');
      report.results
        .filter(r => !r.loaded || !r.applied)
        .forEach(r => {
          console.log(`${r.font} ${r.weight}: loaded=${r.loaded}, applied=${r.applied}`, r.error || '');
        });
      console.groupEnd();
    }

    if (report.recommendations.length > 0) {
      console.group('💡 Recommendations');
      report.recommendations.forEach(rec => console.log(rec));
      console.groupEnd();
    }

    console.groupEnd();
  }

  public cleanup() {
    if (this.testContainer && this.testContainer.parentNode) {
      this.testContainer.parentNode.removeChild(this.testContainer);
      this.testContainer = null;
    }
  }
}

// Export test utilities for console usage
export const fontTestUtils = {
  async runTest() {
    const tester = new FontLoadingTester();
    const report = await tester.runFullTest();
    tester.cleanup();
    return report;
  },

  async compareEnvironments() {
    const tester = new FontLoadingTester();
    const comparison = await tester.testProductionVsLocal();
    tester.cleanup();
    console.log('🔄 Environment comparison:', comparison);
    return comparison;
  },

  checkCurrentFont(selector = 'body') {
    const element = document.querySelector(selector);
    if (!element) return null;

    const computed = window.getComputedStyle(element);
    const result = {
      element: selector,
      fontFamily: computed.fontFamily,
      fontWeight: computed.fontWeight,
      fontSize: computed.fontSize,
      isUsingFraunces: computed.fontFamily.includes('Fraunces')
    };

    console.log('🔍 Current font usage:', result);
    return result;
  },

  async waitAndTest(delay = 2000) {
    console.log(`⏳ Waiting ${delay}ms before testing...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return this.runTest();
  }
};

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).fontTestUtils = fontTestUtils;
}