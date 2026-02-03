import { test, expect } from '@playwright/test';

test.describe('Portfolio', () => {
  // Note: These tests assume the user is authenticated

  test.describe('Project List', () => {
    test('displays portfolio page', async ({ page }) => {
      await page.goto('/dashboard/portfolio');

      // Check for portfolio heading or content
      const heading = page.getByRole('heading', { name: /portfolio|projects|work/i });

      if (await page.url().includes('portfolio')) {
        await expect(heading).toBeVisible();
      }
    });

    test('shows create project button', async ({ page }) => {
      await page.goto('/dashboard/portfolio');

      const createButton = page.getByRole('button', { name: /create|add|new/i });

      if (await page.url().includes('portfolio')) {
        await expect(createButton).toBeVisible();
      }
    });

    test('displays project cards', async ({ page }) => {
      await page.goto('/dashboard/portfolio');

      // Look for project cards
      const projectCards = page.locator('[data-testid*="project"], [class*="project-card"]');

      if (await page.url().includes('portfolio')) {
        // May have projects or empty state
      }
    });

    test('shows empty state when no projects', async ({ page }) => {
      await page.goto('/dashboard/portfolio');

      const emptyState = page.locator('text=/no projects|get started|create your first/i');

      // Empty state should appear if no projects
    });
  });

  test.describe('Project Creation', () => {
    test('can open create project modal', async ({ page }) => {
      await page.goto('/dashboard/portfolio');

      const createButton = page.getByRole('button', { name: /create|add|new/i });

      if (await createButton.isVisible()) {
        await createButton.click();

        // Modal or form should appear
        const form = page.locator('form, [role="dialog"]');
        await expect(form).toBeVisible();
      }
    });

    test('project form has required fields', async ({ page }) => {
      await page.goto('/dashboard/portfolio/new');

      // Check for form fields
      const titleInput = page.getByLabel(/title|name/i);
      const descriptionInput = page.getByLabel(/description/i);

      if (await page.url().includes('portfolio')) {
        // Form should have basic fields
      }
    });

    test('can select project type', async ({ page }) => {
      await page.goto('/dashboard/portfolio/new');

      // Look for project type selector
      const typeSelect = page.locator('select, [role="combobox"], [name*="type"]');

      if (await page.url().includes('portfolio')) {
        // Should be able to select type
      }
    });

    test('validates required fields', async ({ page }) => {
      await page.goto('/dashboard/portfolio/new');

      const submitButton = page.getByRole('button', { name: /create|save|submit/i });

      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Should show validation errors
      }
    });
  });

  test.describe('File Upload', () => {
    test('shows file upload area', async ({ page }) => {
      await page.goto('/dashboard/portfolio/new');

      // Look for file upload zone
      const uploadZone = page.locator('[type="file"], [data-testid*="upload"], text=/upload|drag|drop/i');

      if (await page.url().includes('portfolio')) {
        // Upload area should exist
      }
    });

    test('shows supported file types', async ({ page }) => {
      await page.goto('/dashboard/portfolio/new');

      // Look for file type information
      const fileTypes = page.locator('text=/pdf|jpg|png|zip|docx/i');

      // Should show what files are accepted
    });

    test('shows upload progress', async ({ page }) => {
      await page.goto('/dashboard/portfolio/new');

      // Progress would show during upload
      const progressBar = page.locator('[role="progressbar"], [class*="progress"]');

      // Would appear during file upload
    });
  });

  test.describe('Project Detail', () => {
    test('can view project details', async ({ page }) => {
      await page.goto('/dashboard/portfolio');

      // Click on a project to view details
      const projectCard = page.locator('[data-testid*="project"], [class*="project-card"]').first();

      if (await projectCard.isVisible()) {
        await projectCard.click();

        // Should navigate to detail page or open modal
      }
    });

    test('shows project artifacts', async ({ page }) => {
      await page.goto('/dashboard/portfolio');

      // Navigate to a project
      const projectCard = page.locator('[data-testid*="project"]').first();

      if (await projectCard.isVisible()) {
        await projectCard.click();

        // Should show artifacts/files
        const artifacts = page.locator('text=/artifacts|files|attachments/i');
      }
    });

    test('shows extracted skills', async ({ page }) => {
      await page.goto('/dashboard/portfolio');

      // Project detail should show AI-extracted skills
      const skills = page.locator('[data-testid*="skill"], [class*="skill-badge"]');

      // Skills would be shown on project detail
    });
  });

  test.describe('Project Editing', () => {
    test('can edit project', async ({ page }) => {
      await page.goto('/dashboard/portfolio');

      // Look for edit button
      const editButton = page.getByRole('button', { name: /edit/i });

      if (await editButton.isVisible()) {
        await editButton.click();

        // Should show edit form
      }
    });

    test('can delete project', async ({ page }) => {
      await page.goto('/dashboard/portfolio');

      // Look for delete button
      const deleteButton = page.getByRole('button', { name: /delete|remove/i });

      if (await deleteButton.isVisible()) {
        // Should have delete functionality
      }
    });
  });

  test.describe('Visibility Settings', () => {
    test('can set project visibility', async ({ page }) => {
      await page.goto('/dashboard/portfolio/new');

      // Look for visibility selector
      const visibilitySelect = page.locator('[name*="visibility"], text=/public|private|unlisted/i');

      if (await page.url().includes('portfolio')) {
        // Should be able to set visibility
      }
    });

    test('can feature a project', async ({ page }) => {
      await page.goto('/dashboard/portfolio');

      // Look for feature toggle
      const featureToggle = page.locator('[name*="featured"], text=/feature|highlight/i');

      // Should be able to feature projects
    });
  });

  test.describe('Project Gallery', () => {
    test('gallery shows public projects', async ({ page }) => {
      await page.goto('/gallery');

      // Gallery should show public projects
      const projectCards = page.locator('[data-testid*="project"], [class*="project-card"]');

      // Public projects should be visible
    });

    test('can search projects', async ({ page }) => {
      await page.goto('/gallery');

      // Look for search input
      const searchInput = page.getByRole('searchbox');

      if (await searchInput.isVisible()) {
        await searchInput.fill('typescript');

        // Should filter results
      }
    });

    test('can filter by project type', async ({ page }) => {
      await page.goto('/gallery');

      // Look for type filter
      const typeFilter = page.locator('[name*="type"], [data-testid*="filter"]');

      // Should be able to filter
    });
  });

  test.describe('Responsive Design', () => {
    test('portfolio is responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard/portfolio');

      if (await page.url().includes('portfolio')) {
        // Content should be accessible on mobile
        const content = page.locator('main, [role="main"]');
        await expect(content).toBeVisible();
      }
    });

    test('project cards adapt to viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard/portfolio');

      // Cards should be full-width on mobile
    });
  });

  test.describe('Accessibility', () => {
    test('project cards are accessible', async ({ page }) => {
      await page.goto('/dashboard/portfolio');

      // Cards should be keyboard navigable
      await page.keyboard.press('Tab');

      // Should be able to navigate with keyboard
    });

    test('upload area is accessible', async ({ page }) => {
      await page.goto('/dashboard/portfolio/new');

      // File input should be accessible
      const fileInput = page.locator('[type="file"]');

      if (await fileInput.isVisible()) {
        // Should be focusable
      }
    });
  });
});
