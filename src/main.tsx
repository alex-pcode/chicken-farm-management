import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from "@sentry/react"
import './index.css'
import App from './App.tsx'
import { BrowserRouter as Router } from 'react-router-dom';
import { initializeFontDebugger } from './utils/fontDebugger';
import { initializeFontOptimizer } from './utils/fontOptimizer';
import { fontTestUtils } from './utils/fontTester';
// import { initializeWebVitalsMonitoring } from './utils/monitoring';

// Initialize Sentry for production error monitoring
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1, // 10% sampling for performance monitoring
    profilesSampleRate: 0.1, // 10% sampling for profiling
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Custom error filtering for refactoring monitoring
    beforeSend(event) {
      // Tag errors that might be related to refactoring
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (error?.value?.includes('undefined') || 
            error?.value?.includes('Cannot read properties') ||
            error?.value?.includes('TypeError')) {
          event.tags = { ...event.tags, refactoring_risk: 'high' };
        }
      }
      return event;
    },
  });
}

// Initialize Web Vitals monitoring - temporarily disabled
// initializeWebVitalsMonitoring()

// Initialize font loading optimization and debugging
const fontDebugger = initializeFontDebugger();
const fontOptimizer = initializeFontOptimizer();

// Add font loading tests after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Apply font optimizations
  fontOptimizer.injectFontOptimizationCSS();
  
  // Test explicit font loading
  fontDebugger.testFontLoading();
  
  // Wait for fonts and generate comprehensive report
  fontOptimizer.waitForFonts(5000).then(async (allLoaded) => {
    console.log(`🎨 Font loading complete: ${allLoaded}`);
    
    // Generate debug report
    fontDebugger.generateReport();
    
    // Run comprehensive font test
    const testReport = await fontTestUtils.runTest();
    
    // Store test results for comparison between environments
    if (testReport.failed === 0) {
      console.log('✅ All font tests passed!');
    } else {
      console.warn(`⚠️ ${testReport.failed} font tests failed. Check console for details.`);
    }
  });
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // Use dynamic import to avoid loading workbox in development
  import('workbox-window').then(({ Workbox }) => {
    const wb = new Workbox('/sw.js')
    
    wb.addEventListener('controlling', () => {
      window.location.reload()
    })
    
    wb.addEventListener('waiting', () => {
      if (confirm('New app version available. Refresh now?')) {
        wb.messageSkipWaiting()
      }
    })
    
    wb.register()
  }).catch(err => {
    console.warn('PWA service worker registration failed:', err)
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
)
