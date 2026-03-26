import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('full navigation flow: category -> advance through questions -> end message', async ({ page }) => {
    await page.goto('/');

    // Wait for categories
    await page.waitForSelector('.MuiListItemButton-root', { timeout: 10000 });
    await page.locator('.MuiListItemButton-root').first().click();
    await page.waitForURL(/\/quiz\/.+/);

    // Verify first question and Previous is disabled
    await expect(page.getByRole('button', { name: /previous/i })).toBeDisabled({ timeout: 5000 });

    // Click through all questions until end-of-category
    let endReached = false;
    for (let i = 0; i < 20; i++) {
      const nextButton = page.getByRole('button', { name: /next/i });
      const isDisabled = await nextButton.isDisabled();
      if (isDisabled) {
        endReached = true;
        break;
      }
      await nextButton.click();
    }

    expect(endReached).toBe(true);
    await expect(page.getByText(/end of category/i)).toBeVisible();

    // Verify no further navigation possible (Next is disabled)
    await expect(page.getByRole('button', { name: /next/i })).toBeDisabled();

    // Verify back navigation returns correct question
    await page.getByRole('button', { name: /previous/i }).click();
    await expect(page.getByText(/Question \d+ of \d+/i)).toBeVisible();
  });
});
