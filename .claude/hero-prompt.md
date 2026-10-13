# Prompt: implement the landing page hero

Copy everything below the line into a new Claude Code session in `web-template/`.

---

Build the landing page hero in code, in one pass, so the Console hero section can be deleted.
Everything is decided; there are no open questions. Work **mobile first**: write the phone styles as
the base, then add `--viewportMedium` (768px) and `--viewportLarge` (1024px) overrides.

## Read first (sources of truth, in this order)

1. `.claude/design-system-rules.md`, especially **rule 1 (no new words)** and **rule 10 (nothing
   outside the design system, no guessing, no assuming)**.
2. `.claude/working-rules.md`
3. `.claude/design/landing-page.html` (the master design; the hero is section **1 · Hero, from B**:
   one centered column, no visual on the side). Online copy:
   https://claude.ai/artifact/8YF3uoR4bNHeov7YaRhQGb
4. `.claude/tokens.md` (type roles and the hero gaps: "Hero: heading → subheading → search →
   sign-up line"), and its section "Recommendation: build the hero in code too".
5. `.claude/implementation-plan.md`, Stage 1 step 6 and the Stage 2 hero task.

If anything you need is not in these files, or a file contradicts this prompt, **stop and ask
Zoha**. Do not pick a close value, invent a class or carry on with an assumption. Do not add any word
that isn't listed below.

## What to build

Today the hero is the Console Page Builder hero (`sectionType: 'hero'` in the hosted `landingPage`
asset), rendered by `SectionHero` and bent into shape by the `section:first-child` overrides in
`LandingPage.module.css`. Replace it with a `landingHero` section built in code, rendered by a new
`LandingHero` component, placed before the four existing code sections. **The page must not read
any section from the hosted asset any more**, so it keeps working after the Console hero is deleted.

The hero, top to bottom, centered:

1. **h1:** Professional DJ booking platform, from offer to payment. On desktop it breaks after the
   comma, so it sits on two lines.
2. **Subheading:** Structured offers, organized negotiations, confirmed bookings, and secured
   payments.
3. **Search box:** one white bar with the keyword input ("Type a DJ name") and the **Search** button
   on the same line, at every width.
4. **Sign-up line:** "New here?" followed by two links: **Sign up as a DJ** and **Sign up as an
   event organizer**.

### 0. Docs first (order of change)

- `.claude/tokens.md`: add a **Hero** group to the spacing rules table with the two new tokens
  below, and add them to the token block.
- `.claude/design-system-rules.md`, section 4 "Actions and status": add a row **Hero search**: "One
  white bar, max 520px (`--lb-width-search`), 1px `--colorGrey100` border, `--borderRadiusMedium`,
  4px inner padding and gap, shadow `--lb-shadow-search`. Keyword input without its own border, 16px
  text, existing placeholder. Primary button inline on the right at every width. Focus: the bar's
  border turns black. Landing hero only." Code: `HeroSearch` in `LandingPage/sections`.
- `.claude/design/components.html`: add the Hero search to the "Actions and status" part of the
  library, drawn exactly as in the master design, in default and focus states. Use only text that is
  already in this prompt.

### 1. Tokens: `src/styles/lineupTokens.css`

Add to `:root`, in a `/* Hero */` group (values from the master design):

```css
--lb-width-search: 520px;
--lb-shadow-search: 0 6px 24px rgba(0, 0, 0, 0.06);
```

### 2. Section config: `src/containers/LandingPage/landingSections.js`

Add this as the **first** item of `landingSections`, and update the file comment (the sections no
longer follow a hosted hero):

```js
{
  sectionType: 'landingHero',
  sectionId: 'landing-hero',
  sectionName: 'Hero',
  messageKeyPrefix: 'LandingPage.hero',
},
```

Register it in `src/containers/LandingPage/sections/index.js`:
`landingHero: { component: LandingHero }`.

### 3. `LandingPage.js`

- Pass `sections: landingSections` (code sections only) when `landingPageData` exists. Ignore every
  hosted section, including the hosted hero.
- Keep everything else: the hosted `landingPage` asset is still loaded (page meta, loading and error
  states, `FallbackPage`), `options.sectionComponents`, `className`, `title`, `featuredListings`.
- Delete `addLandingTitleBreak` and `removeLandingDatePicker`; nothing uses them after this.

### 4. `LandingPage.module.css`

Remove the rules that only exist for the hosted hero:

- `section:first-child .pbSectionDescription`
- `.pbSectionTitle { white-space: pre-line }`
- "The hosted hero fills the first screen": `section:first-child`, its `> div:last-child`, and the
  `--viewportMedium` block.

Keep `.landingPage` (composes `landingTokens`), the `main#main-content` margin/padding reset and the
`columns` rule.

### 5. `src/containers/LandingPage/sections/LandingHero.js` + `LandingHero.module.css`

Built on the existing `LandingSection` shell (`variant="page"`, not `wide`), so it gets the beige
background, `--lb-section-pad` top and bottom (56px phone, 96px from 768px; approved instead of the
design's fixed hero padding) and the `--lb-gutter` side padding.

Markup (semantic HTML, mirroring the design):

```
<LandingSection id={sectionId} variant="page">
  <div class="hero">
    <h1 class="title">     title with the desktop line break </h1>
    <p class="subtitle">   subtitle                          </p>
    <HeroSearch className="search" />
    <p class="signup">     <span>New here?</span> · link DJ · link organizer </p>
  </div>
</LandingSection>
```

(The `·` above only separates items in this sketch. **No dot is rendered**; the design has none.)

- **Title:** `<h1>`, `composes: display from '../../../styles/lineupType.module.css'`. Render with
  `FormattedMessage` and the value `lineBreak: <br className={css.titleBreak} />`. `.titleBreak` is
  `display: none` on the base and `display: inline` from `--viewportLarge`.
- **Subtitle:** `<p>`, `composes: leadLarge`. Center it with `margin-inline: auto` (`leadLarge`
  already sets `max-width: var(--lb-measure)`).
- **Sign-up line:** `<p>`, `composes: small` (14px, `--lb-text-secondary`). Flex, wrap,
  `justify-content: center`, `align-items: center`, `gap: 0 var(--lb-space-4)`. The links are
  `NamedLink name="SignupForUserTypePage" params={{ userType: 'dj' }}` and
  `params={{ userType: 'organizer' }}` (the same routes as the "Get started" buttons in
  `AudienceCard.js`, `/signup/dj` and `/signup/organizer`), with a class that
  `composes: link from '../../../styles/lineupButtons.module.css'` (14px, 600, black, underline
  offset 3px) and adds `display: inline-flex; align-items: center; min-height: 44px` (tap target).
- **`.hero`:** flex column, `align-items: center`, `text-align: center`, `width: 100%`.
- **Vertical gaps** (tokens.md, hero row), set with margins on the children because the steps
  differ. All children otherwise `margin: 0`:
  - title → subtitle: `--lb-space-4` (16px)
  - subtitle → search: `--lb-space-5` (24px), `--lb-space-6` (32px) from `--viewportMedium`
  - search → sign-up line: `--lb-space-4` (16px)
- Type comes only from `lineupType` classes. No `font-*`, `line-height` or `letter-spacing` in
  `LandingHero.module.css`.

### 6. The search box: `src/containers/LandingPage/sections/HeroSearch.js` + `.module.css`

`SearchCTA` (`PageBuilder/Primitives/SearchCTA`) only accepts `containerClassName`; its form grid,
field and button classes are internal, so it cannot be restyled to the design without editing it
(rule 9). Build a small `HeroSearch` instead that **links exactly like today's hero search**:

- React Final Form (`Form as FinalForm` from `react-final-form`) + `Form` from `../../../components`,
  `role="search"`.
- One `FieldTextInput` (from `../../../components`), `name="keywords"`, `type="text"`,
  `placeholder` and `aria-label` = `intl.formatMessage({ id: 'PageBuilder.SearchCTA.keywordFilterPlaceholderDJ' })`
  ("Type a DJ name"). The same field name and texts as `FilterKeyword.js`. No visible label.
- `PrimaryButton type="submit"` with `rootClassName={buttonCss.primary}`
  (`../../../styles/lineupButtons.module.css`, the pattern in `LoginForm.js`) and
  `<FormattedMessage id="PageBuilder.SearchCTA.buttonLabel" />` ("Search").
- `onSubmit`: copy the keyword part of `SearchCTA.js`'s `onSubmit`. Trim nothing and add nothing:
  `const queryParams = values.keywords ? { keywords: values.keywords } : {};` then
  `history.push(createResourceLocatorString('SearchPage', routeConfiguration, {}, queryParams))`,
  using `useHistory` (`react-router-dom`), `useRouteConfiguration`
  (`../../../context/routeConfigurationContext`) and `createResourceLocatorString`
  (`../../../util/routes`). Result: "deep house" goes to `/s?keywords=deep%20house`; an empty search
  goes to `/s`, as today. No date range, location or category fields.
- Follow the import order in `AGENTS.md` (external → context/util → `../../../components` → parent →
  same dir).

Styles (tokens only):

- `.root` (the form): `display: flex; align-items: center; gap: var(--lb-space-1);`
  `width: 100%; max-width: var(--lb-width-search); padding: var(--lb-space-1);`
  `background-color: var(--colorWhite); border: 1px solid var(--colorGrey100);`
  `border-radius: var(--borderRadiusMedium); box-shadow: var(--lb-shadow-search);`
  `&:focus-within { border-color: var(--colorBlack); }`. Bar height = 4 + 48 + 4 = 56px, as in the
  design.
- The `FieldTextInput` root: `flex: 1 1 0; min-width: 0`.
- The input (`inputRootClass`): `composes: input from '../../../styles/lineupForm.module.css'`, then
  `border: 0` and `box-shadow: none` in every state (default, hover, focus), so only the bar shows a
  border. Text stays 16px (`--lb-size-input`, no iOS zoom), left-aligned, placeholder as in
  `lineupForm`.
- The button: `flex: none`. Keep `.primary` as it is (48px, `.button` type, padding 0 24px).

### 7. Copy

Search copy reuses the existing keys above. Add these keys to `src/translations/en.json`,
`de.json`, `es.json` and `fr.json`, with the English text in all four files. The title and subtitle
are today's live Console hero text, word for word. "New here?" is approved by Zoha (master design and implementation plan, step 6).

| Key | Text |
| --- | --- |
| `LandingPage.hero.title` | Professional DJ booking platform,{lineBreak} from offer to payment |
| `LandingPage.hero.subtitle` | Structured offers, organized negotiations, confirmed bookings, and secured payments. |
| `LandingPage.hero.newHere` | New here? |

The two link texts reuse the existing keys of the "Get started" buttons, so they read exactly the
same: `LandingPage.audiences.cards.dj.cta` ("Sign up as a DJ") and
`LandingPage.audiences.cards.organizer.cta` ("Sign up as an event organizer"). Do not add new keys
for them, and never write "Sign up as an organizer".

Result per view (check against `design/landing-page.html`, Labels off):

- **Mobile:** centered column. Title on three to four balanced lines (no forced break), subtitle,
  then the full-width search bar with the input and the Search button side by side, then the
  sign-up line, wrapping under "New here?" if it doesn't fit.
- **iPad 768:** the same, larger type, the search bar 520px wide.
- **Desktop:** the title on two lines, breaking after "platform,". Everything centered.

## Do not

- Edit `SearchCTA`, `FilterKeyword`, `SectionHero`, `SectionBuilder`, `PageBuilder` or any other
  shared template component. Leave them in place; other Console pages may still use them.
- Change the topbar, the footer, sections 2 to 5, `hostedAssets.duck.js`, `LandingPage.duck.js` or
  `configHelpers.js`. The `landingPage` asset is still fetched.
- Use PageBuilder's `Heading`, `P` or `Text` primitives.
- Use raw px values (except `0`, `1px` borders and `44px` tap targets), hex colors or
  `--fontWeight*` tokens.
- Add dependencies, refactor unrelated code, or run tests, builds or linting (working-rules.md).

## When done

Briefly list the files changed. Then remind Zoha to:

1. check http://localhost:3000 at 375, 768, 1024 and 1280px, and try a search ("Type a DJ name" →
   Search page with the results) and both sign-up links.
2. in Console (Content → Pages → Landing page), delete **only the hero section**, then **Publish**.
   **Do not delete the landing page itself:** the app still loads that page asset, and without it
   the home page shows the fallback page.
3. `LandingPage.test.js` still describes the hosted hero and may need updating; tests were not run.
