import { test, expect } from '@playwright/test';

test.describe('Tournaments Page - Mobile Responsive', () => {
  test('should display tournament grid responsively', async ({ page }) => {
    await page.goto('/tournaments');
    await page.waitForLoadState('networkidle');
    
    // Find tournament cards
    const tournamentCards = page.locator('[data-testid="tournament-card"], a[href*="/tournaments/"] > div, [class*="tournament-card"]');
    let cardCount = await tournamentCards.count();
    
    if (cardCount === 0) {
      console.log('No tournament cards found');
      await expect(page).toHaveURL(/\/tournaments/);
      return;
    }
    
    const viewportWidth = page.viewportSize()?.width || 375;
    const firstCard = tournamentCards.first();
    const box = await firstCard.boundingBox();
    
    if (box) {
      if (viewportWidth < 768) {
        // Mobile: 1 column layout
        expect(box.width).toBeGreaterThan(viewportWidth * 0.7);
      } else if (viewportWidth < 1024) {
        // Tablet: 2 columns
        expect(box.width).toBeGreaterThan(viewportWidth * 0.4);
        expect(box.width).toBeLessThan(viewportWidth * 0.6);
      } else {
        // Desktop: 3+ columns
        expect(box.width).toBeLessThan(viewportWidth * 0.4);
      }
    }
    
    // Screenshot
    await page.screenshot({ 
      path: `tests/screenshots/tournaments-${viewportWidth}.png`,
      fullPage: true 
    });
  });

  test('should have no horizontal scroll', async ({ page }) => {
    await page.goto('/tournaments');
    await page.waitForLoadState('networkidle');
    
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
  });

  test('tournament entry buttons should be touch-friendly', async ({ page }) => {
    await page.goto('/tournaments');
    await page.waitForLoadState('networkidle');
    
    // Find entry/join buttons
    const buttons = page.locator('button:has-text("Enter"), button:has-text("Join"), button:has-text("View Details")');
    const buttonCount = await buttons.count();
    
    if (buttonCount === 0) {
      console.log('No tournament entry buttons found');
      return;
    }
    
    const checkCount = Math.min(buttonCount, 5);
    
    for (let i = 0; i < checkCount; i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        
        if (box) {
          // Minimum 44x44px touch target
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('should display tournament status clearly', async ({ page }) => {
    await page.goto('/tournaments');
    await page.waitForLoadState('networkidle');
    
    // Look for status indicators (badges, labels)
    const statusElements = page.locator('[data-testid*="status"], [class*="badge"]:has-text("Active"), [class*="badge"]:has-text("Upcoming"), [class*="badge"]:has-text("Ended")');
    const statusCount = await statusElements.count();
    
    if (statusCount > 0) {
      // At least one status indicator should be visible
      await expect(statusElements.first()).toBeVisible();
    } else {
      console.log('No status indicators found');
    }
  });

  test('tournament cards should have clear call-to-action', async ({ page }) => {
    await page.goto('/tournaments');
    await page.waitForLoadState('networkidle');
    
    const tournamentCards = page.locator('[data-testid="tournament-card"], a[href*="/tournaments/"]');
    const cardCount = await tournamentCards.count();
    
    if (cardCount === 0) {
      console.log('No tournament cards found');
      return;
    }
    
    const firstCard = tournamentCards.first();
    
    // Each card should have at least one interactive element
    const cardButtons = firstCard.locator('button, a');
    const buttonCount = await cardButtons.count();
    
    // Should have at least one CTA per card
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('prize pool information should be readable', async ({ page }) => {
    await page.goto('/tournaments');
    await page.waitForLoadState('networkidle');
    
    // Look for prize pool text
    const prizeElements = page.locator('text=/\\$[0-9]+/, text=/Prize/i, text=/Pool/i, [data-testid*="prize"]');
    const prizeCount = await prizeElements.count();
    
    if (prizeCount > 0) {
      // Prize info should be visible and have reasonable font size
      const firstPrize = prizeElements.first();
      await expect(firstPrize).toBeVisible();
      
      const fontSize = await firstPrize.evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).fontSize);
      });
      
      // Should be readable (at least 12px)
      expect(fontSize).toBeGreaterThan(12);
    }
  });

  test('should navigate to tournament details', async ({ page }) => {
    await page.goto('/tournaments');
    await page.waitForLoadState('networkidle');
    
    const tournamentLinks = page.locator('a[href*="/tournaments/"]');
    const linkCount = await tournamentLinks.count();
    
    if (linkCount === 0) {
      console.log('No tournament links found');
      return;
    }
    
    const firstLink = tournamentLinks.first();
    const href = await firstLink.getAttribute('href');
    
    await firstLink.click();
    
    // Should navigate to tournament detail page
    await expect(page).toHaveURL(new RegExp(href || '/tournaments/'));
    await page.waitForLoadState('networkidle');
    
    // Should have tournament content
    const hasContent = await page.locator('h1, h2, [data-testid="tournament-name"]').count() > 0;
    expect(hasContent).toBe(true);
  });
});
