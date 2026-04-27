import { test, expect } from '@playwright/test';

test('Cecily picks profile and starts a lesson from the garden', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Cecily')).toBeVisible({ timeout: 10_000 });
  await page.getByText('Cecily').click();

  // Picker now lands directly on /garden — the in-world quick-start
  // characters (replacing the old /explore page) live there.
  await expect(page).toHaveURL(/\/garden(\?|$)/);
  await page.waitForLoadState('networkidle');

  // The day's "alert" character (Nana / Hodge / Signpost — picked by
  // the daily rotation) is marked data-state="awake". Tapping them
  // launches the engine-recommended skill as a session.
  const alertChar = page.locator('[data-state="awake"]').first();
  await expect(alertChar).toBeVisible({ timeout: 10_000 });
  await alertChar.click();

  await expect(page).toHaveURL(/\/lesson\//, { timeout: 10_000 });

  // Wait for some answer-submit affordance to appear (Check button, "That's my count", or numeric choices)
  await page.waitForSelector(
    'button:has-text("Check"), button:has-text("That\'s my count"), button',
    { timeout: 15_000 }
  );
});
