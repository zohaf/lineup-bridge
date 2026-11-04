const fs = require('fs');
const path = require('path');
const { pages, resultsDir } = require('./pages');

/**
 * Pages to audit. The public profile is added when AUDIT_LISTING_PATH is set; otherwise its test
 * looks up the first /l/ link on the search page (see findListingPath).
 */
const auditPages = [...pages, { name: 'public-profile', path: process.env.AUDIT_LISTING_PATH }];

const findListingPath = async page => {
  await page.goto('/s', { waitUntil: 'networkidle' });
  const link = page.locator('a[href^="/l/"]').first();
  return (await link.count()) ? link.getAttribute('href') : null;
};

// Opens an audit page, resolving the public profile path when it was not given.
const openAuditPage = async (page, auditPage) => {
  const pagePath = auditPage.path || (await findListingPath(page));
  if (!pagePath) {
    return null;
  }
  await page.goto(pagePath, { waitUntil: 'networkidle' });
  return pagePath;
};

// Writes one JSON file per check, page and width: audit-results/<check>/<page>-<width>.json
const writeResult = (check, pageName, projectName, data) => {
  const dir = path.join(resultsDir, check);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, `${pageName}-${projectName}.json`),
    JSON.stringify(data, null, 2)
  );
};

module.exports = { auditPages, findListingPath, openAuditPage, writeResult };
