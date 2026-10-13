# Prompt: implement the footer

Copy everything below the line into a new Claude Code session in `web-template/`.

---

Implement the new LineupBridge footer in one pass. Everything is decided; there are no open
questions. Work **mobile first**: write the phone styles as the base, then add `--viewportMedium`
(768px) and `--viewportLarge` (1024px) overrides.

## Read first (sources of truth, in this order)

1. `.claude/design-system-rules.md`, especially **rule 10: nothing outside the design system, no
   guessing, no assuming.**
2. `.claude/working-rules.md`
3. `.claude/footer.md` (the spec and the decisions)
4. `.claude/design/footer.html` (the approved design: Mobile, iPad 768, Desktop)
5. `.claude/design/components.html`, section "Footer" (Footer link, Muted link, Social icon)
6. `.claude/tokens.md`

If anything you need is not in these files, or a file contradicts this prompt, **stop and ask
Zoha**. Do not pick a close value, invent a class or carry on with an assumption. Do not add any word
that isn't listed below.

## What to build

Replace the Console-driven footer (`FooterContainer` → `PageBuilder` `SectionBuilder` →
`SectionFooter`) with a footer built in code. The code controls all of the UI. **The only content
that comes from Console is the social links.**

### 1. Tokens: `src/styles/lineupTokens.css`

Add to `:root`, in a `/* Footer */` group:

```css
--lb-logo-footer: 24px;
--lb-icon-social: 20px;
```

### 2. Shared link styles: `src/styles/lineupButtons.module.css`

Add these two classes next to `.link`, following its pattern (`composes: small from
'./lineupType.module.css'`):

- `.linkFooter`: weight `--lb-weight-semibold`, `--lb-text-primary`, no underline. Underlined on
  hover (`text-underline-offset: 3px`). `display: inline-flex; align-items: center; min-height: 44px`.
- `.linkMuted`: weight `--lb-weight-regular`, `--lb-text-muted`, no underline. On hover:
  `--lb-text-primary`, underlined (offset 3px). The same 44px inline-flex box.

### 3. New shared component: `src/components/SocialIcon/`

- `SocialIcon.js` and `SocialIcon.module.css`. Props: `platform` (required), `className`,
  `rootClassName`, `ariaLabel`.
- Supported platforms: exactly the template's keys: `facebook`, `instagram`, `linkedin`,
  `pinterest`, `tiktok`, `twitter`, `youtube`. An unknown platform renders `null`.
- For each platform, copy the `<path>` data **unchanged** from
  `src/containers/PageBuilder/Primitives/Link/Icons/<name>Icon.js`. Set
  `viewBox="0 0 W H"`, where W and H are that file's own `width` and `height` attributes, and remove
  the fixed `width` and `height`. `role="img"`, `aria-label` = `ariaLabel`, `fill="currentColor"`.
- CSS: `.root { width: var(--lb-icon-social); height: var(--lb-icon-social); display: block; }`.
  The viewBox keeps each icon's proportions inside the 20px box.
- **Do not edit** anything in `PageBuilder/Primitives/Link/Icons/` (rule 9).
- Export it from `src/components/index.js`, keeping the existing import order (put it with the
  other small shared components, before anything that might import it).

### 4. The footer: `src/containers/FooterContainer/`

Add `Footer.js` and `Footer.module.css`. Rewrite `FooterContainer.js` so that it:

- reads `const { footer = {}, topbar } = useConfiguration();`
- **always** renders `<Footer>`. Remove the "no footer asset → render nothing" early return, and
  remove the `loadable` `SectionBuilder` import.
- passes `socialMediaLinks={footer.socialMediaLinks || []}` and
  `linkLogoToExternalSite={topbar?.logoLink}`.

**Social links from Console.** Each item in `footer.socialMediaLinks` has this shape:
`{ link: { fieldType: 'socialMediaLink', platform, url } }` (confirm it against
`git show upstream/main:src/containers/PageBuilder/SectionBuilder/SectionFooter/SectionFooter.js`,
which reads `sml.link.platform`). For each item, run `exposeSocialMediaProps(item.link)` from
`src/containers/PageBuilder/Field/Field.helpers.js`; it sanitizes the URL and validates the platform.
Skip any item with no `href` or no `platform`. Render each one as an `ExternalLink` (from
`../../components`) containing a `SocialIcon`, with `aria-label` and `title` set to the platform
name: Facebook, Instagram, LinkedIn, Pinterest, TikTok, X, YouTube (these are the names in the
template's `SocialMediaLink.js`). **If no valid links remain, do not render the social list at all.**

**Markup** (semantic HTML, mirroring `design/footer.html`):

```
<footer class="root">
  <div class="top">
    <div class="brand">  LinkedLogo · <p class="slogan">  </div>
    <ul class="nav">     FAQ · Contact us                   </ul>
  </div>
  <div class="meta">
    <div class="legal">  <p class="copyright"> · Privacy policy · Terms of use · Payment terms </div>
    <ul class="social">  icons (only if any)               </ul>
  </div>
</footer>
```

**Logo:** use `LinkedLogo` from `../../components` (the brand logo image from the branding config;
do not use the text wordmark from the mockup). Pass `linkToExternalSite` and `layout` ('mobile'
below 1024px, otherwise 'desktop', using the same `matchMedia` check as today's `SectionFooter.js`).
Size it with `rootClassName`, `logoClassName` and `logoImageClassName`, the same way
`SectionFooter.module.css` does today (`.logoLink`, `.logoWrapper`, `.logoImage`). Change only the
height: `max-height: var(--lb-logo-footer)`.

**Links.** All internal links use `NamedLink`. No absolute `lineupbridge.com` URLs.

| Label | Route |
| --- | --- |
| FAQ | `name="CMSPage" params={{ pageId: 'faq' }}` |
| Contact us | `name="CMSPage" params={{ pageId: 'contact-us' }}` |
| Privacy policy | `name="PrivacyPolicyPage"` |
| Terms of use | `name="CMSPage" params={{ pageId: 'terms-of-use' }}` |
| Payment terms | `name="CMSPage" params={{ pageId: 'payment-terms' }}` |

FAQ and Contact us use `css.linkFooter`, composed from `lineupButtons.module.css`. The legal links
use `.linkMuted`.

**Copy.** Use `FormattedMessage`. Add these keys to `src/translations/en.json`, `de.json`,
`es.json` and `fr.json`. These are the exact words in today's footer, so they are not new words.
Use the English text in all four files.

| Key | Text |
| --- | --- |
| `Footer.slogan` | Built for the electronic music industry |
| `Footer.faq` | FAQ |
| `Footer.contactUs` | Contact us |
| `Footer.privacyPolicy` | Privacy policy |
| `Footer.termsOfUse` | Terms of use |
| `Footer.paymentTerms` | Payment terms |
| `Footer.copyright` | © {year} LineupBridge. All rights reserved |

`year` = `new Date().getFullYear()`.

**Styles (`Footer.module.css`), tokens only, mobile first.** Import
`../../styles/customMediaQueries.css`. Type comes from `composes: small from
'../../styles/lineupType.module.css'`. Reset `margin: 0; padding: 0; list-style: none` on `p` and
`ul`, using class selectors only.

- `.root`: `background: var(--colorPageBackground)`, `border-top: 1px solid var(--colorGrey100)`,
  `padding: var(--lb-space-6) var(--lb-gutter) var(--lb-space-5)`, `display: grid;
  gap: var(--lb-space-6)`. Full width, with no max-width (the same inset as the topbar).
- `.brand`: grid, `gap: var(--lb-space-2)`, `justify-items: start`.
- `.slogan`: small, `--lb-text-secondary`.
- `.nav`: flex, wrap, `gap: 0 var(--lb-space-5)`.
- `.meta`: `border-top: 1px solid var(--colorGrey100)`, `padding-top: var(--lb-space-4)`, flex,
  wrap, `align-items: center`, `justify-content: space-between`,
  `gap: var(--lb-space-3) var(--lb-space-6)`.
- `.legal`: flex, wrap, `align-items: center`, `gap: 0 var(--lb-space-5)`.
- `.copyright`: small, `--lb-text-muted`, `flex-basis: 100%`, `order: 2`,
  `padding-top: var(--lb-space-2)`. On phones and iPad it sits on its own line under the legal links.
- `.social`: flex, `gap: var(--lb-space-1)`, `margin-left: calc(-1 * var(--lb-space-3))` (lines the
  first icon up with the text).
- `.socialLink`: `44px` square, `display: grid; place-items: center`, `color: var(--lb-text-muted)`,
  hover `var(--lb-text-primary)`.
- `@media (--viewportMedium)`: `.root` padding `var(--lb-space-7) var(--lb-gutter) var(--lb-space-6)`.
  `.top` flex, `justify-content: space-between`, `align-items: center`, `gap: var(--lb-space-6)`.
  `.meta` `padding-top: var(--lb-space-2)`, `flex-wrap: nowrap`, `align-items: flex-start`.
  `.legal` `flex: 1 1 auto; min-width: 0`. `.social` `margin-left: 0;
  margin-right: calc(-1 * var(--lb-space-3))`.
- `@media (--viewportLarge)`: `.copyright` `flex-basis: auto; order: 0; padding-top: 0` (it joins the
  legal links on one line).

Result per view (check against `design/footer.html`):

- **Mobile:** stacked and left-aligned: logo, slogan, FAQ / Contact us, rule, legal links,
  copyright, icons.
- **iPad 768:** two rows. Logo + slogan on the left, links on the right. Legal links with the icons on
  the right, and the copyright underneath.
- **Desktop:** two rows. Row 2 is the copyright and the legal links on one line, with the icons on the
  right.

## Do not

- Edit `SectionFooter`, `PageBuilder`, `Logo`, the template icon files or any other shared template
  component. Leave `SectionFooter` in place. It is no longer used by the footer; deleting it is a
  separate decision.
- Change `hostedAssets.duck.js` or `configHelpers.js`. The footer asset is still fetched, because
  the social links come from it.
- Use raw px values (except `0`, `1px` borders and `44px` tap targets), hex colors or `--fontWeight*`
  tokens.
- Add dependencies, refactor unrelated code, or run tests, builds or linting (working-rules.md).

## When done

Briefly list the files changed. Then remind Zoha to:

1. publish the social links in Console (Content → Footer → Social media links → **Publish**). The
   published footer asset currently has `socialMediaLinks: []`, so no icons will show until then.
2. optionally clear the Console footer's slogan, copyright and legal-links block, which the app no
   longer reads.
