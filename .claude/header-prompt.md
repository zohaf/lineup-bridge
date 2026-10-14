# Prompt: header, stage 1 (guest header + simplified header)

Copy everything below the line into a new Claude Code session in `web-template/`.

---

Implement **stage 1** of the new LineupBridge header in one pass. Everything is decided; there are no
open questions. Work **mobile first**. Stage 1 covers only:

- the header **logged-out visitors** see (every page they visit: landing, log in / sign up, search,
  DJ profiles), and
- the **simplified header** (Make offer, Request quote, Checkout).

**Logged-in users keep today's topbar unchanged.** That is stage 2.

## Read first (sources of truth, in this order)

1. `.claude/design-system-rules.md`, especially **rule 10: nothing outside the design system, no
   guessing, no assuming.**
2. `.claude/working-rules.md`
3. `.claude/header.md` (the spec, decisions and rollout)
4. `.claude/design/header.html` (the approved design. Use User = Guest, Logo height = 28px, Link
   size = 14px; Header = Simplified for the offer builder bar.)
5. `.claude/tokens.md`
6. `src/containers/FooterContainer/Footer.js` and `Footer.module.css`. The footer already sizes the
   same logo with `LinkedLogo` class props. Copy that pattern.

If anything you need is not in these files, or a file contradicts this prompt, **stop and ask
Zoha**. Do not pick a close value, invent a class or carry on with an assumption. Do not add any
word or translation key: every text below already exists.

## What to build

### 1. Tokens: `src/styles/lineupTokens.css`

Add to `:root`, in a `/* Header */` group placed before `/* Footer */`:

```css
--lb-topbar-height: 60px;
--lb-logo-header: 28px;
--lb-tracking-nav: -0.01em;
```

Do **not** change the template's `--topbarHeight` / `--topbarHeightDesktop` variables in
`marketplaceDefaults.css`. Logged-in pages still use the old bar.

### 2. Shared link style: `src/styles/lineupButtons.module.css`

Add `.linkHeader` next to `.linkFooter`, following its pattern:

```css
.linkHeader {
  composes: small from './lineupType.module.css';
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--lb-text-primary);
  letter-spacing: var(--lb-tracking-nav);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}
```

Its weight is the regular 400 that `.small` already sets. Do not add a weight.

### 3. New shared component: `src/components/SiteHeader/`

`SiteHeader.js` and `SiteHeader.module.css`. It **only displays**: no Redux, no roles, no hardcoded
text.

Props: `className`, `rootClassName`, `ariaLabel` (string, for the `<nav>`), `logoAlt` (string),
`linkToExternalSite` (passed straight to `LinkedLogo`), `children` (the items on the right;
optional).

Markup:

```
<nav class="root" aria-label={ariaLabel}>
  LinkedLogo (rootClassName=css.logoLink, logoClassName=css.logoWrapper,
              logoImageClassName=css.logoImage, layout="desktop", alt=logoAlt,
              linkToExternalSite)
  {children ? <div class="actions">{children}</div> : null}
</nav>
```

Always use `layout="desktop"`. Both layouts point to the same brand image, so this avoids a
`matchMedia` check and the hydration mismatch it can cause.

Styles, tokens only (`0`, `1px` borders and `44px` tap heights are the only raw values):

- `.root`: `display: flex; align-items: center; justify-content: space-between;
  gap: var(--lb-space-4); width: 100%; box-sizing: border-box; height: var(--lb-topbar-height);
  padding: 0 var(--lb-gutter); background-color: var(--colorPageBackground);
  border-bottom: 1px solid var(--colorGrey100);` The same height at every width; no media queries.
- `.logoLink`: `display: inline-flex; align-items: center; min-height: 44px; flex-shrink: 0;
  padding: 0;` and `&:hover { text-decoration: none; }`.
- `.logoWrapper` and `.logoImage`: the same rules as `Footer.module.css`, except
  `max-height: var(--lb-logo-header)`.
- `.actions`: `display: flex; align-items: center; gap: 0 var(--lb-space-5);`

Export it from `src/components/index.js` right after the `LinkedLogo` export, so that
`LinkedLogo` is defined before it.

### 4. Guest state in `Topbar`: `src/containers/TopbarContainer/Topbar/Topbar.js`

When the user is **not authenticated** (`!isAuthenticated`), render `SiteHeader` **instead of**
both the mobile `<nav className={... css.container ...}>` and the `<div className={css.desktop}>`
block, at every width.

- `ariaLabel`: `intl.formatMessage({ id: 'TopbarDesktop.screenreader.topbarNavigation' })`
- `logoAlt`: `intl.formatMessage({ id: 'TopbarDesktop.logo' }, { marketplaceName: config.marketplaceName })`
- `linkToExternalSite`: `config?.topbar?.logoLink`
- children, in this order (today's order):
  - `<NamedLink id="signup-link" name="SignupPage" className={buttonCss.linkHeader}>` with
    `<FormattedMessage id="TopbarDesktop.signup" />`
  - `<NamedLink id="login-link" name="LoginPage" className={buttonCss.linkHeader}>` with
    `<FormattedMessage id="TopbarDesktop.login" />`
- Keep today's hydration rule from `TopbarDesktop.js`: Sign up and Log in render only after the
  component has mounted (`useState(false)` + `useEffect(() => setMounted(true), [])`). The bar and
  the logo render on the server; the bar's height is fixed, so nothing moves.
- `import buttonCss from '../../../styles/lineupButtons.module.css';` Keep the existing import
  order (see AGENTS.md).

Everything else in `Topbar.js` stays as it is, for every user: the skip-to-content button,
`LimitedAccessBanner`, both `Modal`s, `ModalMissingInformation`, `GenericError`, all handlers and the
logged-in rendering. Guests get no menu button. Today their menu only repeats Sign up and Log in,
and the Console "Home" link is already hidden for guests.

### 5. Simplified header: `src/components/TopbarSimplified/TopbarSimplified.js`

Render `<SiteHeader>` with no children:

- `className` / `rootClassName` passed through as today
- `ariaLabel` and `logoAlt`: `intl.formatMessage({ id: 'TopbarSimplified.goToLandingPage' })`
- `linkToExternalSite`: `config?.topbar?.logoLink`

Remove the now-unused `isMobile` / `mounted` / `matchMedia` code and the
`TopbarSimplified.module.css` import from this file. Delete `TopbarSimplified.module.css`; nothing
else imports it.

## Result to check against `design/header.html`

- **Guest, every width:** a 60px bar with the logo (28px tall) on the left, and Sign up and Log in on
  the right. 14px, regular weight, black, underlined on hover. A thin rule under the bar. No menu
  button.
- **Make offer / Request quote / Checkout:** the same bar with the logo on the left and nothing
  else.
- **Logged in:** exactly as before.

## Do not

- Change anything a logged-in user sees: `TopbarDesktop`, `TopbarMobileMenu`, `CustomLinksMenu`,
  or the role logic in `Topbar.js`.
- Edit `Logo`, `LinkedLogo` or any other shared template component (rule 9).
- Add translation keys or words, change routes, or touch Console config.
- Use raw px values (except `0`, `1px` borders and `44px`), hex colors or `--fontWeight*` tokens.
- Add dependencies, refactor unrelated code, delete the unused search / "Post a new listing" code,
  or run tests, builds or linting (working-rules.md).

## When done

Briefly list the files changed. Remind Zoha to check at 375px, 768px and 1280px:

1. Logged out: landing page, log in, sign up, search and a DJ profile.
2. Logged in: the make-offer page (simplified header), then Home and one other page, to confirm the
   logged-in topbar is unchanged.
