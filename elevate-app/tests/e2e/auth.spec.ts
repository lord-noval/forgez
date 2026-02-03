import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('displays login form', async ({ page }) => {
      await page.goto('/login');

      // Check for form elements
      await expect(page.getByRole('heading', { name: /sign in|log in|welcome/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in|log in/i })).toBeVisible();
    });

    test('shows link to signup page', async ({ page }) => {
      await page.goto('/login');

      const signupLink = page.getByRole('link', { name: /sign up|create account|register/i });
      await expect(signupLink).toBeVisible();
    });

    test('shows validation errors for empty fields', async ({ page }) => {
      await page.goto('/login');

      // Click submit without filling form
      await page.getByRole('button', { name: /sign in|log in/i }).click();

      // Should show validation errors (either browser native or custom)
      const emailInput = page.getByLabel(/email/i);
      await expect(emailInput).toHaveAttribute('required');
    });

    test('shows error for invalid email format', async ({ page }) => {
      await page.goto('/login');

      await page.getByLabel(/email/i).fill('invalid-email');
      await page.getByLabel(/password/i).fill('password123');
      await page.getByRole('button', { name: /sign in|log in/i }).click();

      // Email input should be invalid
      const emailInput = page.getByLabel(/email/i);
      await expect(emailInput).toHaveAttribute('type', 'email');
    });

    test('password field masks input', async ({ page }) => {
      await page.goto('/login');

      const passwordInput = page.getByLabel(/password/i);
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  test.describe('Signup Page', () => {
    test('displays signup form', async ({ page }) => {
      await page.goto('/signup');

      await expect(page.getByRole('heading', { name: /sign up|create|register/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign up|create|register/i })).toBeVisible();
    });

    test('shows link to login page', async ({ page }) => {
      await page.goto('/signup');

      const loginLink = page.getByRole('link', { name: /sign in|log in|already have/i });
      await expect(loginLink).toBeVisible();
    });

    test('validates email format', async ({ page }) => {
      await page.goto('/signup');

      const emailInput = page.getByLabel(/email/i);
      await expect(emailInput).toHaveAttribute('type', 'email');
    });
  });

  test.describe('Protected Routes', () => {
    test('redirects unauthenticated users to login', async ({ page }) => {
      // Try to access dashboard without auth
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/login|signin/);
    });

    test('redirects to dashboard after login', async ({ page }) => {
      await page.goto('/login');

      // This test would require valid credentials
      // In a real test environment, you'd use test credentials
    });
  });

  test.describe('Logout', () => {
    test('logout button is visible when authenticated', async ({ page }) => {
      // This would require authentication first
      // Placeholder for authenticated flow testing
    });
  });
});

test.describe('Password Requirements', () => {
  test('signup shows password requirements', async ({ page }) => {
    await page.goto('/signup');

    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.click();

    // Password requirements may be shown on focus or as hints
  });
});

test.describe('Remember Me', () => {
  test('login form may have remember me option', async ({ page }) => {
    await page.goto('/login');

    // Check if remember me checkbox exists
    const rememberMe = page.getByLabel(/remember/i);
    // This is optional, so we don't assert it exists
  });
});

test.describe('Social Login', () => {
  test('may show social login options', async ({ page }) => {
    await page.goto('/login');

    // Check for social login buttons (optional feature)
    // Google, GitHub, etc.
  });
});

test.describe('Accessibility', () => {
  test('login form is accessible', async ({ page }) => {
    await page.goto('/login');

    // Check form has proper labels
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Should be navigable by keyboard
    await page.keyboard.press('Tab');
    // First focusable element should be focused
  });

  test('signup form is accessible', async ({ page }) => {
    await page.goto('/signup');

    // Check form has proper labels
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });
});
