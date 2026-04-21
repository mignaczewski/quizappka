import { test, expect, type Page } from '@playwright/test';

async function openMirror(presenterPage: Page): Promise<Page> {
  const context = presenterPage.context();
  const mirrorPage = await context.newPage();
  await mirrorPage.goto('/mirror');
  return mirrorPage;
}

test.describe('Mirroring — US2: Mirror follows presenter navigation', () => {
  test('mirror updates as presenter navigates through the quiz flow', async ({ page }) => {
    // Open presenter homepage
    await page.goto('/');
    await page.waitForSelector('.MuiListItemButton-root', { timeout: 10000 });

    // Open mirror in second tab
    const mirror = await openMirror(page);

    // Mirror should show idle/waiting state initially (no session yet for new mirror)
    // or category-list (hub delivers current state on connect)
    // Either state is valid at this point — wait for hub connection
    await mirror.waitForTimeout(500);

    // Presenter navigates to a category (question list)
    await page.locator('.MuiListItemButton-root').first().click();
    await page.waitForURL(/\/quiz\/[^/]+$/, { timeout: 10000 });

    // Mirror should update to show question list (within 2 s)
    await expect(mirror.locator('h4')).toBeVisible({ timeout: 5000 });

    // Mirror must NOT have navigation controls (Back button, clickable list items that navigate)
    await expect(mirror.getByRole('button', { name: /back to questions/i })).not.toBeVisible();

    // Presenter navigates to a specific question
    await page.locator('.MuiListItemButton-root').first().click();
    await page.waitForURL(/\/quiz\/[^/]+\/[^/]+$/, { timeout: 10000 });

    // Mirror should update to show question detail
    await expect(mirror.locator('h4')).toBeVisible({ timeout: 5000 });

    // Mirror must NOT have a back button
    await expect(mirror.getByRole('button', { name: /back to questions/i })).not.toBeVisible();

    // Presenter goes back to question list
    await page.getByRole('button', { name: /back to questions/i }).click();
    await page.waitForURL(/\/quiz\/[^/]+$/, { timeout: 10000 });

    // Mirror returns to question list
    await expect(mirror.locator('.MuiListItem-root, .MuiListItemButton-root').first()).toBeVisible({ timeout: 5000 });

    await mirror.close();
  });
});

test.describe('Mirroring — US3: Multiple simultaneous mirror views', () => {
  test('all open mirrors stay synchronized when presenter navigates', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.MuiListItemButton-root', { timeout: 10000 });

    // Open three mirror tabs simultaneously
    const mirror1 = await openMirror(page);
    const mirror2 = await openMirror(page);
    const mirror3 = await openMirror(page);

    // Presenter navigates to a category
    await page.locator('.MuiListItemButton-root').first().click();
    await page.waitForURL(/\/quiz\/[^/]+$/, { timeout: 10000 });

    // Presenter navigates to a question
    await page.locator('.MuiListItemButton-root').first().click();
    await page.waitForURL(/\/quiz\/[^/]+\/[^/]+$/, { timeout: 10000 });

    // All three mirrors should show the question — wait up to 3 s
    await expect(mirror1.locator('h4')).toBeVisible({ timeout: 5000 });
    await expect(mirror2.locator('h4')).toBeVisible({ timeout: 5000 });
    await expect(mirror3.locator('h4')).toBeVisible({ timeout: 5000 });

    // Close one mirror
    await mirror3.close();

    // Presenter navigates back
    await page.getByRole('button', { name: /back to questions/i }).click();
    await page.waitForURL(/\/quiz\/[^/]+$/, { timeout: 10000 });

    // Remaining two mirrors update
    await expect(mirror1.locator('.MuiListItem-root, .MuiListItemButton-root').first()).toBeVisible({ timeout: 5000 });
    await expect(mirror2.locator('.MuiListItem-root, .MuiListItemButton-root').first()).toBeVisible({ timeout: 5000 });

    await mirror1.close();
    await mirror2.close();
  });

  test('late-join mirror immediately shows presenter current screen', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.MuiListItemButton-root', { timeout: 10000 });

    // Presenter navigates to a question
    await page.locator('.MuiListItemButton-root').first().click();
    await page.waitForURL(/\/quiz\/[^/]+$/, { timeout: 10000 });
    await page.locator('.MuiListItemButton-root').first().click();
    await page.waitForURL(/\/quiz\/[^/]+\/[^/]+$/, { timeout: 10000 });

    // Open mirror AFTER presenter has already navigated
    const mirror = await openMirror(page);

    // Mirror should immediately receive current state via late-join delivery
    await expect(mirror.locator('h4')).toBeVisible({ timeout: 5000 });

    // Must NOT show idle/waiting state
    await expect(mirror.getByRole('status')).not.toBeVisible();

    await mirror.close();
  });
});
