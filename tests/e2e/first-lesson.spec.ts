import { test, expect } from '@playwright/test';

test('Cecily picks profile and starts a lesson', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Cecily')).toBeVisible({ timeout: 10_000 });
  await page.getByText('Cecily').click();

  await expect(page).toHaveURL(/\/explore/);
  await page.waitForLoadState('networkidle');

  const card = page.getByRole('button').first();
  await expect(card).toBeVisible();
  await card.click();

  await expect(page).toHaveURL(/\/lesson\//, { timeout: 10_000 });

  // Wait for some answer-submit affordance to appear (Check button, "That's my count", or numeric choices)
  await page.waitForSelector(
    'button:has-text("Check"), button:has-text("That\'s my count"), button',
    { timeout: 15_000 }
  );
});
