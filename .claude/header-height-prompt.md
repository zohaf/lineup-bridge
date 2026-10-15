# Prompt: header migration, stage 1 (one height)

Copy everything below the line into a new Claude Code session in `web-template/`.

---

Implement **stage 1** of the header migration plan in one pass. Everything is decided; there are no
open questions. Stage 1 only makes every page use the new header height (60px) for its layout
offsets. **Nothing visible in the header changes.**

## Why

The new header (`SiteHeader`) is 60px at every width (`--lb-topbar-height`). The template's old
variables are still `--topbarHeight: 56px` (phones) and `--topbarHeightDesktop: 72px` (from 768px),
and about 20 files use them for sticky and fixed tops, `scroll-margin-top` and full-height pages. So
today, under the 60px bar, anchor links stop 4–12px off, the search page map leaves a 12px gap under
the bar, and full-height pages are 12px too short.

## Read first (sources of truth, in this order)

1. `.claude/design-system-rules.md`, especially **rule 10: nothing outside the design system, no
   guessing, no assuming.**
2. `.claude/working-rules.md`
3. `.claude/header.md`, section "Migration plan: every page on the new header", stage 1.
4. `.claude/tokens.md` (`--lb-topbar-height: 60px`).

If anything you need is not in these files, or a file contradicts this prompt, **stop and ask
Zoha**. Do not pick a close value or carry on with an assumption. Do not add any word or
translation key.

## What to change

### 1. Point the old variables at the new token: `src/styles/marketplaceDefaults.css`

Lines 156–157, in the `/* Topbar related */` group. Replace:

```css
  --topbarHeight: 56px;
  --topbarHeightDesktop: 72px;
```

with:

```css
  /* Header height: one value at every width (--lb-topbar-height, lineupTokens.css) */
  --topbarHeight: var(--lb-topbar-height);
  --topbarHeightDesktop: var(--lb-topbar-height);
```

`lineupTokens.css` is already imported at the top of this file (line 4), and custom properties
resolve at use, so the order is fine. Keep both variable names: the template and its components
use them, and they are removed only in stage 7.

### 2. Delete two dead `.topbar` blocks

No JavaScript uses these classes any more (both pages render `TopbarSimplified`). Delete the whole
rule block, from `.topbar {` to its closing `}`, including the comment above it:

- `src/containers/CheckoutPage/CheckoutPage.module.css`: the `.topbar` block starting at line 5.
- `src/containers/MakeOfferPage/MakeOfferPage.module.css`: the `/* Dummy Topbar */` comment and the
  `.topbar` block starting at line 4.

Before deleting, search the page folder for `css.topbar` to confirm it is still unused (it was on
Oct 15, 2026). If you find a use, stop and ask Zoha.

### 3. Nothing else

Every other file follows the variables automatically. Do **not** edit them:

| Kind | Files |
| --- | --- |
| `scroll-margin-top` (anchor offsets) | `marketplaceDefaults.css` (`:target, section`), `lineupLayout.module.css`, `LayoutSingleColumn`, `LayoutSideNavigation`, `PageBuilder`, `SectionContainer`, `BlockContainer`, `ListingPage` (reviews / author), `SearchPage` (line 221) |
| Fixed map top and height | `SearchPage.module.css` lines 377 and 383 |
| Full-height pages | `PasswordResetPage`, `PasswordRecoveryPage`, `EmailVerificationPage`, `NoAccessPage` |
| Placeholder bars | `LoadableComponentErrorBoundary`, `MaintenanceMode`, `InboxPage` / `EditListingPage` `.mobileTopbar` |
| Old logged-in bar | `Logo.module.css` line 14, `TopbarDesktop.module.css`, `CustomLinksMenu` (`LinksMenu.js`, `PriorityLinks.js`) |

## Expected between stages (not bugs)

Logged-in users still see the old, taller bar until stage 3 (about 96px on desktop). On their pages
the offsets now assume 60px instead of 72px:

- the old logged-in bar may get a little shorter on desktop (its logo and link boxes use
  `--topbarHeightDesktop` as a minimum height);
- on Find a DJ, logged in, the top of the fixed map sits a little further under the old bar;
- anchor links on logged-in pages stop a little higher.

All of this goes away in stage 3, when logged-in users get the 60px bar too.

## Do not

- Change `SiteHeader`, `Topbar`, `TopbarSimplified`, `TopbarDesktop`, `TopbarMobileMenu` or any
  header markup.
- Rename or remove `--topbarHeight` / `--topbarHeightDesktop`, or replace their uses file by file.
- Add raw px values, new tokens, translation keys or dependencies.
- Refactor unrelated code, or run tests, builds or linting (working-rules.md).

## When done

Briefly list the files changed. Remind Zoha to check at 375px, 768px and 1280px:

1. **Logged out:** the landing page (click a link to a section: the section title lands just under
   the bar), Find a DJ (from 768px the map starts right under the bar, no gap), a DJ profile, Forgot
   password and the email verification page (page fills the window; footer not pushed below the
   fold).
2. **Logged in:** Home, Account settings (side navigation) and Find a DJ. Expect only the
   between-stage differences listed above.
3. **Offer builder and checkout:** unchanged.
