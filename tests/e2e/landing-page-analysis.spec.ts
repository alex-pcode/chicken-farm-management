import { test, expect } from '@playwright/test';

test.describe('LandingPage Scroll Analysis', () => {
  test('detailed scroll behavior analysis', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Get detailed page structure
    const pageInfo = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      
      // Find all elements with potential scroll properties
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
            className: el.className,
            id: el.id,
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight,
            scrollTop: el.scrollTop,
            offsetHeight: el.offsetHeight,
            styles: {
              overflow: styles.overflow,
              overflowY: styles.overflowY,
              height: styles.height,
              maxHeight: styles.maxHeight,
              position: styles.position
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
        scrollableElements,
        bodyStyles: {
          overflow: window.getComputedStyle(body).overflow,
          overflowY: window.getComputedStyle(body).overflowY,
          height: window.getComputedStyle(body).height,
          minHeight: window.getComputedStyle(body).minHeight
        },
        htmlStyles: {
          overflow: window.getComputedStyle(html).overflow,
          overflowY: window.getComputedStyle(html).overflowY,
          height: window.getComputedStyle(html).height,
          minHeight: window.getComputedStyle(html).minHeight
        }
      };
    });

    console.log('=== PAGE SCROLL ANALYSIS ===');
    console.log('Window height:', pageInfo.windowHeight);
    console.log('Document height:', pageInfo.documentHeight);
    console.log('Body height:', pageInfo.bodyHeight);
    console.log('Current scroll Y:', pageInfo.currentScrollY);
    console.log('Body styles:', pageInfo.bodyStyles);
    console.log('HTML styles:', pageInfo.htmlStyles);
    console.log('Scrollable elements count:', pageInfo.scrollableElements.length);
    
    if (pageInfo.scrollableElements.length > 0) {
      console.log('Scrollable elements:', pageInfo.scrollableElements);
    }

    // Test scroll behavior step by step
    console.log('\n=== SCROLL BEHAVIOR TEST ===');
    
    const scrollTest = async (targetY: number) => {
      await page.evaluate((target) => {
        window.scrollTo({ top: target, behavior: 'instant' });
      }, targetY);
      
      await page.waitForTimeout(100);
      
      const actualY = await page.evaluate(() => window.scrollY);
      console.log(`Target: ${targetY}, Actual: ${actualY}, Diff: ${targetY - actualY}`);
      
      return actualY;
    };
    
    // Test different scroll positions
    const maxScroll = pageInfo.documentHeight - pageInfo.windowHeight;
    console.log('Max possible scroll:', maxScroll);
    
    if (maxScroll > 0) {
      await scrollTest(100);
      await scrollTest(500);
      await scrollTest(1000);
      await scrollTest(maxScroll);
    } else {
      console.log('Page does not require scrolling - content fits in viewport');
    }

    // Check for any fixed or sticky elements that might interfere
    const fixedElements = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('*')).map(el => {
        const styles = window.getComputedStyle(el);
        if (styles.position === 'fixed' || styles.position === 'sticky') {
          return {
            tagName: el.tagName,
            className: el.className,
            position: styles.position,
            zIndex: styles.zIndex,
            top: styles.top,
            height: styles.height
          };
        }
        return null;
      }).filter(Boolean);
    });

    console.log('\n=== FIXED/STICKY ELEMENTS ===');
    console.log('Fixed/sticky elements:', fixedElements);

    // Test modal behavior if present
    const hasModal = await page.evaluate(() => {
      const modalElements = document.querySelectorAll('[class*="modal"], [class*="Modal"]');
      return modalElements.length > 0;
    });

    if (hasModal) {
      console.log('\n=== MODAL ELEMENTS DETECTED ===');
      
      // Check if any modals affect scroll
      const modalInfo = await page.evaluate(() => {
        const modals = Array.from(document.querySelectorAll('[class*="modal"], [class*="Modal"]'));
        return modals.map(modal => ({
          className: modal.className,
          display: window.getComputedStyle(modal).display,
          position: window.getComputedStyle(modal).position,
          zIndex: window.getComputedStyle(modal).zIndex
        }));
      });
      
      console.log('Modal info:', modalInfo);
    }

    // Look for the specific LandingPage component structure
    const landingPageStructure = await page.evaluate(() => {
      // Check for main container
      const mainContainer = document.querySelector('.w-full.bg-gray-50.font-fraunces');
      
      if (mainContainer) {
        const sections = Array.from(mainContainer.children).map(section => ({
          tagName: section.tagName,
          className: section.className,
          scrollHeight: section.scrollHeight,
          clientHeight: section.clientHeight,
          styles: {
            overflow: window.getComputedStyle(section).overflow,
            overflowY: window.getComputedStyle(section).overflowY,
            height: window.getComputedStyle(section).height,
            maxHeight: window.getComputedStyle(section).maxHeight
          }
        }));
        
        return {
          found: true,
          containerHeight: mainContainer.scrollHeight,
          sections
        };
      }
      
      return { found: false };
    });

    console.log('\n=== LANDING PAGE STRUCTURE ===');
    console.log('Landing page structure:', landingPageStructure);

    // Final assessment
    console.log('\n=== DOUBLE SCROLL ASSESSMENT ===');
    
    const doubleScrollIssues = [];
    
    // Check for multiple scrollable containers
    if (pageInfo.scrollableElements.length > 2) {
      doubleScrollIssues.push(`Multiple scrollable elements detected: ${pageInfo.scrollableElements.length}`);
    }
    
    // Check for problematic overflow settings
    if (pageInfo.bodyStyles.overflow === 'hidden' && pageInfo.htmlStyles.overflow !== 'hidden') {
      doubleScrollIssues.push('Body has overflow:hidden while HTML does not');
    }
    
    // Check for content height vs document height mismatch
    if (Math.abs(pageInfo.documentHeight - pageInfo.bodyHeight) > 10) {
      doubleScrollIssues.push(`Document/Body height mismatch: ${pageInfo.documentHeight} vs ${pageInfo.bodyHeight}`);
    }

    if (doubleScrollIssues.length > 0) {
      console.log('POTENTIAL ISSUES FOUND:');
      doubleScrollIssues.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));
    } else {
      console.log('No significant double scroll issues detected');
    }

    // This test is for analysis, so we'll always pass but log everything
    expect(true).toBe(true);
  });
});