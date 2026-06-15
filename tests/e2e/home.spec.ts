import { test, expect } from '@playwright/test';

test.describe('Home Page - Mobile Responsive', () => {
  test('should display single column layout on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Verify hero section is visible
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify no horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
    
    // Check for tournament cards (if any exist)
    const tournamentCards = page.locator('[data-testid="tournament-card"]');
    const cardCount = await tournamentCards.count();
    
    if (cardCount > 0) {
      // On mobile, cards should be full-width
      const firstCard = tournamentCards.first();
      const box = await firstCard.boundingBox();
      
      if (box) {
        const viewportWidth = page.viewportSize()?.width || 375;
        // Card should use most of the viewport width (>80%)
        expect(box.width).toBeGreaterThan(viewportWidth * 0.8);
      }
    }
    
    // Take screenshot for visual regression
    const viewportWidth = page.viewportSize()?.width || 'unknown';
    await page.screenshot({ 
      path: `tests/screenshots/home-mobile-${viewportWidth}.png`,
      fullPage: true 
    });
  });

  test('should show hamburger menu on mobile devices', async ({ page }) => {
    await page.goto('/');
    
    // Check if we're on mobile viewport
    const viewportWidth = page.viewportSize()?.width || 1920;
    const isMobile = viewportWidth < 768;
    
    if (isMobile) {
      // Hamburger menu should be visible
      const hamburger = page.locator('[data-testid="hamburger-menu"], button[aria-label*="menu"], nav button');
      await expect(hamburger).toBeVisible();
      
      // Desktop nav should be hidden
      const desktopNav = page.locator('[data-testid="desktop-nav"]');
      if (await desktopNav.count() > 0) {
        await expect(desktopNav).toBeHidden();
      }
      
      // Click hamburger to open drawer
      await hamburger.first().click();
      await page.waitForTimeout(500); // Wait for animation
      
      // Verify drawer or mobile nav is open
      const drawer = page.locator('[data-testid="mobile-nav-drawer"], [role="dialog"], nav[aria-label="mobile"]');
      if (await drawer.count() > 0) {
        await expect(drawer).toBeVisible();
      }
      
      // Check navigation links are present
      const navLinks = page.locator('nav a[href]');
      const linkCount = await navLinks.count();
      expect(linkCount).toBeGreaterThan(0);
      
      // Verify key navigation links exist
      const performersLink = page.locator('a[href*="/performers"]');
      const tournamentsLink = page.locator('a[href*="/tournaments"]');
      
      expect(await performersLink.count() + await tournamentsLink.count()).toBeGreaterThan(0);
    } else {
      // On desktop, all nav links should be visible
      const navLinks = page.locator('nav a[href]');
      const linkCount = await navLinks.count();
      expect(linkCount).toBeGreaterThan(0);
    }
  });

  test('should have proper typography scaling', async ({ page }) => {
    await page.goto('/');
    
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    
    // Get computed font size
    const fontSize = await h1.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });
    
    // Font size should be reasonable for the viewport
    const sizeValue = parseFloat(fontSize);
    const viewportWidth = page.viewportSize()?.width || 375;
    
    if (viewportWidth < 768) {
      // Mobile: should be between 24-48px
      expect(sizeValue).toBeGreaterThan(20);
      expect(sizeValue).toBeLessThan(60);
    } else {
      // Desktop: should be larger
      expect(sizeValue).toBeGreaterThan(30);
    }
  });

  test('should have touch-friendly buttons', async ({ page }) => {
    await page.goto('/');
    
    // Find all buttons on the page
    const buttons = page.locator('button, [role="button"], a[class*="button"]');
    const buttonCount = await buttons.count();
    
    // Check at least some buttons
    const checkCount = Math.min(buttonCount, 10);
    
    for (let i = 0; i < checkCount; i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      
      if (box) {
        // Minimum touch target: 44x44px (Apple HIG)
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('should navigate to main sections', async ({ page }) => {
    await page.goto('/');
    
    // Find and click performers link
    const performersLink = page.locator('a[href="/performers"]').first();
    if (await performersLink.count() > 0) {
      await performersLink.click();
      await expect(page).toHaveURL(/\/performers/);
      await page.goBack();
    }
    
    // Find and click tournaments link
    const tournamentsLink = page.locator('a[href="/tournaments"]').first();
    if (await tournamentsLink.count() > 0) {
      await tournamentsLink.click();
      await expect(page).toHaveURL(/\/tournaments/);
    }
  });
});
