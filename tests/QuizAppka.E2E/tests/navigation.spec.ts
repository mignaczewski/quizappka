import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('list-based flow: home -> category -> question list -> question detail -> back -> question list -> different question', async ({ page }) => {
    await page.goto('/');

    // Wait for category list and select the first category
    await page.waitForSelector('.MuiListItemButton-root', { timeout: 10000 });
    await page.locator('.MuiListItemButton-root').first().click();

    // Should land on the question list page (/quiz/:categoryId — one segment after /quiz/)
    await page.waitForURL(/\/quiz\/[^/]+$/, { timeout: 10000 });
    const listUrl = page.url();

    // Question list items should be visible
    const questionItems = page.locator('.MuiListItemButton-root');
    await expect(questionItems.first()).toBeVisible({ timeout: 5000 });

    // Open the first question
    await questionItems.first().click();

    // Should navigate to question detail (/quiz/:categoryId/:questionId — two segments)
    await page.waitForURL(/\/quiz\/[^/]+\/[^/]+$/, { timeout: 10000 });

    // Back button should be present
    const backButton = page.getByRole('button', { name: /back to questions/i });
    await expect(backButton).toBeVisible({ timeout: 5000 });

    // Click back — should return to question list
    await backButton.click();
    await page.waitForURL(/\/quiz\/[^/]+$/, { timeout: 10000 });
    expect(page.url()).toBe(listUrl);

    // Question list is visible again
    await expect(questionItems.first()).toBeVisible({ timeout: 5000 });

    // Open a different question (second if available, otherwise first again)
    const count = await questionItems.count();
    const targetIndex = count > 1 ? 1 : 0;
    await questionItems.nth(targetIndex).click();

    // Should navigate to question detail again
    await page.waitForURL(/\/quiz\/[^/]+\/[^/]+$/, { timeout: 10000 });
    await expect(backButton).toBeVisible({ timeout: 5000 });
  });
});
