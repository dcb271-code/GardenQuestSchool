#!/usr/bin/env node
//
// Load every page in a real browser and fail if any of them errors.
//
// WHY THIS EXISTS. `tsc --noEmit` passed, 1,321 unit tests passed, and
// `next build` compiled cleanly — and Cecily's garden page still threw
// on every request, because a `const` was read inside a `.some()`
// callback before it was declared. TypeScript allows that: the
// reference is inside a closure and it cannot prove when a closure
// runs. `.some()` runs it immediately, so it was a temporal-dead-zone
// ReferenceError at runtime and nothing in the pipeline saw it.
//
// The only thing that catches that class of bug is asking the server
// for the page. So: build, start, and walk every route.
//
//   npm run build && node scripts/smoke-routes.mjs
//
// Pass a learner id to exercise the pages as a real child, which
// matters — /garden was fine with no learner and broken with one.
//
//   node scripts/smoke-routes.mjs --learner <uuid>
//
// Exits non-zero if any route renders the error boundary or logs an
// uncaught exception.

import { chromium } from 'playwright';

const BASE = process.env.SMOKE_BASE ?? 'http://localhost:3000';

const ROUTES = [
  '/picker',
  '/garden',
  '/garden/grow',
  '/garden/math-mountain',
  '/garden/reading-forest',
  '/garden/night',
  '/garden/habitat/crystal_cavern',
  '/garden/habitat/bunny_burrow',
  '/garden/habitat/bird_feeder',
  '/garden/habitat/owl_box',
  '/garden/house',
  '/gems',
  '/garden/tunnels',
  '/garden/shop',
  '/times-table',
  '/letters',
  '/journal',
  '/habitats',
  '/birds',
  '/music',
  '/naturalist/walk',
  '/settings',
  '/parent',
];

const learnerArg = process.argv.indexOf('--learner');
const learner = learnerArg > -1 ? process.argv[learnerArg + 1] : null;

// React's minified hydration warnings are noisy but real; #418 and #423
// mean the server HTML and the first client render disagreed.
const FATAL_CONSOLE = /Minified React error #(418|423|425)/;

const browser = await chromium.launch();
let failures = 0;

for (const route of ROUTES) {
  const url = `${BASE}${route}${learner ? `?learner=${learner}` : ''}`;
  const page = await browser.newPage();
  const problems = [];

  page.on('pageerror', e => problems.push(`uncaught: ${String(e).slice(0, 200)}`));
  page.on('console', m => {
    if (m.type() === 'error' && FATAL_CONSOLE.test(m.text())) {
      problems.push(`hydration: ${m.text().slice(0, 160)}`);
    }
  });

  let status = 0;
  try {
    const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
    status = res?.status() ?? 0;
  } catch (e) {
    problems.push(`navigation: ${e.message.slice(0, 160)}`);
  }
  await page.waitForTimeout(500);

  const html = await page.content().catch(() => '');
  // The app's own error boundary. A 200 with this on it is still a fail.
  if (html.includes('tripped on a root')) problems.push('rendered the error boundary');
  if (status >= 400) problems.push(`HTTP ${status}`);

  if (problems.length) {
    failures++;
    console.log(`FAIL  ${route}`);
    for (const p of [...new Set(problems)]) console.log(`        ${p}`);
  } else {
    console.log(`ok    ${route}`);
  }
  await page.close();
}

await browser.close();

console.log(
  failures
    ? `\n${failures} of ${ROUTES.length} routes failed`
    : `\nall ${ROUTES.length} routes rendered cleanly`,
);
process.exit(failures ? 1 : 0);
