/**
 * Lighthouse lab audit of the pages in pages.js. Each page runs 3 times and the median run (by
 * performance score) is kept, because single runs vary.
 *
 *   node scripts/audit/lighthouse.mjs             # mobile: Moto G class device, slow 4G
 *   node scripts/audit/lighthouse.mjs --desktop
 *
 * Writes audit-results/lighthouse.json and prints a summary table.
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import * as chromeLauncher from 'chrome-launcher';

const require = createRequire(import.meta.url);
const { chromium } = require('@playwright/test');
const { baseURL, pages, resultsDir } = require('./pages.js');

const RUNS = 3;
const desktop = process.argv.includes('--desktop');

const metricIds = {
  fcp: 'first-contentful-paint',
  lcp: 'largest-contentful-paint',
  tbt: 'total-blocking-time',
  cls: 'cumulative-layout-shift',
  speedIndex: 'speed-index',
  ttfb: 'server-response-time',
};

const auditPages = process.env.AUDIT_LISTING_PATH
  ? [...pages, { name: 'public-profile', path: process.env.AUDIT_LISTING_PATH }]
  : pages;

const summarize = lhr => {
  const audits = lhr.audits;
  const metrics = Object.fromEntries(
    Object.entries(metricIds).map(([key, id]) => [key, audits[id]?.numericValue ?? null])
  );
  const lcpElement = audits['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]
    ?.node;
  // Failing audits from every category, worst first
  const failing = Object.values(audits)
    .filter(a => a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== 'informative')
    .sort((a, b) => a.score - b.score)
    .map(a => ({ id: a.id, title: a.title, score: a.score, value: a.displayValue || null }));

  return {
    scores: Object.fromEntries(
      Object.entries(lhr.categories).map(([id, c]) => [id, Math.round(c.score * 100)])
    ),
    metrics,
    lcpElement: lcpElement ? { selector: lcpElement.selector, snippet: lcpElement.snippet } : null,
    failing,
  };
};

const run = async () => {
  const chrome = await chromeLauncher.launch({
    chromePath: chromium.executablePath(),
    chromeFlags: ['--headless=new'],
  });
  const results = [];
  try {
    for (const { name, path: pagePath } of auditPages) {
      const url = `${baseURL}${pagePath}`;
      const runs = [];
      for (let i = 0; i < RUNS; i++) {
        const { lhr } = await lighthouse(
          url,
          { port: chrome.port, output: 'json', logLevel: 'error' },
          desktop ? desktopConfig : undefined
        );
        runs.push(summarize(lhr));
      }
      runs.sort((a, b) => a.scores.performance - b.scores.performance);
      const median = runs[Math.floor(RUNS / 2)];
      results.push({ name, url, runs: runs.map(r => r.scores.performance), ...median });
      console.log(`${name}: done`);
    }
  } finally {
    await chrome.kill();
  }

  fs.mkdirSync(resultsDir, { recursive: true });
  const file = path.join(resultsDir, `lighthouse${desktop ? '-desktop' : ''}.json`);
  fs.writeFileSync(file, JSON.stringify({ baseURL, desktop, results }, null, 2));

  console.table(
    results.map(({ name, scores, metrics: m }) => ({
      page: name,
      perf: scores.performance,
      a11y: scores.accessibility,
      bp: scores['best-practices'],
      seo: scores.seo,
      'LCP s': (m.lcp / 1000).toFixed(2),
      'TBT ms': Math.round(m.tbt),
      CLS: m.cls.toFixed(3),
      'TTFB ms': Math.round(m.ttfb),
    }))
  );
  console.log(`Written to ${file}`);
};

run().catch(e => {
  console.error(e);
  process.exit(1);
});
