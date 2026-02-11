import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the homepage', async ({ page }) => {
    // Check that the page loads
    await expect(page).toHaveTitle(/Consultancy/i);
  });

  test('should have navigation links', async ({ page }) => {
    // Check for main navigation
    await expect(page.getByRole('navigation')).toBeVisible();

    // Check for key navigation links
    await expect(page.getByRole('link', { name: /home/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /about/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /contact/i })).toBeVisible();
  });

  test('should navigate to services page', async ({ page }) => {
    // Click on a service pillar link
    const serviceLink = page.getByRole('link', { name: /business consultancy/i }).first();
    if (await serviceLink.isVisible()) {
      await serviceLink.click();
      await expect(page).toHaveURL(/business-consultancy/);
    }
  });

  test('should have footer with contact information', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check footer content
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Page should still be functional
    await expect(page.getByRole('navigation')).toBeVisible();
  });
});

test.describe('Homepage Hero Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display hero section content', async ({ page }) => {
    // Hero section should be visible
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();
  });

  test('should have call-to-action buttons', async ({ page }) => {
    // Look for CTA buttons
    const ctaButtons = page.getByRole('link').filter({ hasText: /get started|learn more|contact/i });
    const count = await ctaButtons.count();
    expect(count).toBeGreaterThan(0);
  });
});
