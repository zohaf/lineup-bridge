const { test, expect } = require('@playwright/test');
const { spacingScale } = require('./pages');
const { auditPages, openAuditPage, writeResult } = require('./helpers');

// Runs in the page: layout and target-size measurements of the rendered DOM.
const measureLayout = scale => {
  // CSS module class "HeroSearch_root__x1y2z" -> "HeroSearch.root"
  const componentOf = el => {
    const cls = [...el.classList].find(c => /^[A-Za-z]+_[A-Za-z0-9]+__/.test(c));
    return cls ? cls.replace(/^([A-Za-z]+)_([A-Za-z0-9]+)__.*/, '$1.$2') : el.tagName.toLowerCase();
  };
  const isVisible = el => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
  };
  const vw = document.documentElement.clientWidth;
  const all = [...document.querySelectorAll('body *')].filter(isVisible);

  // Wider than the viewport: causes horizontal scroll (WCAG 1.4.10 at 320/375px)
  const overflow = all
    .filter(el => el.getBoundingClientRect().right > vw + 1)
    .map(el => ({
      component: componentOf(el),
      right: Math.round(el.getBoundingClientRect().right),
    }))
    .slice(0, 20);

  // Interactive targets: under 24px fails WCAG 2.5.8, under 44px is off the design system
  const interactive = all.filter(el =>
    el.matches('a[href], button, input:not([type="hidden"]), select, textarea, [role="button"]')
  );
  const targets = interactive
    .map(el => {
      const r = el.getBoundingClientRect();
      return {
        component: componentOf(el),
        text: (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 40),
        width: Math.round(r.width),
        height: Math.round(r.height),
        inline: getComputedStyle(el).display === 'inline',
      };
    })
    .filter(t => Math.min(t.width, t.height) < 44);

  // Inputs under 16px make iOS Safari zoom in on focus
  const smallInputs = all
    .filter(el => el.matches('input, select, textarea'))
    .filter(el => parseFloat(getComputedStyle(el).fontSize) < 16)
    .map(el => ({ component: componentOf(el), fontSize: getComputedStyle(el).fontSize }));

  // Spacing values off the --lb-space-* scale, grouped by component
  const props = [
    'marginTop',
    'marginBottom',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'rowGap',
    'columnGap',
  ];
  const offScale = {};
  all.forEach(el => {
    const s = getComputedStyle(el);
    props.forEach(p => {
      const v = parseFloat(s[p]);
      if (!Number.isNaN(v) && !scale.includes(Math.round(v))) {
        const key = `${componentOf(el)} ${p}`;
        offScale[key] = offScale[key] || new Set();
        offScale[key].add(Math.round(v));
      }
    });
  });

  return {
    viewportWidth: vw,
    scrollWidth: document.documentElement.scrollWidth,
    overflow,
    targets,
    smallInputs,
    offScaleSpacing: Object.entries(offScale).map(([key, values]) => ({
      key,
      values: [...values],
    })),
  };
};

// Runs in the page: each button's look, to compare the server HTML with the hydrated page.
// Buttons outside the page area (e.g. the skip link before it has focus) are left out.
const readButtons = () =>
  [...document.querySelectorAll('button')].map(el => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      text: el.innerText.trim().slice(0, 40),
      onPage: r.width > 1 && r.height > 1 && r.right > 0 && r.bottom + window.scrollY > 0,
      disabled: el.disabled,
      background: s.backgroundColor,
      color: s.color,
    };
  });

for (const auditPage of auditPages) {
  test(`layout: ${auditPage.name}`, async ({ page, browser }, testInfo) => {
    const consoleErrors = [];
    const failedRequests = [];
    page.on('console', m => m.type() === 'error' && consoleErrors.push(m.text()));
    page.on('pageerror', e => consoleErrors.push(e.message));
    page.on('response', r => r.status() >= 400 && failedRequests.push(`${r.status()} ${r.url()}`));

    const pagePath = await openAuditPage(page, auditPage);
    test.skip(!pagePath, 'No public profile found on the search page');

    const layout = await page.evaluate(measureLayout, spacingScale);

    // Server-rendered HTML without JavaScript: what people see before the bundle hydrates.
    // A button that looks different here flashes when the page hydrates.
    const ssrContext = await browser.newContext({
      javaScriptEnabled: false,
      viewport: page.viewportSize(),
    });
    const ssrPage = await ssrContext.newPage();
    await ssrPage.goto(new URL(pagePath, testInfo.project.use.baseURL).href);
    const ssrButtons = await ssrPage.evaluate(readButtons);
    await ssrContext.close();
    const hydratedButtons = await page.evaluate(readButtons);
    const hydrationFlash = ssrButtons
      .filter(before => before.onPage)
      .map(before => {
        const after = hydratedButtons.find(b => b.text === before.text);
        const changed =
          after &&
          (before.disabled !== after.disabled ||
            before.background !== after.background ||
            before.color !== after.color);
        return changed ? { text: before.text, before, after } : null;
      })
      .filter(Boolean);

    const result = { path: pagePath, ...layout, hydrationFlash, consoleErrors, failedRequests };
    writeResult('layout', auditPage.name, testInfo.project.name, result);

    expect.soft(layout.scrollWidth, 'horizontal scroll').toBeLessThanOrEqual(layout.viewportWidth);
    expect
      .soft(
        layout.targets.filter(t => !t.inline && Math.min(t.width, t.height) < 24),
        'targets under 24px (WCAG 2.5.8)'
      )
      .toEqual([]);
    expect.soft(layout.smallInputs, 'inputs under 16px').toEqual([]);
    expect.soft(consoleErrors, 'console errors').toEqual([]);
    expect.soft(hydrationFlash, 'buttons that change on hydration').toEqual([]);
  });
}
