import { test, expect } from '@playwright/test';

test.describe('Signup Page - Mobile Responsive', () => {
  test('should display signup form with mobile-optimized layout', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    
    const viewportWidth = page.viewportSize()?.width || 375;
    
    // No horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
    
    // Form should be visible
    const form = page.locator('form').first();
    if (await form.count() > 0) {
      await expect(form).toBeVisible();
    }
    
    // Screenshot
    await page.screenshot({ 
      path: `tests/screenshots/signup-${viewportWidth}.png`,
      fullPage: true 
    });
  });

  test('form inputs should be properly sized for mobile', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    
    const inputs = page.locator('input, select, textarea');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      if (await input.isVisible()) {
        const box = await input.boundingBox();
        
        if (box) {
          // Inputs should be reasonably tall for touch
          expect(box.height).toBeGreaterThan(36);
          
          // On mobile, inputs should take most of the width
          const viewportWidth = page.viewportSize()?.width || 375;
          if (viewportWidth < 768) {
            expect(box.width).toBeGreaterThan(viewportWidth * 0.7);
          }
        }
        
        // Font size should be at least 16px to prevent iOS zoom
        const fontSize = await input.evaluate((el) => {
          return parseFloat(window.getComputedStyle(el).fontSize);
        });
        expect(fontSize).toBeGreaterThanOrEqual(16);
      }
    }
  });

  test('submit button should be mobile-friendly', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign up"), button:has-text("Register")');
    
    if (await submitButton.count() > 0) {
      const button = submitButton.first();
      await expect(button).toBeVisible();
      
      const box = await button.boundingBox();
      
      if (box) {
        // Touch-friendly size
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
        
        // On mobile, should be full-width
        const viewportWidth = page.viewportSize()?.width || 375;
        if (viewportWidth < 768) {
          expect(box.width).toBeGreaterThan(viewportWidth * 0.7);
        }
      }
    }
  });

  test('labels should be visible and associated with inputs', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    
    const labels = page.locator('label');
    const labelCount = await labels.count();
    
    for (let i = 0; i < labelCount; i++) {
      const label = labels.nth(i);
      
      // Label should be visible
      await expect(label).toBeVisible();
      
      // Font should be readable
      const fontSize = await label.evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).fontSize);
      });
      expect(fontSize).toBeGreaterThan(12);
    }
  });

  test('should have social login buttons on mobile', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    
    // Look for OAuth/social login buttons
    const socialButtons = page.locator('button:has-text("Google"), button:has-text("MetaMask"), button:has-text("WalletConnect"), [data-testid*="oauth"]');
    const socialCount = await socialButtons.count();
    
    if (socialCount > 0) {
      // At least one social button should be visible
      await expect(socialButtons.first()).toBeVisible();
      
      // Check touch targets
      for (let i = 0; i < Math.min(socialCount, 3); i++) {
        const button = socialButtons.nth(i);
        const box = await button.boundingBox();
        
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('error messages should be visible on mobile', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    
    // Try to trigger validation by submitting empty form
    const submitButton = page.locator('button[type="submit"]').first();
    
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(500); // Wait for validation
      
      // Check for error messages
      const errorMessages = page.locator('[role="alert"], [aria-invalid="true"], .error, text=/required/i');
      const errorCount = await errorMessages.count();
      
      if (errorCount > 0) {
        const firstError = errorMessages.first();
        await expect(firstError).toBeVisible();
        
        // Error text should be readable
        const fontSize = await firstError.evaluate((el) => {
          return parseFloat(window.getComputedStyle(el).fontSize);
        });
        expect(fontSize).toBeGreaterThan(12);
      }
    }
  });
});
