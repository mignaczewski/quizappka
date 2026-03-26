import { test, expect } from '@playwright/test';

test.describe('Category Selection', () => {
  test('open app - categories visible - select category - first question displayed', async ({ page }) => {
    await page.goto('/');

    // Wait for categories to load
    await page.waitForSelector('[data-testid="category-list"], .MuiList-root', { timeout: 10000 });

    // Verify categories are visible (at least one)
    const categoryItems = page.locator('.MuiListItemButton-root');
    await expect(categoryItems.first()).toBeVisible({ timeout: 5000 });

    // Click first category
    await categoryItems.first().click();

    // Verify quiz page loaded with first question
    await page.waitForURL(/\/quiz\/.+/);
    await expect(page.locator('h5, h4, [role="heading"]').first()).toBeVisible({ timeout: 5000 });
  });
});
