# End-to-End Tests

Mobile responsive design testing using Playwright for the Fantasy Movie League platform.

## Setup

Playwright and browsers are already installed in the project.

## Running Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run tests with UI mode (interactive)
pnpm test:e2e:ui

# Run tests with visible browser
pnpm test:e2e:headed

# Run only mobile tests
pnpm test:e2e:mobile

# Run only tablet tests
pnpm test:e2e:tablet

# Run only desktop tests
pnpm test:e2e:desktop

# View HTML test report
pnpm test:e2e:report
```

## Test Coverage

### Pages Tested
- **Home** (`home.spec.ts`) - Landing page, hero section, navigation
- **Performers** (`performers.spec.ts`) - Performer cards grid, search, detail navigation
- **Tournaments** (`tournaments.spec.ts`) - Tournament listings, status indicators, detail pages
- **Dashboard** (`dashboard.spec.ts`) - User dashboard, portfolio view
- **Marketplace** (`marketplace.spec.ts`) - NFT listings, prices, buy buttons
- **Signup** (`signup.spec.ts`) - Registration form, validation, social login

### Device Emulators
- **Mobile**: iPhone SE (375px), iPhone 13 Pro (390px), Pixel 5 (393px)
- **Tablet**: iPad Mini (768px), iPad Pro 11 (834px)
- **Desktop**: Chrome (1280px)

## Test Scenarios

Each test file covers:

1. **Layout** - Responsive grid columns, no horizontal scroll
2. **Navigation** - Hamburger menu on mobile, full nav on desktop
3. **Touch Targets** - Buttons and links minimum 44x44px
4. **Typography** - Font sizes scale appropriately
5. **Images** - Proper scaling, no overflow
6. **Forms** - Mobile-optimized inputs (16px+ font to prevent iOS zoom)
7. **Interactions** - Navigation links work, forms submit

## Visual Regression

Screenshots are automatically saved to `tests/screenshots/` on test failures.

To capture baseline screenshots, run:
```bash
pnpm test:e2e --update-snapshots
```

## Adding New Tests

Create a new file in `tests/e2e/` following the pattern:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Page Name - Mobile Responsive', () => {
  test('should display correctly on mobile', async ({ page }) => {
    await page.goto('/your-page');
    await page.waitForLoadState('networkidle');
    
    // Your test logic here
    await expect(page.locator('selector')).toBeVisible();
    
    // Screenshot for visual regression
    await page.screenshot({ 
      path: `tests/screenshots/your-page-${page.viewportSize()?.width}.png`,
      fullPage: true 
    });
  });
});
```

## Troubleshooting

### Tests fail due to authentication
Some pages require login. Update tests to handle auth redirects gracefully.

### Dev server won't start
Check that port 5173 is free, or update `baseURL` in `playwright.config.ts`.

### Browser not found
Reinstall: `npx playwright install`

## CI/CD Integration

The tests are configured to:
- Run on all 6 device emulators
- Retry failed tests (2 retries in CI)
- Generate HTML reports
- Capture screenshots on failure

Add to your CI pipeline:
```yaml
- run: pnpm test:e2e
- uses: actions/upload-artifact@v3
  if: failure()
  with:
    name: playwright-report
    path: playwright-report/
```
