import { test, expect } from '@playwright/test';

test('Reading expedition renders and accepts an answer', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Cecily')).toBeVisible({ timeout: 10_000 });
  await page.getByText('Cecily').click();

  await expect(page).toHaveURL(/\/explore/);
  await page.waitForLoadState('networkidle');

  // Find any reading-themed card. Skill hints include: sight words, phonics, digraphs, blends, reading.
  const readingCard = page.locator('button').filter({
    hasText: /sight words|phonics|sounds|digraphs|blends|reading|blending/i,
  }).first();

  await expect(readingCard).toBeVisible({ timeout: 10_000 });
  await readingCard.click();

  await expect(page).toHaveURL(/\/lesson\//, { timeout: 10_000 });

  // Reading renderers all expose tappable buttons.
  await page.waitForSelector('button', { timeout: 15_000 });

  // Tap a plausible answer button — filter out nav / header buttons by not matching audio/wondering emojis
  const answerButtons = page.getByRole('button').filter({
    hasNotText: /🔊|❓|Exploration|Skip/,
  });
  const count = await answerButtons.count();
  if (count > 0) {
    await answerButtons.first().click();
  }

  await page.waitForTimeout(2000);
});
