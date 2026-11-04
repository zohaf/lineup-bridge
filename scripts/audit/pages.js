/**
 * Pages and widths the frontend audit runs on. Shared by the Lighthouse script and the Playwright
 * checks, and read by the fe-auditor agent.
 *
 * AUDIT_BASE_URL: the site to audit (default: the production build on http://localhost:4000,
 *   `yarn dev-server`). Audit performance on a build, not on `yarn dev`.
 * AUDIT_LISTING_PATH: a public profile path (/l/:slug/:id). If unset, the first one linked from
 *   the search page is used.
 */
const baseURL = (process.env.AUDIT_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');

const pages = [
  { name: 'landing', path: '/' },
  { name: 'search', path: '/s' },
  { name: 'login', path: '/login' },
  { name: 'signup', path: '/signup' },
  { name: 'dj-profile-guidelines', path: '/dj-profile-guidelines' },
];

// Widths from CLAUDE.md: check every page at 375, 768, 1024 and 1280px.
const viewports = [
  { name: 'phone', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1024, height: 768 },
  { name: 'desktop', width: 1280, height: 800 },
];

// Spacing scale from src/styles/lineupTokens.css (--lb-space-1 … --lb-space-10).
const spacingScale = [0, 4, 8, 12, 16, 24, 32, 48, 56, 64, 96];

const resultsDir = 'audit-results';

module.exports = { baseURL, pages, viewports, spacingScale, resultsDir };
