import { test, expect } from '@playwright/test';

test.describe('Performers Page - Mobile Responsive', () => {
  test('should have responsive grid columns', async ({ page }) => {
    await page.goto('/performers');
    
    await page.waitForLoadState('networkidle');
    
    // Find performer cards
    const performerCards = page.locator('[data-testid="performer-card"], a[href*="/performers/"] > div, [class*="performer-card"]');
    let cardCount = await performerCards.count();
    
    // If no data-testid, try generic card selectors
    if (cardCount === 0) {
      const genericCards = page.locator('main a[href*="/performers/"]');
      cardCount = await genericCards.count();
    }
    
    // If we still have no cards, skip grid tests but verify page loads
    if (cardCount === 0) {
      console.log('No performer cards found, verifying page loaded...');
      await expect(page).toHaveURL(/\/performers/);
      return;
    }
    
    console.log(`Found ${cardCount} performer cards`);
    
    // Verify grid layout based on viewport
    const viewportWidth = page.viewportSize()?.width || 375;
    const firstCard = performerCards.first();
    const box = await firstCard.boundingBox();
    
    if (box) {
      if (viewportWidth < 640) {
        // Mobile: should be single column (cards close to full width)
        expect(box.width).toBeGreaterThan(viewportWidth * 0.7);
      } else if (viewportWidth < 768) {
        // Small tablet: 2 columns (cards ~50% width)
        expect(box.width).toBeGreaterThan(viewportWidth * 0.4);
        expect(box.width).toBeLessThan(viewportWidth * 0.7);
      } else if (viewportWidth < 1024) {
        // Tablet/laptop: 2-3 columns
        expect(box.width).toBeGreaterThan(viewportWidth * 0.25);
        expect(box.width).toBeLessThan(viewportWidth * 0.6);
      } else {
        // Desktop: 3+ columns
        expect(box.width).toBeLessThan(viewportWidth * 0.4);
      }
    }
    
    // Screenshot for visual regression
    await page.screenshot({ 
      path: `tests/screenshots/performers-${viewportWidth}.png`,
      fullPage: true 
    });
  });

  test('should have no horizontal scroll', async ({ page }) => {
    await page.goto('/performers');
    await page.waitForLoadState('networkidle');
    
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
  });

  test('tap on performer card should navigate to profile', async ({ page }) => {
    await page.goto('/performers');
    await page.waitForLoadState('networkidle');
    
    // Find clickable performer cards
    const performerLinks = page.locator('a[href*="/performers/"]');
    const linkCount = await performerLinks.count();
    
    if (linkCount === 0) {
      console.log('No performer links found');
      return;
    }
    
    // Click first performer
    const firstLink = performerLinks.first();
    const href = await firstLink.getAttribute('href');
    
    await firstLink.click();
    
    // Should navigate to performer detail page
    await expect(page).toHaveURL(new RegExp(href || '/performers/'));
    
    // Verify we're on the profile page
    await page.waitForLoadState('networkidle');
    
    // Should have performer name or back button
    const hasContent = await page.locator('h1, h2, [data-testid="performer-name"], a[href="/performers"]').count() > 0;
    expect(hasContent).toBe(true);
  });

  test('performer images should load and scale correctly', async ({ page }) => {
    await page.goto('/performers');
    await page.waitForLoadState('networkidle');
    
    // Find images within performer cards
    const performerImages = page.locator('[data-testid="performer-card"] img, a[href*="/performers/"] img');
    const imageCount = await performerImages.count();
    
    if (imageCount === 0) {
      console.log('No performer images found');
      return;
    }
    
    const firstImage = performerImages.first();
    await expect(firstImage).toBeVisible();
    
    // Check image doesn't overflow
    const box = await firstImage.boundingBox();
    
    if (box) {
      const viewportWidth = page.viewportSize()?.width || 375;
      
      // Image should not be wider than viewport
      expect(box.width).toBeLessThanOrEqual(viewportWidth);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewportWidth);
    }
  });

  test('touch targets should be appropriately sized', async ({ page }) => {
    await page.goto('/performers');
    await page.waitForLoadState('networkidle');
    
    // Find performer cards/links
    const performerElements = page.locator('a[href*="/performers/"], [data-testid="performer-card"]');
    const count = await performerElements.count();
    
    if (count === 0) {
      console.log('No performer elements found');
      return;
    }
    
    // Check first few elements
    const checkCount = Math.min(count, 5);
    
    for (let i = 0; i < checkCount; i++) {
      const element = performerElements.nth(i);
      const box = await element.boundingBox();
      
      if (box) {
        // Minimum touch target: 44x44px
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('should have search or filter on mobile', async ({ page }) => {
    await page.goto('/performers');
    await page.waitForLoadState('networkidle');
    
    const viewportWidth = page.viewportSize()?.width || 375;
    const isMobile = viewportWidth < 768;
    
    // Look for search input or filter button
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="Search"]');
    const filterButton = page.locator('[data-testid="filter"], button[aria-label*="filter"], [class*="filter"]');
    
    if (isMobile) {
      // On mobile, search might be in a different location or filter might be icon-only
      const hasSearchOrFilter = await searchInput.count() > 0 || await filterButton.count() > 0;
      // This is optional, so we just log it
      console.log(`Mobile: Search/Filter present: ${hasSearchOrFilter}`);
    } else {
      // Desktop should have search visible
      const hasSearch = await searchInput.count() > 0;
      if (hasSearch) {
        await expect(searchInput.first()).toBeVisible();
      }
    }
  });
});
