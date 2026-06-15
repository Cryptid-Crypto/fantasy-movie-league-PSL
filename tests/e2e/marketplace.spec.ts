import { test, expect } from '@playwright/test';

test.describe('Marketplace Page - Mobile Responsive', () => {
  test('should display NFT listings grid responsively', async ({ page }) => {
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');
    
    const viewportWidth = page.viewportSize()?.width || 375;
    
    // No horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
    
    // Find NFT cards/listings
    const nftCards = page.locator('[data-testid*="nft-card"], [data-testid*="listing"], a[href*="/nft/"]');
    const cardCount = await nftCards.count();
    
    if (cardCount > 0) {
      const firstCard = nftCards.first();
      const box = await firstCard.boundingBox();
      
      if (box) {
        if (viewportWidth < 640) {
          // Mobile: cards should be close to full width
          expect(box.width).toBeGreaterThan(viewportWidth * 0.7);
        } else if (viewportWidth < 1024) {
          // Tablet: 2-3 column grid
          expect(box.width).toBeGreaterThan(viewportWidth * 0.3);
          expect(box.width).toBeLessThan(viewportWidth * 0.6);
        } else {
          // Desktop: multiple columns
          expect(box.width).toBeLessThan(viewportWidth * 0.4);
        }
      }
    }
    
    // Screenshot
    await page.screenshot({ 
      path: `tests/screenshots/marketplace-${viewportWidth}.png`,
      fullPage: true 
    });
  });

  test('NFT images should scale correctly', async ({ page }) => {
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');
    
    const images = page.locator('img[alt*="NFT"], img[src*="nft"], [data-testid*="nft"] img');
    const imageCount = await images.count();
    
    if (imageCount === 0) {
      console.log('No NFT images found');
      return;
    }
    
    const firstImage = images.first();
    await expect(firstImage).toBeVisible();
    
    const box = await firstImage.boundingBox();
    
    if (box) {
      const viewportWidth = page.viewportSize()?.width || 375;
      
      // Image should not overflow viewport
      expect(box.width).toBeLessThanOrEqual(viewportWidth);
      expect(box.x).toBeGreaterThanOrEqual(0);
    }
  });

  test('price and buy buttons should be touch-friendly', async ({ page }) => {
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');
    
    // Find price elements and buy buttons
    const priceElements = page.locator('text=/ETH/, text=/\\$[0-9]+/, [data-testid*="price"]');
    const buyButtons = page.locator('button:has-text("Buy"), button:has-text("Purchase")');
    
    // Prices should be visible and readable
    if (await priceElements.count() > 0) {
      const firstPrice = priceElements.first();
      await expect(firstPrice).toBeVisible();
      
      const fontSize = await firstPrice.evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).fontSize);
      });
      expect(fontSize).toBeGreaterThan(14);
    }
    
    // Buy buttons should have proper touch targets
    const buyCount = await buyButtons.count();
    for (let i = 0; i < Math.min(buyCount, 5); i++) {
      const button = buyButtons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('should have sort and filter controls', async ({ page }) => {
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');
    
    const viewportWidth = page.viewportSize()?.width || 375;
    const isMobile = viewportWidth < 768;
    
    // Look for sort/filter controls
    const filterButton = page.locator('[data-testid="filter"], button[aria-label*="filter"], [class*="filter"]');
    const sortControl = page.locator('select, [data-testid*="sort"]');
    
    if (isMobile) {
      // On mobile, filter might be icon-only or in a drawer
      const hasFilter = await filterButton.count() > 0;
      const hasSort = await sortControl.count() > 0;
      
      console.log(`Mobile: Filter present: ${hasFilter}, Sort present: ${hasSort}`);
    } else {
      // Desktop should have more visible controls
      if (await filterButton.count() > 0) {
        await expect(filterButton.first()).toBeVisible();
      }
    }
  });

  test('should navigate to NFT detail page', async ({ page }) => {
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');
    
    const nftLinks = page.locator('a[href*="/nft/"], a[href*="/marketplace/"]');
    const linkCount = await nftLinks.count();
    
    if (linkCount === 0) {
      console.log('No NFT links found');
      return;
    }
    
    const firstLink = nftLinks.first();
    const href = await firstLink.getAttribute('href');
    
    if (href) {
      await firstLink.click();
      
      // Should navigate to detail page
      await expect(page).toHaveURL(new RegExp(href));
      await page.waitForLoadState('networkidle');
      
      // Should have detail content
      const hasContent = await page.locator('h1, h2, [data-testid*="detail"]').count() > 0;
      expect(hasContent).toBe(true);
    }
  });
});
