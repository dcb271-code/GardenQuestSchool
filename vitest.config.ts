import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    exclude: ['tests/e2e/**'],
    // The full suite intermittently hung forever (three 10-minute
    // losses in one week) and never under targeted runs. The suite's
    // dominant cost is jsdom environment setup/teardown, and worker
    // teardown wedges are a known failure class of the threads pool
    // with jsdom. Forks are hang-resistant and benchmarked the same
    // (42s vs 43-46s). If a run STILL wedges: pkill -f vitest and
    // rerun — orphaned workers from a killed run can deadlock the
    // next one.
    pool: 'forks',
    teardownTimeout: 20_000,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
