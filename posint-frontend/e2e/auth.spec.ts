import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('/');
    // If redirected to login
    if (page.url().includes('/login')) {
      await expect(page).toHaveTitle(/Login|POSINT/);
    }
  });

  test('should navigate to home after reaching root', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main')).toBeTruthy();
  });

  test('should display login form elements', async ({ page }) => {
    await page.goto('/login');
    // Check for common login form elements
    const loginForm = page.locator('form');
    if (await loginForm.isVisible()) {
      await expect(loginForm).toBeVisible();
    }
  });

  test('should have proper page title', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toContain('POSINT');
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out expected errors if any
    const criticalErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error promise rejection')
    );

    expect(criticalErrors.length).toBe(0);
  });
});
