import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// React Testing Library v16 + vitest 4 do NOT auto-cleanup the DOM
// between tests. Without this, sequential renders accumulate elements
// in document.body and getByRole('button') finds matches from prior
// tests. Manually wire cleanup so component tests are isolated.
afterEach(() => {
  cleanup();
});
