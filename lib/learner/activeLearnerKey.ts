/**
 * Cookie name only — kept in its own module so client components
 * (ProfileTile in particular) can import it without dragging
 * `next/headers` into the browser bundle.
 *
 * The server-side resolver lives in `./activeLearner.ts`.
 */
export const ACTIVE_LEARNER_COOKIE = 'gqs-active-learner';
