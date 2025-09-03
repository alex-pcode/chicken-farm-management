import { test, expect } from '@playwright/test';

test.describe('Full LandingPage Content Test', () => {
  test('analyze full landing page with larger viewport', async ({ page }) => {
    // Set a larger viewport to see full content
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for animations to settle

    // Get full page analysis
    const fullPageInfo = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      
      // Check for the landing page container
      const landingPageContainer = document.querySelector('.w-full.bg-gray-50.font-fraunces');
      
      // Count sections
      const sections = landingPageContainer ? Array.from(landingPageContainer.children) : [];
      
      // Find all scrollable elements
      const scrollableElements = Array.from(document.querySelectorAll('*')).map(el => {
        const styles = window.getComputedStyle(el);
        const hasScroll = (
          styles.overflow === 'scroll' || 
          styles.overflow === 'auto' ||
          styles.overflowY === 'scroll' || 
          styles.overflowY === 'auto' ||
          el.scrollHeight > el.clientHeight
        );
        
        if (hasScroll && el.scrollHeight > 0) {
          return {
            tagName: el.tagName,
            className: el.className.substring(0, 50), // Limit class names for readability
            id: el.id,
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight,
            offsetTop: el.offsetTop,
            styles: {
              overflow: styles.overflow,
              overflowY: styles.overflowY,
              position: styles.position,
              height: styles.height
            }
          };
        }
        return null;
      }).filter(Boolean);

      return {
        windowHeight: window.innerHeight,
        documentHeight: html.scrollHeight,
        bodyHeight: body.scrollHeight,
        currentScrollY: window.scrollY,
        landingPageFound: !!landingPageContainer,
        sectionsCount: sections.length,
        scrollableElements,
        bodyOverflow: window.getComputedStyle(body).overflow,
        htmlOverflow: window.getComputedStyle(html).overflow,
        rootElement: document.getElementById('root') ? {
          scrollHeight: document.getElementById('root').scrollHeight,
          clientHeight: document.getElementById('root').clientHeight,
          overflow: window.getComputedStyle(document.getElementById('root')).overflow
        } : null
      };
    });

    console.log('=== FULL PAGE ANALYSIS (1920x1080) ===');
    console.log('Window height:', fullPageInfo.windowHeight);
    console.log('Document height:', fullPageInfo.documentHeight);
    console.log('Body height:', fullPageInfo.bodyHeight);
    console.log('Landing page found:', fullPageInfo.landingPageFound);
    console.log('Sections count:', fullPageInfo.sectionsCount);
    console.log('Body overflow:', fullPageInfo.bodyOverflow);
    console.log('HTML overflow:', fullPageInfo.htmlOverflow);
    console.log('Root element:', fullPageInfo.rootElement);
    console.log('Scrollable elements count:', fullPageInfo.scrollableElements.length);
    
    if (fullPageInfo.scrollableElements.length > 0) {
      console.log('Scrollable elements:');
      fullPageInfo.scrollableElements.forEach((el, i) => {
        console.log(`  ${i + 1}. ${el.tagName}${el.className ? '.' + el.className : ''}${el.id ? '#' + el.id : ''}`);
        console.log(`     ScrollH: ${el.scrollHeight}, ClientH: ${el.clientHeight}, Overflow: ${el.styles.overflow}`);
      });
    }

    // Test full page scroll behavior
    const maxScroll = fullPageInfo.documentHeight - fullPageInfo.windowHeight;
    console.log('\n=== FULL PAGE SCROLL TEST ===');
    console.log('Max possible scroll:', maxScroll);
    
    if (maxScroll > 0) {
      // Test scrolling to different positions
      const testPositions = [
        0,
        Math.floor(maxScroll * 0.25),
        Math.floor(maxScroll * 0.5),
        Math.floor(maxScroll * 0.75),
        maxScroll
      ];
      
      for (const pos of testPositions) {
        await page.evaluate((target) => {
          window.scrollTo({ top: target, behavior: 'instant' });
        }, pos);
        
        await page.waitForTimeout(200);
        
        const actualY = await page.evaluate(() => window.scrollY);
        const diff = Math.abs(pos - actualY);
        console.log(`Target: ${pos}, Actual: ${actualY}, Diff: ${diff}`);
        
        if (diff > 5) { // Allow 5px tolerance
          console.log(`  ⚠️  Large scroll difference detected!`);
        }
      }
    } else {
      console.log('Page content fits within viewport - no scrolling needed');
    }

    // Check for potential double scroll sources
    console.log('\n=== DOUBLE SCROLL ANALYSIS ===');
    
    const potentialIssues = [];
    
    // Check for nested scrollable containers
    const nonRootScrollables = fullPageInfo.scrollableElements.filter(el => 
      el.tagName !== 'HTML' && el.tagName !== 'BODY' && el.id !== 'root'
    );
    
    if (nonRootScrollables.length > 0) {
      potentialIssues.push(`Found ${nonRootScrollables.length} non-root scrollable elements`);
      nonRootScrollables.forEach(el => {
        console.log(`  - ${el.tagName}${el.className ? '.' + el.className : ''}${el.id ? '#' + el.id : ''}`);
      });
    }

    // Check root element configuration
    if (fullPageInfo.rootElement && fullPageInfo.rootElement.overflow === 'auto') {
      if (fullPageInfo.rootElement.scrollHeight > fullPageInfo.rootElement.clientHeight) {
        potentialIssues.push('Root element has auto overflow and scrollable content');
      }
    }

    if (potentialIssues.length > 0) {
      console.log('\nPOTENTIAL DOUBLE SCROLL ISSUES:');
      potentialIssues.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));
    } else {
      console.log('\nNo significant double scroll issues detected');
    }

    // Take a screenshot for visual verification
    await page.screenshot({ path: 'test-results/landing-page-full.png', fullPage: true });
    console.log('\nScreenshot saved to test-results/landing-page-full.png');

    expect(true).toBe(true); // This test is for analysis
  });
});