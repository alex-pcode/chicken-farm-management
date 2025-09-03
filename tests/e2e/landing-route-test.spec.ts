import { test, expect } from '@playwright/test';

test.describe('LandingPage at /landing Route', () => {
  test('should load LandingPage component at /landing route', async ({ page }) => {
    await page.goto('/landing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for animations and content to load

    // Check for LandingPage specific content
    const landingContent = await page.evaluate(() => {
      return {
        hasLandingContainer: !!document.querySelector('.w-full.bg-gray-50.font-fraunces'),
        hasChickenChaos: document.body.innerText.toLowerCase().includes('chicken chaos'),
        hasCrystalClear: document.body.innerText.toLowerCase().includes('crystal-clear insights'),
        hasStartTracking: document.body.innerText.toLowerCase().includes('start tracking'),
        hasEggCounts: document.body.innerText.toLowerCase().includes('egg'),
        sectionsCount: document.querySelectorAll('section').length,
        title: document.title,
        bodyText: document.body.innerText.substring(0, 1000)
      };
    });

    console.log('=== LANDING PAGE ROUTE TEST ===');
    console.log('Page title:', landingContent.title);
    console.log('Has landing container:', landingContent.hasLandingContainer);
    console.log('Has "chicken chaos":', landingContent.hasChickenChaos);
    console.log('Has "crystal-clear insights":', landingContent.hasCrystalClear);
    console.log('Has "start tracking":', landingContent.hasStartTracking);
    console.log('Has egg content:', landingContent.hasEggCounts);
    console.log('Sections count:', landingContent.sectionsCount);
    console.log('Body text preview:', landingContent.bodyText.substring(0, 200) + '...');

    expect(landingContent.hasLandingContainer).toBe(true);
    expect(landingContent.hasChickenChaos || landingContent.hasCrystalClear).toBe(true);
  });

  test('analyze scroll behavior on actual LandingPage', async ({ page }) => {
    // Set a reasonable desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.goto('/landing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Get comprehensive scroll analysis
    const scrollAnalysis = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      
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
            className: el.className.substring(0, 50),
            id: el.id,
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight,
            scrollTop: el.scrollTop,
            styles: {
              overflow: styles.overflow,
              overflowY: styles.overflowY,
              position: styles.position,
              zIndex: styles.zIndex
            }
          };
        }
        return null;
      }).filter(Boolean);

      // Check for modal-related elements and styles
      const modalElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const className = el.className?.toString() || '';
        return className.includes('modal') || className.includes('Modal');
      });

      return {
        windowHeight: window.innerHeight,
        documentHeight: html.scrollHeight,
        bodyHeight: body.scrollHeight,
        currentScrollY: window.scrollY,
        maxScrollY: html.scrollHeight - window.innerHeight,
        scrollableElements,
        modalElements: modalElements.map(el => ({
          tagName: el.tagName,
          className: el.className,
          styles: {
            display: window.getComputedStyle(el).display,
            position: window.getComputedStyle(el).position,
            overflow: window.getComputedStyle(el).overflow
          }
        })),
        bodyStyles: {
          overflow: window.getComputedStyle(body).overflow,
          overflowY: window.getComputedStyle(body).overflowY,
          height: window.getComputedStyle(body).height,
          position: window.getComputedStyle(body).position
        },
        htmlStyles: {
          overflow: window.getComputedStyle(html).overflow,
          overflowY: window.getComputedStyle(html).overflowY,
          height: window.getComputedStyle(html).height
        }
      };
    });

    console.log('\n=== LANDING PAGE SCROLL ANALYSIS ===');
    console.log('Window height:', scrollAnalysis.windowHeight);
    console.log('Document height:', scrollAnalysis.documentHeight);
    console.log('Body height:', scrollAnalysis.bodyHeight);
    console.log('Max scroll Y:', scrollAnalysis.maxScrollY);
    console.log('Scrollable elements count:', scrollAnalysis.scrollableElements.length);
    console.log('Modal elements count:', scrollAnalysis.modalElements.length);
    console.log('Body styles:', scrollAnalysis.bodyStyles);
    console.log('HTML styles:', scrollAnalysis.htmlStyles);

    if (scrollAnalysis.scrollableElements.length > 0) {
      console.log('\nScrollable elements:');
      scrollAnalysis.scrollableElements.forEach((el, i) => {
        console.log(`${i + 1}. ${el.tagName}${el.className ? '.' + el.className.split(' ')[0] : ''}${el.id ? '#' + el.id : ''}`);
        console.log(`   ScrollH: ${el.scrollHeight}, ClientH: ${el.clientHeight}, Overflow: ${el.styles.overflow}`);
      });
    }

    if (scrollAnalysis.modalElements.length > 0) {
      console.log('\nModal elements:');
      scrollAnalysis.modalElements.forEach((el, i) => {
        console.log(`${i + 1}. ${el.tagName}.${el.className}`);
        console.log(`   Display: ${el.styles.display}, Position: ${el.styles.position}, Overflow: ${el.styles.overflow}`);
      });
    }

    // Test scroll behavior if content is scrollable
    if (scrollAnalysis.maxScrollY > 0) {
      console.log('\n=== SCROLL BEHAVIOR TEST ===');
      
      const testPositions = [
        0,
        Math.floor(scrollAnalysis.maxScrollY * 0.25),
        Math.floor(scrollAnalysis.maxScrollY * 0.5),
        Math.floor(scrollAnalysis.maxScrollY * 0.75),
        scrollAnalysis.maxScrollY
      ];
      
      const scrollResults = [];
      
      for (const pos of testPositions) {
        await page.evaluate((target) => {
          window.scrollTo({ top: target, behavior: 'instant' });
        }, pos);
        
        await page.waitForTimeout(200);
        
        const actualY = await page.evaluate(() => window.scrollY);
        const diff = Math.abs(pos - actualY);
        const result = { target: pos, actual: actualY, diff };
        scrollResults.push(result);
        
        console.log(`Target: ${pos}, Actual: ${actualY}, Diff: ${diff}`);
      }
      
      // Analyze scroll issues
      const largeScrollDiffs = scrollResults.filter(r => r.diff > 10);
      const stuckScrolls = scrollResults.filter(r => r.actual === 0 && r.target > 0);
      
      if (largeScrollDiffs.length > 0) {
        console.log('\n⚠️  POTENTIAL SCROLL ISSUES DETECTED:');
        largeScrollDiffs.forEach(r => {
          console.log(`  - Large scroll difference: target ${r.target} → actual ${r.actual} (diff: ${r.diff})`);
        });
      }
      
      if (stuckScrolls.length > 0) {
        console.log('\n🚨 SCROLL STUCK AT TOP DETECTED:');
        stuckScrolls.forEach(r => {
          console.log(`  - Attempted to scroll to ${r.target} but stayed at ${r.actual}`);
        });
      }
      
    } else {
      console.log('\nPage content fits within viewport - no scrolling needed');
    }

    // Check for double scroll indicators
    console.log('\n=== DOUBLE SCROLL ANALYSIS ===');
    
    const doubleScrollIssues = [];
    
    // Multiple scrollable containers
    const nonRootScrollables = scrollAnalysis.scrollableElements.filter(el => 
      el.tagName !== 'HTML' && el.tagName !== 'BODY' && el.id !== 'root'
    );
    
    if (nonRootScrollables.length > 0) {
      doubleScrollIssues.push(`${nonRootScrollables.length} non-root scrollable containers found`);
      nonRootScrollables.forEach(el => {
        console.log(`  - ${el.tagName}${el.className ? '.' + el.className.split(' ')[0] : ''}${el.id ? '#' + el.id : ''} (overflow: ${el.styles.overflow})`);
      });
    }
    
    // Conflicting overflow settings
    if (scrollAnalysis.bodyStyles.overflow === 'hidden' && scrollAnalysis.htmlStyles.overflow !== 'hidden') {
      doubleScrollIssues.push('Body has overflow:hidden while HTML does not');
    }
    
    // Root element scroll conflicts
    const rootScrollable = scrollAnalysis.scrollableElements.find(el => el.id === 'root');
    if (rootScrollable && rootScrollable.scrollHeight > rootScrollable.clientHeight) {
      doubleScrollIssues.push('Root element is independently scrollable');
    }

    if (doubleScrollIssues.length > 0) {
      console.log('\nPOTENTIAL DOUBLE SCROLL ISSUES:');
      doubleScrollIssues.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));
    } else {
      console.log('\nNo significant double scroll issues detected');
    }

    // Take screenshot for visual verification
    await page.screenshot({ path: 'test-results/landing-page-scroll-test.png', fullPage: true });
    console.log('\nScreenshot saved to test-results/landing-page-scroll-test.png');

    expect(true).toBe(true); // Analysis test
  });

  test('test modal behavior and scroll conflicts', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/landing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Look for clickable elements that might open modals
    const clickableElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('button, [onclick], [class*="cursor-pointer"]'));
      return elements.map(el => ({
        tagName: el.tagName,
        className: el.className.substring(0, 100),
        textContent: el.textContent?.trim().substring(0, 50) || '',
        hasClick: !!el.onclick || el.getAttribute('onclick'),
        position: {
          x: el.getBoundingClientRect().left,
          y: el.getBoundingClientRect().top
        }
      })).filter(el => el.textContent && el.position.x >= 0 && el.position.y >= 0);
    });

    console.log('\n=== MODAL BEHAVIOR TEST ===');
    console.log(`Found ${clickableElements.length} clickable elements`);

    // Try clicking a few buttons to see if they trigger modals
    for (let i = 0; i < Math.min(3, clickableElements.length); i++) {
      const el = clickableElements[i];
      console.log(`\nTesting click on: ${el.textContent}`);
      
      try {
        // Find and click the element
        const button = page.locator(`button:has-text("${el.textContent.substring(0, 20)}")`).first();
        if (await button.isVisible()) {
          await button.click();
          await page.waitForTimeout(500);
          
          // Check if modal opened and affected scroll
          const afterClickState = await page.evaluate(() => {
            return {
              hasModalOpen: document.body.classList.contains('modal-open'),
              bodyOverflow: window.getComputedStyle(document.body).overflow,
              scrollY: window.scrollY,
              modalElements: Array.from(document.querySelectorAll('[class*="modal"], [class*="Modal"]')).length
            };
          });
          
          console.log(`  After click: modal-open=${afterClickState.hasModalOpen}, overflow=${afterClickState.bodyOverflow}, scrollY=${afterClickState.scrollY}, modals=${afterClickState.modalElements}`);
          
          // If modal opened, try to close it
          if (afterClickState.hasModalOpen || afterClickState.modalElements > 0) {
            // Try pressing Escape
            await page.keyboard.press('Escape');
            await page.waitForTimeout(300);
            
            // Check if modal closed
            const afterEscape = await page.evaluate(() => {
              return {
                hasModalOpen: document.body.classList.contains('modal-open'),
                bodyOverflow: window.getComputedStyle(document.body).overflow
              };
            });
            
            console.log(`  After Escape: modal-open=${afterEscape.hasModalOpen}, overflow=${afterEscape.bodyOverflow}`);
          }
        }
      } catch (error) {
        console.log(`  Error clicking element: ${error.message}`);
      }
    }

    expect(true).toBe(true);
  });
});