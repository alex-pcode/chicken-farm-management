import Critters from 'critters';

/**
 * Vite plugin for critical CSS extraction using Critters
 * Extracts above-the-fold CSS and inlines it in HTML head
 */
export function criticalCSS(options = {}) {
  let critters;
  
  const defaultOptions = {
    // Above-the-fold viewport dimensions
    width: 1200,
    height: 800,
    // Inline critical CSS in HTML head
    inline: true,
    // Remove inlined CSS from external stylesheets
    extract: true,
    // Don't inline fonts to avoid layout shift
    inlineFonts: false,
    // Preload non-critical CSS
    preload: 'swap',
    // Prioritize landing page content
    prioritize: [
      // Hero section selectors
      '.hero-gradient-1',
      '.hero-gradient-2', 
      '.shiny-cta',
      // Critical typography
      'h1', 'h2',
      // Navigation
      'nav',
      // Primary CTA
      'button'
    ],
    // Additional options
    reduceInlineStyles: true,
    pruneSource: false,
    logLevel: 'info',
    ...options
  };

  return {
    name: 'critical-css',
    apply: 'build',
    
    configResolved(config) {
      // Only apply in production builds
      if (config.command === 'build' && config.mode === 'production') {
        critters = new Critters(defaultOptions);
      }
    },
    
    async writeBundle(options, bundle) {
      if (!critters) return;
      
      try {
        // Find the built HTML file
        const outputDir = options.dir || 'dist';
        const indexHtmlPath = `${outputDir}/index.html`;
        
        // Check if file exists
        const fs = await import('fs');
        const path = await import('path');
        
        if (fs.existsSync(indexHtmlPath)) {
          // Read the HTML file
          const htmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');
          
          // Process with Critters
          let optimizedHtml = await critters.process(htmlContent);
          
          // Convert blocking CSS to async loading for better LCP
          optimizedHtml = optimizedHtml.replace(
            /<link rel="stylesheet" crossorigin href="([^"]*\.css)">/g, 
            (match, href) => {
              return `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="${href}"></noscript>`;
            }
          );
          
          // Write back to file
          fs.writeFileSync(indexHtmlPath, optimizedHtml);
          
          console.log(`✅ Critical CSS extracted and inlined for index.html`);
        }
      } catch (error) {
        console.warn(`⚠️  Critical CSS extraction failed:`, error.message);
        // Continue without failing the build
      }
    }
  };
}