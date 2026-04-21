import { test, expect, type Page } from '@playwright/test';

// All tests in this file share a single server-side PresenterSessionStore (singleton).
// Running tests in parallel causes cross-test state contamination via SignalR broadcasts:
// one test's reveal action is received by another test's mirror page.
// Serial mode ensures tests run sequentially on one worker so state doesn't bleed.
test.describe.configure({ mode: 'serial' });

async function openMirror(presenterPage: Page): Promise<Page> {
  const context = presenterPage.context();
  const mirrorPage = await context.newPage();
  await mirrorPage.goto('/mirror');
  return mirrorPage;
}

test.describe('Question Types — US2: Meme question image reveal', () => {
  test('presenter sees reveal button; clicking it reveals the image', async ({ page }) => {
    await page.goto('/quiz/sample-category/q4');
    await expect(page.getByText('Which meme best describes Monday mornings?')).toBeVisible({ timeout: 10000 });

    // Entry image fails to load (meme-question.jpg doesn't exist) — error fallback shown
    await expect(page.getByTestId('meme-image')).not.toBeVisible();
    await expect(page.getByText('Image unavailable')).toBeVisible();

    // Reveal button is present (revealImage is configured)
    const revealButton = page.getByTestId('reveal-image-button');
    await expect(revealButton).toBeVisible();

    // Click reveal
    await revealButton.click();

    // Reveal button disappears after click
    await expect(revealButton).not.toBeVisible({ timeout: 3000 });

    // Reveal image (kowal.jpg — exists) loads successfully
    await expect(page.getByTestId('meme-image')).toBeVisible({ timeout: 3000 });
  });

  test('mirror shows revealed image when presenter has revealed', async ({ page }) => {
    await page.goto('/quiz/sample-category/q4');
    await expect(page.getByText('Which meme best describes Monday mornings?')).toBeVisible({ timeout: 10000 });

    // Open mirror tab
    const mirror = await openMirror(page);

    // Mirror should show the question (hub delivers state on connect)
    await expect(
      mirror.getByText('Which meme best describes Monday mornings?')
    ).toBeVisible({ timeout: 10000 });

    // Before reveal: entry image unavailable on mirror too
    await expect(mirror.getByTestId('meme-image')).not.toBeVisible();

    // Presenter reveals
    await page.getByTestId('reveal-image-button').click();
    await expect(page.getByTestId('reveal-image-button')).not.toBeVisible({ timeout: 3000 });

    // Mirror updates to show reveal image (kowal.jpg)
    await expect(mirror.getByTestId('meme-image')).toBeVisible({ timeout: 5000 });

    await mirror.close();
  });

  test('late-joining mirror sees revealed state', async ({ page }) => {
    await page.goto('/quiz/sample-category/q4');
    await expect(page.getByText('Which meme best describes Monday mornings?')).toBeVisible({ timeout: 10000 });

    // Presenter reveals before mirror connects
    await page.getByTestId('reveal-image-button').click();
    await expect(page.getByTestId('reveal-image-button')).not.toBeVisible({ timeout: 3000 });
    await expect(page.getByTestId('meme-image')).toBeVisible({ timeout: 3000 });

    // Late-join mirror
    const mirror = await openMirror(page);
    await expect(
      mirror.getByText('Which meme best describes Monday mornings?')
    ).toBeVisible({ timeout: 10000 });

    // Mirror should immediately show revealed image (state replayed on connect)
    await expect(mirror.getByTestId('meme-image')).toBeVisible({ timeout: 5000 });

    await mirror.close();
  });
});

test.describe('Question Types — US3: Singing Pianos box reveal', () => {
  test('boxes start hidden and reveal on click', async ({ page }) => {
    await page.goto('/quiz/sample-category/q5');
    await expect(page.getByText('Press each box to reveal the hidden notes!')).toBeVisible({ timeout: 10000 });

    // All boxes hidden initially
    const box0 = page.getByTestId('piano-box-0');
    const box1 = page.getByTestId('piano-box-1');
    await expect(box0).toHaveText('?');
    await expect(box1).toHaveText('?');

    // Click box 0 — reveals DO
    await box0.click();
    await expect(box0).toHaveText('DO', { timeout: 3000 });

    // Box 1 still hidden
    await expect(box1).toHaveText('?');

    // Click box 2 — reveals MI
    await page.getByTestId('piano-box-2').click();
    await expect(page.getByTestId('piano-box-2')).toHaveText('MI', { timeout: 3000 });
  });

  test('mirror updates when presenter reveals a box', async ({ page }) => {
    await page.goto('/quiz/sample-category/q5');
    await expect(page.getByText('Press each box to reveal the hidden notes!')).toBeVisible({ timeout: 10000 });

    // Open mirror tab
    const mirror = await openMirror(page);
    await expect(
      mirror.getByText('Press each box to reveal the hidden notes!')
    ).toBeVisible({ timeout: 10000 });

    // All mirror boxes hidden
    await expect(mirror.getByTestId('piano-box-0')).toHaveText('?');

    // Presenter reveals box 0
    await page.getByTestId('piano-box-0').click();
    await expect(page.getByTestId('piano-box-0')).toHaveText('DO', { timeout: 3000 });

    // Mirror updates box 0
    await expect(mirror.getByTestId('piano-box-0')).toHaveText('DO', { timeout: 5000 });

    // Mirror box 1 still hidden
    await expect(mirror.getByTestId('piano-box-1')).toHaveText('?');

    // Presenter reveals box 2
    await page.getByTestId('piano-box-2').click();
    await expect(page.getByTestId('piano-box-2')).toHaveText('MI', { timeout: 3000 });
    await expect(mirror.getByTestId('piano-box-2')).toHaveText('MI', { timeout: 5000 });

    await mirror.close();
  });

  test('late-joining mirror sees current partial box reveal state', async ({ page }) => {
    await page.goto('/quiz/sample-category/q5');
    await expect(page.getByText('Press each box to reveal the hidden notes!')).toBeVisible({ timeout: 10000 });

    // Reveal boxes 0 and 3
    await page.getByTestId('piano-box-0').click();
    await expect(page.getByTestId('piano-box-0')).toHaveText('DO', { timeout: 3000 });

    await page.getByTestId('piano-box-3').click();
    await expect(page.getByTestId('piano-box-3')).toHaveText('FA', { timeout: 3000 });

    // Late-join mirror
    const mirror = await openMirror(page);
    await expect(
      mirror.getByText('Press each box to reveal the hidden notes!')
    ).toBeVisible({ timeout: 10000 });

    // Mirror sees boxes 0 and 3 revealed, others hidden
    await expect(mirror.getByTestId('piano-box-0')).toHaveText('DO', { timeout: 5000 });
    await expect(mirror.getByTestId('piano-box-1')).toHaveText('?');
    await expect(mirror.getByTestId('piano-box-2')).toHaveText('?');
    await expect(mirror.getByTestId('piano-box-3')).toHaveText('FA', { timeout: 5000 });
    await expect(mirror.getByTestId('piano-box-4')).toHaveText('?');

    await mirror.close();
  });
});
