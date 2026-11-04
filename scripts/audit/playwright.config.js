const { defineConfig } = require('@playwright/test');
const { baseURL, viewports, resultsDir } = require('./pages');

// One project per audit width, so every check runs at 375, 768, 1024 and 1280px.
module.exports = defineConfig({
  testDir: '.',
  testMatch: '*.pw.js',
  outputDir: `../../${resultsDir}/playwright`,
  reporter: [['list'], ['json', { outputFile: `../../${resultsDir}/playwright.json` }]],
  fullyParallel: true,
  retries: 0,
  timeout: 60000,
  use: { baseURL, screenshot: 'only-on-failure' },
  projects: viewports.map(({ name, width, height }) => ({
    name,
    use: { browserName: 'chromium', viewport: { width, height } },
  })),
});
