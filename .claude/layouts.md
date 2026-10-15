# Page layouts: spec

Oct 12, 2026 · Zoha Fard

Every redesigned page uses one of two layouts: **Centered** or **Split**. A page picks a layout and a
variant and then fills it with library components (`PageHeader`, `SectionCard`, fields, buttons).
Pages do not carry their own layout CSS. Follow [design-system-rules.md](design-system-rules.md) for components
and [tokens.md](tokens.md) for token values.

- Design: [design/layouts.html](design/layouts.html) (toolbar: layout, view, tags)
- Not covered: the landing page and Console content pages (`PageBuilder`) keep their own layout.
  Transaction page (negotiation) and checkout: Split · summary, see [booking-journey.md](booking-journey.md).

## 1. The two layouts

### Centered

One column, centered on the page. The variant sets the column's maximum width.

| Variant | Max width | Used by |
| --- | --- | --- |
| `narrow` | 440px | Log in `/login`, Sign up `/signup`, Password recovery `/recover-password`, Password reset `/reset-password` |
| `profile` | 600px | Public profile `/l/:slug/:id` (`ListingPage`, spec [public-profile-page.md](public-profile-page.md)) |
| `form` | 760px | Complete your offer `/l/:slug/:id/request-quote` (`RequestQuotePage`, already redesigned, 760px) |
| `wide` | 920px | Home `/p/home`, logged-in section (`HomeNextSteps`, `OwnListingsSummary` in `CMSPage.js`, already 920px) |

- Page side padding: `--lb-gutter` (24px → 32px from 768px). On phones the column is full width
  minus the gutter.
- New variants are added here first, only when a page needs one.

#### Log in and sign up

- Both use `narrow` (440px) so switching between them does not move the page.
- **Sign up is longer** (user type, 5 fields, Console user fields, two checkboxes). It stays in the
  same single card and one column; the page simply scrolls and the button is at the end. No steps
  (they would need new words like "Back" and change the signup logic) and no side-by-side fields
  (440px is too narrow for pairs).
- The user type choice ("I am a ..." event organizer / DJ) uses the choice tiles from the offer
  builder (black border when selected).
- **Approved (option A):** the existing "Sign up / Log in" tabs as text on the beige page (current tab
  underlined in black), the form below in one white card. Normal topbar and footer.
- No social login buttons (we don't use Google or Facebook login).

### Split

A main column and a side column. The **role** of the side column sets where it sits and how it
behaves on phones.

| Role | Desktop (from 1024px) | Phone and tablet (below 1024px) | Used by |
| --- | --- | --- | --- |
| `nav` | Side column on the **left**, 264px, sticky: the **step menu** (below). Main column on the right, max 760px (the same width as a centered form). | The step menu becomes a **row under the topbar** that stays visible while scrolling and scrolls sideways if the items don't fit. | DJ profile builder `/l/:slug/:id/:type/:tab` (`EditListingPage`), Account settings `/account/*` (Contact details, Password, Payout details, Payment methods, Manage account) |
| `summary` | Page header and main column on the **left** (offer details / payment form, max 760px). Side column on the **right**, 360px, sticky below the topbar, level with the first main card (or with the page title when the page has no main content): the "Booking summary" card (price only; the DJ is in the header). | Header, then the summary card, then the main column. Actions: primary + secondary in a sticky bar (side by side from 768px, stacked on phones), the minor action as a text link at the end. | Transaction page, negotiation (`/order/:id`, `/sale/:id`) and checkout `/l/:slug/:id/checkout` (decided Oct 15) |

- Split container: max 1120px, centered. Gap between columns: 48px.
- Sticky side column: sticks `--lb-space-5` (24px) below the topbar.
- The summary card on phones is **not** a collapsible "show summary" bar: that would need a new label.
  If we want one later, the wording needs approval first.
- The menu items are the existing ones. DJ profile builder steps come from the listing type's config
  (for example Profile, Pricing, Photos). Account settings items come from
  `LayoutWrapperAccountSettingsSideNav`.

#### Step menu (replaces the template's side tabs)

Same visual language as the offer builder's section titles. It is a new shared component (`StepMenu`)
and goes into `design/components.html` before it is built.

- **Desktop:** a white card (1px border, 8px radius, like a section card) in the side column,
  padding 12px 24px. One item per row, at least 44px high: a 28px number circle, 12px gap, the label
  in body size.
- **States:**
  - Default: circle with a 1px black outline, black number, label in 400.
  - **Current: black filled circle, white number, label in 600.** Open: this conflicts with
    design-system-rules.md rule 8 (selection is an outline, not a fill). Decide with the DJ profile
    builder redesign.
  - Hover: the circle fills white.
  - Not reachable yet (DJ profile builder, new profile: steps after the first unsaved one): circle,
    number and label in light grey, not clickable. This is the wizard's existing disabled state.
- **Phone and tablet: numbers only.** The circles sit in one row (44px touch targets, 12px apart), on
  the beige page background with a 1px rule underneath, sticky under the topbar. No labels and no
  sideways scrolling: the current step's name is already the page title. The labels stay in the HTML
  for screen readers.
- **Account settings:** these pages are not steps in order, and the design system only uses numbers
  for real sequences. Compare "Numbers" / "No numbers" in the design file. Without numbers, the
  current item gets a 2px black bar (left on desktop, under the label on phones). **Decision open.**
  Note: numbers only on phones works only with numbers. Without numbers, phones need the labels in a
  row that scrolls sideways (more to build).

### Shared by both

- **Topbar and footer are passed in by the page**, as today: checkout and the offer page keep
  `TopbarSimplified` and no footer; other pages use `TopbarContainer` and `FooterContainer`.
- **Sticky or not depends on the topbar, not the layout:**
  - The full topbar (`TopbarContainer`, with navigation) stays **sticky**, as it is on every page today.
  - The simplified topbar (`TopbarSimplified`, logo only: offer page, checkout) is **static**. It has
    nothing to navigate to, so pinning it only takes screen height on phones. This matches the
    approved offer design and the current code.
- **Vertical space (one rule for every layout):** content starts **one gutter** below the topbar:
  24px on phones, 32px from 768px (`--lb-page-top: var(--lb-gutter)`). The top inset equals the side
  inset, and it steps at the same 768px breakpoint as the gutter and the card padding. Bottom padding
  `--lb-space-9` (64px). 48px is section spacing (landing), not page spacing.
- **The page header is not part of the layout.** It is the first thing in the main column
  (`PageHeader`), so a split page's header sits above the form, not across both columns.
- **Background: the beige page color (`--colorPageBackground`, #eeede9), with white cards, exactly as on
  the offer builder.** No grey page backgrounds. The palette stays as it is until the app color
  palette is decided together with the landing page.

## 2. Tokens

Add to `src/styles/lineupTokens.css`, next to the type and spacing tokens:

```css
--lb-width-narrow: 440px;
--lb-width-profile: 600px;
--lb-width-form: 760px;
--lb-width-wide: 920px;
--lb-width-split: 1120px;
--lb-side-nav: 264px;
--lb-side-summary: 360px;
--lb-split-gap: var(--lb-space-7);     /* 48px */
--lb-page-top: var(--lb-gutter);       /* 24px, 32px from 768px: same as the side gutter */
--lb-page-bottom: var(--lb-space-9);   /* 64px */
--lb-sticky-top: var(--lb-space-5);    /* below the topbar */
```

Split switches to two columns at `--viewportLarge` (1024px), the same breakpoint the template uses
for checkout. No new breakpoints.

## 3. Front-end architecture

```
src/styles/
  lineupTokens.css            # + layout tokens above
  lineupLayout.module.css     # NEW: .centered + .narrow/.form/.wide, .split + .nav/.summary, .side, .main
src/components/
  LayoutCentered/             # NEW: LayoutCentered.js + .module.css (+ .example.js)
  LayoutSplit/                # NEW: LayoutSplit.js + .module.css (+ .example.js)
  StepMenu/                   # NEW: numbered side menu for Split · nav (built with the first nav page)
  LayoutComposer/             # template, NOT edited
```

1. **Two levels.** `lineupLayout.module.css` holds the column rules as plain classes.
   `LayoutCentered` and `LayoutSplit` are built on the template's `LayoutComposer` with the same
   areas as `LayoutSingleColumn` (topbar, main with `id="main-content"`, footer), but with our own
   classes. So they own the topbar's sticky setting (`stickyTopbar`, default `true`; the offer page
   and checkout pass `false`) and they add no template padding (no 12px top padding, no CSS-order
   overrides). `LayoutComposer` itself is not edited. Pages that
   cannot use the components, like the home page, which is rendered inside `PageBuilder`, compose
   the classes directly (`composes: centered wide from '../../styles/lineupLayout.module.css';`).
2. **Props, no text.**
   - `<LayoutCentered variant="narrow|form|wide" topbar={…} footer={…} stickyTopbar={true|false}>{children}</LayoutCentered>`
   - `<LayoutSplit role="nav|summary" side={…} topbar={…} footer={…}>{children}</LayoutSplit>`
   - The layout renders no words. Menu items, headers and cards come from the page.
3. **CSS only, no JavaScript layout switching.** The columns change with media queries, not
   `LayoutComposer`'s `responsiveAreas` (which only runs in the browser and would flash on
   server-rendered pages).
4. **Source order = phone order.** The side column comes first in the HTML for both roles (menu
   above the form, summary above the payment form). On desktop, CSS grid places the summary on the
   right. No `order` tricks, so screen readers and keyboard users follow the same order as phones.
5. **The template's own layouts are not edited.** `LayoutSingleColumn` and `LayoutSideNavigation`
   stay as they are, so pages we have not redesigned keep working, and template updates still merge
   cleanly. `LayoutSideNavigation` stops being used page by page as pages move to `LayoutSplit`.

## 4. Implementation plan

**Rule: build a layout only when a page needs it.** Centered has three pages now (offer, home, log
in / sign up), so it is built now. Split has no redesigned page yet, so it stays on paper until the
first Split page (DJ profile builder) is redesigned.

**Out of scope for every step below:** the DJ profile builder (`EditListingPage`), account settings
(`/account/*`), checkout (`CheckoutPage`), and every other page not named in the step. Do not create
`LayoutSplit` or `StepMenu` yet. Do not edit `LayoutComposer`, `LayoutSingleColumn` or
`LayoutSideNavigation`.

Each step is a separate prompt and commit. Check every step at 375, 768, 1024 and 1280px.

### Now: Centered

**Step 1: tokens and layout styles.** Add the Centered tokens (`--lb-width-narrow`, `-form`, `-wide`,
`--lb-page-top`, `--lb-page-bottom`) to `lineupTokens.css`. Create `lineupLayout.module.css` with
`.centered`, `.narrow`, `.form`, `.wide`. No page changes.

**Step 2: `LayoutCentered` component** (+ styleguide example), exported from
`src/components/index.js` in the existing import order. No page changes.

**Step 3: move the two pages that already look right.** They must look the same afterwards, with
one intended change: from 768px the space above the content becomes 32px (one gutter) instead of
24px. The offer page passes `stickyTopbar={false}`.
- Complete your offer (`RequestQuotePage`): `LayoutCentered variant="form"` instead of its own column
  CSS.
- Home (`CMSPage.module.css` `.homeInner`, `.ownListingsInner`): compose `centered wide` instead of
  the hand-written width and padding.

**Step 4: log in and sign up redesign** (its own page spec and design, approved option A) on
`LayoutCentered variant="narrow"`. Password recovery and reset follow.

### Later: Split (with the first Split page redesign)

- DJ profile builder: add `StepMenu` to `components.html`, then build `LayoutSplit role="nav"` and
  `StepMenu` together with that page.
- Account settings: reuse them.
- Built Oct 15: `LayoutSplit` (summary role only, props `header`, `side`, `after`) for the transaction page and checkout. The `nav` role and `StepMenu` follow with the DJ profile builder.

Each page gets its own spec and design file, like [offer-builder-page.md](offer-builder-page.md).
This doc only fixes the frame they sit in.

## 5. Open items

- [ ] Email verification `/verify-email`: centered narrow too? Not listed yet.
- [x] Transaction page (negotiation): Split · summary; header in the left column, summary level with the first card (or the title when there is no content), Oct 15, 2026.
- [x] Public profile = listing page `/l/:slug/:id`, Centered `profile` (600px), Oct 14, 2026.
