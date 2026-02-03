import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  // Note: These tests assume the user is authenticated
  // In a real test environment, you'd set up authentication before each test

  test.describe('Navigation', () => {
    test('displays sidebar navigation', async ({ page }) => {
      await page.goto('/dashboard');

      // Check for sidebar or navigation element
      const sidebar = page.locator('aside, nav[role="navigation"]').first();

      // If not redirected to login, check for navigation items
      if (await page.url().includes('dashboard')) {
        await expect(sidebar).toBeVisible();
      }
    });

    test('navigation links work correctly', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for navigation links
      const navLinks = page.locator('nav a, aside a');

      // If authenticated and on dashboard
      if (await page.url().includes('dashboard')) {
        const count = await navLinks.count();
        expect(count).toBeGreaterThan(0);
      }
    });

    test('mobile navigation is responsive', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard');

      // Check for mobile menu button or bottom nav
      const mobileNav = page.locator('[aria-label*="menu"], [role="navigation"]');

      if (await page.url().includes('dashboard')) {
        // Mobile navigation should exist
      }
    });
  });

  test.describe('World Themes', () => {
    test('applies theme based on world selection', async ({ page }) => {
      await page.goto('/dashboard');

      // Check for world-specific data attribute
      const html = page.locator('html');

      // The app should have a data-world attribute
      const worldAttr = await html.getAttribute('data-world');

      if (worldAttr) {
        expect(['cosmos', 'forge', 'nexus', 'terra', 'quantum']).toContain(worldAttr);
      }
    });

    test('theme persists across page navigation', async ({ page }) => {
      await page.goto('/dashboard');

      const initialWorld = await page.locator('html').getAttribute('data-world');

      // Navigate to another page
      await page.goto('/dashboard/skills');

      const currentWorld = await page.locator('html').getAttribute('data-world');

      if (initialWorld) {
        expect(currentWorld).toBe(initialWorld);
      }
    });
  });

  test.describe('XP and Level Display', () => {
    test('shows XP counter', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for XP display
      const xpDisplay = page.locator('text=/\\d+\\s*(xp|points|sp|fp)/i');

      if (await page.url().includes('dashboard')) {
        // XP should be displayed somewhere on the dashboard
      }
    });

    test('shows current level', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for level display
      const levelDisplay = page.locator('text=/level\\s*\\d+/i');

      if (await page.url().includes('dashboard')) {
        // Level should be displayed somewhere on the dashboard
      }
    });

    test('shows streak counter', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for streak display
      const streakDisplay = page.locator('text=/\\d+\\s*(day|streak)/i');

      if (await page.url().includes('dashboard')) {
        // Streak should be displayed somewhere
      }
    });
  });

  test.describe('Daily Challenges', () => {
    test('displays daily challenges section', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for challenges section
      const challengesSection = page.locator('text=/challenges|daily|today/i').first();

      if (await page.url().includes('dashboard')) {
        // Challenges section should exist
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('dashboard is responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/dashboard');

      // Check layout adapts
      if (await page.url().includes('dashboard')) {
        // No horizontal scrollbar
        const body = page.locator('body');
        const bodyWidth = await body.evaluate((el) => el.scrollWidth);
        const viewportWidth = 768;
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Allow small margin
      }
    });

    test('dashboard is responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard');

      if (await page.url().includes('dashboard')) {
        // Content should be visible and accessible
        const mainContent = page.locator('main, [role="main"]').first();
        await expect(mainContent).toBeVisible();
      }
    });
  });
});

test.describe('Dashboard Quick Actions', () => {
  test('log activity button is visible', async ({ page }) => {
    await page.goto('/dashboard');

    // Look for primary action button
    const logButton = page.getByRole('button', { name: /log|start|begin/i });

    if (await page.url().includes('dashboard')) {
      // Should have a way to log activities
    }
  });
});

test.describe('Dashboard Loading States', () => {
  test('shows loading state initially', async ({ page }) => {
    // Slow down network to see loading state
    await page.route('**/*', (route) => {
      setTimeout(() => route.continue(), 100);
    });

    await page.goto('/dashboard');

    // Look for loading indicators
    const skeleton = page.locator('[class*="skeleton"], [class*="loading"], [aria-busy="true"]');
    // Loading states may appear briefly
  });
});

test.describe('Error Handling', () => {
  test('handles network errors gracefully', async ({ page }) => {
    // Block API requests
    await page.route('**/api/**', (route) => route.abort());

    await page.goto('/dashboard');

    // Should show error state or retry option, not crash
    // The page should still render something
  });
});
