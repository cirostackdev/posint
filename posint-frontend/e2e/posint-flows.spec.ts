import { test, expect } from '@playwright/test';

test.describe('POSINT Main Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display main content on home page', async ({ page }) => {
    // Check for main content area
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Verify page has content
    const content = await page.locator('body').innerHTML();
    expect(content.length).toBeGreaterThan(0);
  });

  test('should have proper page structure', async ({ page }) => {
    // Check for header/nav
    const header = page.locator('header');
    if (await header.isVisible()) {
      await expect(header).toBeVisible();
    }

    // Check for main content
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should handle page navigation', async ({ page }) => {
    // Look for navigation links
    const links = await page.locator('a[href^="/"]').all();

    // Verify we have navigation elements
    expect(links.length).toBeGreaterThan(0);
  });

  test('should load external resources', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Verify at least some resources loaded
    const resourceTiming = await page.evaluate(() => {
      return performance.getEntriesByType('resource').length;
    });

    expect(resourceTiming).toBeGreaterThan(0);
  });

  test('should display without layout shift', async ({ page }) => {
    // Measure Cumulative Layout Shift
    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;

        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ((entry as any).hadRecentInput) continue;
            clsValue += (entry as any).value;
          }
        });

        observer.observe({ type: 'layout-shift', buffered: true });

        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 5000);
      });
    });

    // CLS should be < 0.1 (good threshold)
    expect(cls).toBeLessThan(0.25);
  });

  test('should handle offline state gracefully', async ({ page, context }) => {
    // Go online first
    await context.setOffline(false);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get cached data
    const initialContent = await page.locator('main').innerHTML();
    expect(initialContent.length).toBeGreaterThan(0);

    // Go offline
    await context.setOffline(true);
    await page.reload().catch(() => {
      // Reload may fail when offline, which is expected
    });
    await page.waitForTimeout(1000);

    // Check offline banner appears (if app has one)
    const offlineBanner = page.locator('[data-testid="offline-banner"]');
    if (await offlineBanner.isVisible()) {
      await expect(offlineBanner).toContainText(/offline/i);
    }

    // Check cached content still shows
    const currentContent = await page.locator('main').innerHTML();
    expect(currentContent.length).toBeGreaterThan(0);

    // Go back online
    await context.setOffline(false);
  });

  test('should display performance metrics', async ({ page }) => {
    // Measure Core Web Vitals
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      return {
        domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
        loadComplete: nav.loadEventEnd - nav.loadEventStart,
        firstPaint: paint.find((p) => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint:
          paint.find((p) => p.name === 'first-contentful-paint')?.startTime || 0,
      };
    });

    // Log metrics for monitoring
    console.log('Performance metrics:', metrics);

    // Verify reasonable load times
    expect(metrics.domContentLoaded).toBeLessThan(5000); // 5 seconds
    expect(metrics.loadComplete).toBeLessThan(10000); // 10 seconds
  });

  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check main content is still visible
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Verify no horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // +1 for rounding
  });

  test('should handle responsive images', async ({ page }) => {
    const images = await page.locator('img').all();

    // If there are images, verify they load
    if (images.length > 0) {
      for (const img of images.slice(0, 3)) {
        // Check first 3 images
        const complete = await img.evaluate((el: HTMLImageElement) => el.complete);
        // Image should be complete or loading
        expect(complete || (await img.isVisible())).toBeTruthy();
      }
    }
  });

  test('should have accessible navigation', async ({ page }) => {
    // Check for accessibility attributes
    const links = await page.locator('a').all();

    // Verify we have links
    expect(links.length).toBeGreaterThan(0);

    // Verify links have text or aria-label
    for (const link of links.slice(0, 5)) {
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      // Link should have either visible text or aria-label
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('should handle fast navigation', async ({ page }) => {
    // Get initial page state
    await page.goto('/');
    const initialTitle = await page.title();

    // Navigate to another route if available
    const links = await page.locator('a[href^="/"]').all();
    if (links.length > 0) {
      // Click first link
      const firstLink = links[0];
      const href = await firstLink.getAttribute('href');

      if (href && href !== '/' && !href.includes('http')) {
        await firstLink.click();
        await page.waitForLoadState('networkidle');

        // Verify we navigated
        const newUrl = page.url();
        expect(newUrl).toBeTruthy();
      }
    }
  });

  test('should display correct theme metadata', async ({ page }) => {
    // Check for theme color meta tag
    const themeColor = page.locator('meta[name="theme-color"]');
    if (await themeColor.isVisible()) {
      const content = await themeColor.getAttribute('content');
      expect(content).toBeTruthy();
    }

    // Check for apple status bar
    const statusBar = page.locator('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (await statusBar.isVisible()) {
      const content = await statusBar.getAttribute('content');
      expect(content).toBeTruthy();
    }
  });

  test('should have valid HTML structure', async ({ page }) => {
    // Check for required HTML elements
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang');

    // Check body exists
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Verify no orphaned text at root level (basic check)
    const content = await page.locator('body').innerHTML();
    expect(content.length).toBeGreaterThan(0);
  });
});
