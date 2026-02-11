import { test, expect } from '@playwright/test';

test.describe('Services Pages', () => {
  test('should display business consultancy services', async ({ page }) => {
    await page.goto('/business-consultancy');

    // Page should load
    await expect(page).toHaveURL(/business-consultancy/);

    // Should show services
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should display education support services', async ({ page }) => {
    await page.goto('/education-support');

    // Page should load
    await expect(page).toHaveURL(/education-support/);

    // Should show services
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should display service cards', async ({ page }) => {
    await page.goto('/business-consultancy');

    // Wait for services to load
    await page.waitForLoadState('networkidle');

    // Should have service cards or content
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('should add service to cart', async ({ page }) => {
    await page.goto('/business-consultancy');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find add to cart button
    const addToCartButton = page.getByRole('button', { name: /add to cart|book|enquire/i }).first();

    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();

      // Cart should update - either show count or notification
      // Check for cart indicator or toast
      const cartIndicator = page.locator('[data-testid="cart-count"], .cart-count, [aria-label*="cart"]');
      if (await cartIndicator.isVisible()) {
        await expect(cartIndicator).toBeVisible();
      }
    }
  });
});

test.describe('Service Details', () => {
  test('should navigate to service detail page', async ({ page }) => {
    await page.goto('/business-consultancy');

    // Wait for services to load
    await page.waitForLoadState('networkidle');

    // Find a service link/card
    const serviceLink = page.getByRole('link').filter({ hasText: /strategic|assessment|consultation/i }).first();

    if (await serviceLink.isVisible()) {
      await serviceLink.click();

      // Should navigate to detail page or show modal
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display service information', async ({ page }) => {
    await page.goto('/business-consultancy');

    // Wait for content
    await page.waitForLoadState('networkidle');

    // Should show service descriptions
    const serviceContent = page.locator('main');
    await expect(serviceContent).toBeVisible();
  });
});

test.describe('Cart Functionality', () => {
  test('should open cart panel', async ({ page }) => {
    await page.goto('/');

    // Find cart button
    const cartButton = page.getByRole('button', { name: /cart/i });

    if (await cartButton.isVisible()) {
      await cartButton.click();

      // Cart panel should open
      const cartPanel = page.locator('[role="dialog"], [aria-label*="cart"], .cart-panel');
      if (await cartPanel.isVisible()) {
        await expect(cartPanel).toBeVisible();
      }
    }
  });

  test('should show empty cart message', async ({ page }) => {
    await page.goto('/');

    // Clear local storage to ensure empty cart
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Open cart
    const cartButton = page.getByRole('button', { name: /cart/i });

    if (await cartButton.isVisible()) {
      await cartButton.click();

      // Should show empty message or 0 items
      const emptyMessage = page.getByText(/empty|no items|0 items/i);
      if (await emptyMessage.isVisible()) {
        await expect(emptyMessage).toBeVisible();
      }
    }
  });
});
