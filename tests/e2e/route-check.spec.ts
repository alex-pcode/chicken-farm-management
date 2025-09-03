import { test, expect } from '@playwright/test';

test.describe('Route and Component Loading Test', () => {
  test('check what loads at root path', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check what components are actually rendered
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        bodyContent: document.body.innerText.substring(0, 500),
        rootContent: document.getElementById('root')?.innerHTML.substring(0, 500) || 'No root element',
        hasLandingPageClass: !!document.querySelector('.w-full.bg-gray-50.font-fraunces'),
        hasAuthElements: !!document.querySelector('[class*="auth"], [class*="Auth"], [class*="login"], [class*="Login"]'),
        hasDashboard: !!document.querySelector('[class*="dashboard"], [class*="Dashboard"]'),
        allClassNames: Array.from(document.querySelectorAll('*'))
          .map(el => el.className)
          .filter(cls => cls && typeof cls === 'string' && cls.length > 0)
          .slice(0, 20),
        mainElements: Array.from(document.querySelectorAll('main, section, div')).slice(0, 10).map(el => ({
          tagName: el.tagName,
          className: el.className.substring(0, 100),
          id: el.id,
          textContent: el.textContent?.substring(0, 100) || ''
        }))
      };
    });

    console.log('=== PAGE CONTENT ANALYSIS ===');
    console.log('Title:', pageContent.title);
    console.log('Has Landing Page:', pageContent.hasLandingPageClass);
    console.log('Has Auth Elements:', pageContent.hasAuthElements);
    console.log('Has Dashboard:', pageContent.hasDashboard);
    console.log('\nBody content preview:');
    console.log(pageContent.bodyContent);
    console.log('\nRoot content preview:');
    console.log(pageContent.rootContent);
    console.log('\nMain elements:');
    pageContent.mainElements.forEach((el, i) => {
      console.log(`${i + 1}. ${el.tagName}${el.className ? '.' + el.className.split(' ')[0] : ''}${el.id ? '#' + el.id : ''}`);
      if (el.textContent) console.log(`   Text: "${el.textContent}"`);
    });
    console.log('\nClass names found:');
    pageContent.allClassNames.slice(0, 10).forEach(cls => console.log(`  - ${cls}`));

    // Check the URL and any redirects
    const currentUrl = page.url();
    console.log('\nCurrent URL:', currentUrl);

    // Take a screenshot to see what's actually displayed
    await page.screenshot({ path: 'test-results/actual-page-content.png' });
    console.log('Screenshot saved to test-results/actual-page-content.png');

    expect(true).toBe(true);
  });

  test('check for specific LandingPage text content', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Look for specific LandingPage content
    const landingPageMarkers = await page.evaluate(() => {
      const textContent = document.body.innerText.toLowerCase();
      return {
        hasChickenChaos: textContent.includes('chicken chaos'),
        hasCrystalClear: textContent.includes('crystal-clear insights'),
        hasEggCounts: textContent.includes('egg counts'),
        hasFeedCosts: textContent.includes('feed costs'),
        hasFlockHealth: textContent.includes('flock health'),
        hasStartTracking: textContent.includes('start tracking'),
        fullText: textContent.substring(0, 1000)
      };
    });

    console.log('=== LANDING PAGE TEXT ANALYSIS ===');
    console.log('Has "chicken chaos":', landingPageMarkers.hasChickenChaos);
    console.log('Has "crystal-clear insights":', landingPageMarkers.hasCrystalClear);
    console.log('Has "egg counts":', landingPageMarkers.hasEggCounts);
    console.log('Has "feed costs":', landingPageMarkers.hasFeedCosts);
    console.log('Has "flock health":', landingPageMarkers.hasFlockHealth);
    console.log('Has "start tracking":', landingPageMarkers.hasStartTracking);
    console.log('\nFull text preview:');
    console.log(landingPageMarkers.fullText);

    const hasLandingContent = Object.values(landingPageMarkers).slice(0, -1).some(Boolean);
    console.log('\nLanding page content detected:', hasLandingContent);

    expect(true).toBe(true);
  });
});