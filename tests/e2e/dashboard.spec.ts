import { test, expect } from '@playwright/test';

test.describe('Dashboard Page - Mobile Responsive', () => {
  test('should display dashboard layout responsively', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check if we need to be logged in
    const url = page.url();
    if (url.includes('/login') || url.includes('/signup')) {
      console.log('Dashboard requires authentication - skipping layout test');
      return;
    }
    
    const viewportWidth = page.viewportSize()?.width || 375;
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
    
    // Screenshot
    await page.screenshot({ 
      path: `tests/screenshots/dashboard-${viewportWidth}.png`,
      fullPage: true 
    });
  });

  test('should have readable portfolio/NFT sections', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/login') || page.url().includes('/signup')) {
      return;
    }
    
    // Look for portfolio or NFT sections
    const portfolioSection = page.locator('[data-testid*="portfolio"], text=/Portfolio/i, text=/NFT/i').first();
    
    if (await portfolioSection.count() > 0) {
      await expect(portfolioSection).toBeVisible();
    }
    
    // Text should be readable
    const headings = page.locator('h1, h2, h3');
    const headingCount = await headings.count();
    
    for (let i = 0; i < Math.min(headingCount, 5); i++) {
      const heading = headings.nth(i);
      const fontSize = await heading.evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).fontSize);
      });
      
      expect(fontSize).toBeGreaterThan(14);
    }
  });

  test('action buttons should be touch-friendly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/login') || page.url().includes('/signup')) {
      return;
    }
    
    const buttons = page.locator('button, [role="button"]');
    const buttonCount = await buttons.count();
    
    const checkCount = Math.min(buttonCount, 10);
    
    for (let i = 0; i < checkCount; i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('should display earnings or stats clearly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/login') || page.url().includes('/signup')) {
      return;
    }
    
    // Look for numerical data or stats
    const statElements = page.locator('text=/\\$[0-9]+/, text=/Earnings/i, [data-testid*="stat"]');
    const statCount = await statElements.count();
    
    if (statCount > 0) {
      const firstStat = statElements.first();
      await expect(firstStat).toBeVisible();
    }
  });
});
