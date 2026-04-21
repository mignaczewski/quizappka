import { test, expect } from '@playwright/test';

test.describe('Category Selection', () => {
  test('open app - categories visible - select category - question list displayed', async ({ page }) => {
    await page.goto('/');

    // Wait for categories to load
    await page.waitForSelector('[data-testid="category-list"], .MuiList-root', { timeout: 10000 });

    // Verify categories are visible (at least one)
    const categoryItems = page.locator('.MuiListItemButton-root');
    await expect(categoryItems.first()).toBeVisible({ timeout: 5000 });

    // Click first category
    await categoryItems.first().click();

    // Verify question list page loaded — multiple question entries should be visible
    await page.waitForURL(/\/quiz\/[^/]+$/, { timeout: 5000 });

    // The question list should show list item buttons (one per question)
    const questionItems = page.locator('.MuiListItemButton-root');
    await expect(questionItems.first()).toBeVisible({ timeout: 5000 });

    // No question detail should be auto-opened — the URL should remain at the list level
    await expect(page).not.toHaveURL(/\/quiz\/.+\/.+/);
  });
});
