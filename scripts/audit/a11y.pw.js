const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { auditPages, openAuditPage, writeResult } = require('./helpers');

// WCAG 2.2 AA plus axe best practices. axe finds part of the issues only: keyboard use, focus
// order and screen reader output still need a manual pass (see the fe-auditor agent).
const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

for (const auditPage of auditPages) {
  test(`a11y: ${auditPage.name}`, async ({ page }, testInfo) => {
    const pagePath = await openAuditPage(page, auditPage);
    test.skip(!pagePath, 'No public profile found on the search page');

    const { violations, incomplete } = await new AxeBuilder({ page }).withTags(tags).analyze();
    const toFinding = ({ id, impact, help, helpUrl, tags: ruleTags, nodes }) => ({
      id,
      impact,
      help,
      helpUrl,
      wcag: ruleTags.filter(t => /^wcag\d/.test(t)),
      nodes: nodes.map(n => ({ target: n.target, html: n.html, summary: n.failureSummary })),
    });

    writeResult('a11y', auditPage.name, testInfo.project.name, {
      path: pagePath,
      violations: violations.map(toFinding),
      // Rules axe could not decide, e.g. contrast over an image: check these by hand
      needsReview: incomplete.map(toFinding),
    });

    const blocking = violations.filter(v => ['serious', 'critical'].includes(v.impact));
    expect(blocking.map(v => `${v.impact}: ${v.id}`)).toEqual([]);
  });
}
