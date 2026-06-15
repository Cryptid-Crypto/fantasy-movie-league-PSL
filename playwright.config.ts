import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'Mobile - iPhone SE',
      use: { ...devices['iPhone SE'] },
    },
    {
      name: 'Mobile - iPhone 13 Pro',
      use: { ...devices['iPhone 13 Pro'] },
    },
    {
      name: 'Mobile - Pixel 5',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Tablet - iPad Mini',
      use: { ...devices['iPad Mini'] },
    },
    {
      name: 'Tablet - iPad Pro 11',
      use: { ...devices['iPad Pro 11'] },
    },
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
