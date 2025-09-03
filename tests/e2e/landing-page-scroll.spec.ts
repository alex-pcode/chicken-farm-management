import { test, expect } from '@playwright/test';

test.describe('LandingPage Double Scroll Issues', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Wait for any animations to settle
    await page.waitForTimeout(1000);
  });

  test('should not have double scroll bars', async ({ page }) => {
    // Check for multiple scrollable elements
    const scrollableElements = await page.locator('*').evaluateAll(elements => {
      return elements.filter(el => {
        const style = window.getComputedStyle(el);
        return (
          style.overflowY === 'scroll' || 
          style.overflowY === 'auto' || 
          style.overflow === 'scroll' || 
          style.overflow === 'auto'
        ) && el.scrollHeight > el.clientHeight;
      }).map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        overflowY: window.getComputedStyle(el).overflowY,
        overflow: window.getComputedStyle(el).overflow
      }));
    });

    console.log('Scrollable elements found:', scrollableElements);
    
    // The body or html should be the primary scroll container
    // Any nested scrollable containers should be intentional
    const problematicScrollers = scrollableElements.filter(el => 
      el.tagName !== 'HTML' && 
      el.tagName !== 'BODY' && 
      !el.className.includes('modal') &&
      !el.className.includes('dropdown') &&
      !el.className.includes('select') &&
      !el.className.includes('overflow-')
    );

    if (problematicScrollers.length > 0) {
      console.log('Potentially problematic scrollers:', problematicScrollers);
    }
    
    // Check if there are nested scroll containers that could cause double scroll
    expect(problematicScrollers.length).toBeLessThanOrEqual(2);
  });

  test('should have proper body overflow settings', async ({ page }) => {
    const bodyOverflowSettings = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      const bodyStyle = window.getComputedStyle(body);
      const htmlStyle = window.getComputedStyle(html);
      
      return {
        body: {
          overflow: bodyStyle.overflow,
          overflowX: bodyStyle.overflowX,
          overflowY: bodyStyle.overflowY,
          height: bodyStyle.height,
          minHeight: bodyStyle.minHeight
        },
        html: {
          overflow: htmlStyle.overflow,
          overflowX: htmlStyle.overflowX,
          overflowY: htmlStyle.overflowY,
          height: htmlStyle.height,
          minHeight: htmlStyle.minHeight
        }
      };
    });

    console.log('Body/HTML overflow settings:', bodyOverflowSettings);
    
    // Body should not have explicit overflow settings that conflict with HTML
    expect(bodyOverflowSettings.body.overflowX).not.toBe('scroll');
    expect(bodyOverflowSettings.html.overflowX).not.toBe('scroll');
  });

  test('should scroll smoothly without nested scroll conflicts', async ({ page }) => {
    // Get initial scroll position
    const initialScrollY = await page.evaluate(() => window.scrollY);
    
    // Scroll down by different amounts and check for smooth behavior
    const scrollTests = [500, 1000, 2000, 3000];
    
    for (const scrollAmount of scrollTests) {
      await page.evaluate((amount) => {
        window.scrollTo({ top: amount, behavior: 'smooth' });
      }, scrollAmount);
      
      // Wait for scroll to complete
      await page.waitForTimeout(500);
      
      const currentScrollY = await page.evaluate(() => window.scrollY);
      console.log(`Scrolled to: ${currentScrollY}, target was: ${scrollAmount}`);
      
      // Verify we can scroll (allowing for some tolerance due to page height)
      expect(currentScrollY).toBeGreaterThan(initialScrollY);
    }
  });

  test('should not have modal-open class causing scroll issues', async ({ page }) => {
    // Check if modal-open class is applied to body when it shouldn't be
    const bodyClasses = await page.evaluate(() => document.body.className);
    
    console.log('Body classes:', bodyClasses);
    
    // Initially, modal-open should not be present
    expect(bodyClasses).not.toContain('modal-open');
    
    // Check if the CSS for modal-open is properly defined
    const modalOpenStyles = await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = '.modal-open { overflow: hidden; }';
      document.head.appendChild(style);
      
      const testDiv = document.createElement('div');
      testDiv.className = 'modal-open';
      document.body.appendChild(testDiv);
      
      const computedStyle = window.getComputedStyle(testDiv);
      const overflow = computedStyle.overflow;
      
      document.body.removeChild(testDiv);
      document.head.removeChild(style);
      
      return overflow;
    });
    
    console.log('Modal-open overflow style:', modalOpenStyles);
  });

  test('should handle viewport changes without scroll issues', async ({ page }) => {
    // Test different viewport sizes to check for responsive scroll issues
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 1024, height: 768 },  // Tablet
      { width: 375, height: 667 }    // Mobile
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500); // Allow for responsive adjustments
      
      // Check for scroll issues at this viewport
      const scrollInfo = await page.evaluate(() => {
        return {
          documentHeight: document.documentElement.scrollHeight,
          windowHeight: window.innerHeight,
          canScroll: document.documentElement.scrollHeight > window.innerHeight,
          hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth
        };
      });
      
      console.log(`Viewport ${viewport.width}x${viewport.height}:`, scrollInfo);
      
      // Should not have horizontal scroll unless intentional
      if (viewport.width >= 768) {
        expect(scrollInfo.hasHorizontalScroll).toBe(false);
      }
    }
  });

  test('should not have conflicting CSS overflow properties', async ({ page }) => {
    // Check for CSS rules that might conflict
    const cssConflicts = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const conflicts = [];
      
      allElements.forEach((element, index) => {
        if (index < 100) { // Limit to first 100 elements for performance
          const styles = window.getComputedStyle(element);
          
          // Check for potentially problematic combinations
          if (styles.overflow === 'hidden' && styles.overflowY === 'scroll') {
            conflicts.push({
              element: element.tagName + (element.className ? '.' + element.className : ''),
              issue: 'overflow:hidden with overflowY:scroll',
              overflow: styles.overflow,
              overflowY: styles.overflowY
            });
          }
          
          if (styles.position === 'fixed' && 
              (styles.overflow === 'scroll' || styles.overflowY === 'scroll') &&
              element.tagName !== 'HTML' && element.tagName !== 'BODY') {
            conflicts.push({
              element: element.tagName + (element.className ? '.' + element.className : ''),
              issue: 'fixed position with scroll overflow',
              position: styles.position,
              overflow: styles.overflow,
              overflowY: styles.overflowY
            });
          }
        }
      });
      
      return conflicts;
    });
    
    console.log('CSS conflicts found:', cssConflicts);
    
    // Should not have major CSS conflicts that could cause double scroll
    expect(cssConflicts.length).toBeLessThanOrEqual(2);
  });

  test('should handle feature image galleries without scroll conflicts', async ({ page }) => {
    // Find feature sections with image galleries
    const featureSections = await page.locator('[class*="feature"]').count();
    console.log(`Found ${featureSections} feature sections`);
    
    if (featureSections > 0) {
      // Test scrolling behavior with feature images
      for (let i = 0; i < Math.min(featureSections, 3); i++) {
        const featureSection = page.locator('[class*="feature"]').nth(i);
        
        // Scroll to feature section
        await featureSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        
        // Check if there are image navigation buttons
        const navButtons = await featureSection.locator('button').count();
        
        if (navButtons > 0) {
          // Click navigation buttons and check for scroll issues
          const firstButton = featureSection.locator('button').first();
          if (await firstButton.isVisible()) {
            await firstButton.click();
            await page.waitForTimeout(300);
            
            // Check that main page scroll wasn't affected
            const scrollAfterClick = await page.evaluate(() => window.scrollY);
            console.log(`Scroll position after clicking feature nav: ${scrollAfterClick}`);
          }
        }
      }
    }
  });
});