import { test, expect } from '@playwright/test';

// Smoke test for the world-navigation overhaul: the new branch
// scenes and the habitat interior dynamic route resolve and render
// without errors. The full happy-path flow (locked gate → seed
// completion → unlock animation → branch scene → step inside) lives
// in §16.3 of the design spec but requires DB-seeded learner state;
// this lighter smoke test just confirms the routes exist and render
// without server errors for a default learner.

test.describe('world navigation routes', () => {
  test.beforeEach(async ({ page }) => {
    // Land on /picker first so a learner is available, then navigate
    // directly via URL.
    await page.goto('/');
    await expect(page.getByText('Cecily')).toBeVisible({ timeout: 10_000 });
    await page.getByText('Cecily').click();
    await expect(page).toHaveURL(/\/garden(\?|$)/);
    await page.waitForLoadState('networkidle');
  });

  test('Math Mountain route renders with cluster labels', async ({ page }) => {
    // Navigate via URL (the gate may be locked for fresh learners,
    // but the route itself should still resolve and the page
    // should render its scene).
    const url = page.url();
    const learnerMatch = url.match(/learner=([^&]+)/);
    const learner = learnerMatch ? learnerMatch[1] : '';
    await page.goto(`/garden/math-mountain${learner ? `?learner=${learner}` : ''}`);
    await expect(page.getByText(/Operations Hollow/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Math Mountain/i).first()).toBeVisible();
  });

  test('Reading Forest route renders with cluster labels', async ({ page }) => {
    const url = page.url();
    const learnerMatch = url.match(/learner=([^&]+)/);
    const learner = learnerMatch ? learnerMatch[1] : '';
    await page.goto(`/garden/reading-forest${learner ? `?learner=${learner}` : ''}`);
    await expect(page.getByText(/Phonics Path/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Reading Forest/i).first()).toBeVisible();
  });

  test('Bunny Burrow interior renders', async ({ page }) => {
    const url = page.url();
    const learnerMatch = url.match(/learner=([^&]+)/);
    const learner = learnerMatch ? learnerMatch[1] : '';
    await page.goto(`/garden/habitat/bunny_burrow${learner ? `?learner=${learner}` : ''}`);
    await expect(page.getByText(/Petal Counting/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Bunny Burrow/i).first()).toBeVisible();
  });

  test('back-to-garden button on a branch returns to /garden', async ({ page }) => {
    const url = page.url();
    const learnerMatch = url.match(/learner=([^&]+)/);
    const learner = learnerMatch ? learnerMatch[1] : '';
    await page.goto(`/garden/math-mountain${learner ? `?learner=${learner}` : ''}`);
    await expect(page.getByText(/Operations Hollow/i)).toBeVisible({ timeout: 10_000 });
    await page.getByLabel(/back to garden/i).click();
    await expect(page).toHaveURL(/\/garden(\?|$)/);
  });

  test('/explore is gone (404)', async ({ page }) => {
    const response = await page.goto('/explore');
    expect(response?.status()).toBe(404);
  });
});
