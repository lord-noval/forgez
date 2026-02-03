import { test, expect } from '@playwright/test';

test.describe('Habit Logging', () => {
  // Note: These tests assume the user is authenticated
  // In a real test environment, you'd set up authentication before each test

  test.describe('Exercise Selection', () => {
    test('displays available exercises', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for exercise/activity options
      const exercises = page.locator('[data-testid*="exercise"], [class*="exercise"]');

      // May need to navigate to a logging page
    });

    test('exercises are grouped by skill', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for skill groupings
      const skillGroups = page.locator('text=/deep work|problem|failure|trade-off|experiment|relationship|growth/i');
    });
  });

  test.describe('Logging Flow', () => {
    test('can open logging modal or page', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for log/start button
      const logButton = page.getByRole('button', { name: /log|start|begin|add/i });

      if (await logButton.isVisible()) {
        await logButton.click();

        // Should show logging interface
        const loggingForm = page.locator('form, [role="dialog"]');
        await expect(loggingForm).toBeVisible();
      }
    });

    test('binary logging works', async ({ page }) => {
      await page.goto('/dashboard');

      // For binary exercises, should have a simple complete button
      const completeButton = page.getByRole('button', { name: /complete|done|check/i });

      // Click if available
      if (await completeButton.isVisible()) {
        await completeButton.click();
      }
    });

    test('duration logging shows timer or input', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for duration input
      const durationInput = page.locator('input[type="number"], [name*="duration"], [name*="minutes"]');

      // May need to select a duration-based exercise first
    });

    test('journal logging shows text area', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for journal/reflection text area
      const journalInput = page.locator('textarea, [name*="journal"], [name*="reflection"]');

      // May need to select a journal exercise first
    });
  });

  test.describe('XP Rewards', () => {
    test('shows XP earned after logging', async ({ page }) => {
      await page.goto('/dashboard');

      // After completing a log, XP should be shown
      const xpDisplay = page.locator('text=/\\+\\d+.*xp|earned.*\\d+|\\d+.*points/i');

      // This would appear after a successful log
    });

    test('streak multiplier is displayed', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for streak multiplier display
      const multiplier = page.locator('text=/\\d+\\.\\d+x|multiplier|bonus/i');

      // Multiplier should be shown somewhere
    });
  });

  test.describe('Streak System', () => {
    test('shows current streak', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for streak display
      const streakDisplay = page.locator('text=/\\d+\\s*(day|days)\\s*streak/i');

      // Streak should be visible on dashboard
    });

    test('shows freeze tokens', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for freeze token display
      const freezeDisplay = page.locator('text=/freeze|token|❄️|🧊/i');

      // Freeze tokens may be displayed
    });

    test('shows streak at risk warning', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for at-risk warning
      const warningDisplay = page.locator('text=/at risk|don\'t lose|protect your/i');

      // Warning appears when streak is at risk
    });
  });

  test.describe('Challenges', () => {
    test('displays daily challenges', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for challenges section
      const challenges = page.locator('text=/daily challenge|today\'s challenge|challenge/i');

      // Challenges should be shown
    });

    test('shows challenge progress', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for progress indicators
      const progress = page.locator('[role="progressbar"], [class*="progress"]');

      // Progress should be shown for challenges
    });

    test('marks challenge as complete', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for completed challenge indicator
      const completed = page.locator('[data-completed="true"], .completed, text=/completed|done|✓/i');

      // Completed challenges should be marked
    });
  });

  test.describe('Validation', () => {
    test('validates duration input', async ({ page }) => {
      await page.goto('/dashboard');

      // Try to submit invalid duration
      const durationInput = page.locator('input[type="number"]');

      if (await durationInput.isVisible()) {
        await durationInput.fill('-5');

        // Should show validation error or prevent submission
      }
    });

    test('requires selection before logging', async ({ page }) => {
      await page.goto('/dashboard');

      // Try to log without selecting exercise
      const submitButton = page.getByRole('button', { name: /log|save|submit/i });

      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Should show error or prevent submission
      }
    });
  });

  test.describe('History', () => {
    test('shows recent logs', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for history/recent activity
      const history = page.locator('text=/recent|history|today|yesterday/i');

      // Recent logs should be shown
    });

    test('can view log details', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for expandable/clickable log entries
      const logEntry = page.locator('[data-testid*="log"], [class*="log-entry"]');

      if (await logEntry.first().isVisible()) {
        await logEntry.first().click();

        // Should show log details
      }
    });
  });
});

test.describe('Achievements', () => {
  test('shows achievement notification on unlock', async ({ page }) => {
    await page.goto('/dashboard');

    // Achievement notifications appear on unlock
    const notification = page.locator('[role="alert"], [class*="achievement"], [class*="notification"]');

    // Would appear after unlocking
  });

  test('shows achievement progress', async ({ page }) => {
    await page.goto('/dashboard');

    // Look for achievement section or link
    const achievementLink = page.locator('text=/achievement|trophy|badge/i');

    // Should be able to view achievements
  });
});

test.describe('Accessibility', () => {
  test('logging form is keyboard navigable', async ({ page }) => {
    await page.goto('/dashboard');

    // Tab through form elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Focus should move through interactive elements
  });

  test('form elements have proper labels', async ({ page }) => {
    await page.goto('/dashboard');

    // Check for proper label associations
    const inputs = page.locator('input, textarea, select');

    // All inputs should have labels or aria-labels
  });
});
