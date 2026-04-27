import { test, expect } from '@playwright/test';

test('Reading expedition can be launched from the garden', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Cecily')).toBeVisible({ timeout: 10_000 });
  await page.getByText('Cecily').click();

  await expect(page).toHaveURL(/\/garden(\?|$)/);
  await page.waitForLoadState('networkidle');

  // Tap a reading-themed structure on the central garden. The
  // existing structures include Word Stump (sight words), Blending
  // Brook (CVC), and Story Log (read-aloud) — all visible by label.
  const readingStructure = page.getByText(/Word Stump|Blending Brook|Story Log/i).first();
  await expect(readingStructure).toBeVisible({ timeout: 10_000 });
  await readingStructure.click();

  await expect(page).toHaveURL(/\/lesson\//, { timeout: 10_000 });

  // Reading renderers all expose tappable buttons.
  await page.waitForSelector('button', { timeout: 15_000 });

  // Tap a plausible answer button — filter out nav / header buttons.
  const answerButtons = page.getByRole('button').filter({
    hasNotText: /🔊|❓|Exploration|Skip/,
  });
  const count = await answerButtons.count();
  if (count > 0) {
    await answerButtons.first().click();
  }

  await page.waitForTimeout(2000);
});
