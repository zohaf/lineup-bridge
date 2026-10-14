# LineupBridge tokens: typography and spacing

Oct 12, 2026 · Zoha Fard

This file is the single source of truth for type and spacing in the whole app (it started as the landing page spec, `/`). Every value here exists once in code as a CSS custom property with the **same name**. Components use only those tokens, so code and this document stay 100% in sync.

## How this document and the code stay in sync

1. **Tokens live in one file:** `src/styles/lineupTokens.css`, on `:root`, imported once in `src/styles/marketplaceDefaults.css`. The token names and values below are copied there exactly. (The landing page started with its own copy in `LandingPage/landingTokens.module.css`; only `.landingDark` is still needed from there.)
2. **Type styles live in one file:** `src/styles/lineupType.module.css` holds one class per text role (`.display`, `.h2`, `.h3`, `.lead`, `.leadLarge`, `.body`, `.small`, `.eyebrow`, `.label`, `.button`). Components never set font properties themselves; they use `composes: h2 from '../../styles/lineupType.module.css';` (path relative to the component).
3. **No raw values in components.** In every redesigned page and shared component, every `font-size`, `font-weight`, `line-height`, `letter-spacing`, `margin`, `padding` and `gap` uses a `--lb-*` token. Allowed exceptions: `0`, `1px` borders, `%`, and the existing `--borderRadius*` tokens.
4. **To change a value:** update this document first, then the token file. Never change a value in a component.
5. **Review check:** searching a redesigned page's CSS for `px` in font or spacing properties must return nothing (`lineupTokens.css` is the only place for values).
6. **Design files:** every `design/*.html` copies the token values it uses into its `.page` block. When a value changes here, update `lineupTokens.css` and then the design files that use it.

## Font

| Token | Value |
| --- | --- |
| `--lb-font` | `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'` |
| `--lb-weight-regular` | `400` |
| `--lb-weight-semibold` | `600` |

- One family, two weights. Headings, labels and buttons use 600; everything else uses 400.
- Visitors see San Francisco (Apple), Segoe UI (Windows) or Roboto (Android). Nothing is downloaded.
- The logo stays an image (Times New Roman MT bold italic) and is not part of this system.

## Type scale

Phone values are the base. Larger values apply from `--viewportMedium` (768px) and `--viewportLarge` (1024px).

| Role (class) | Used for | Size phone / 768 / 1024 | Line height | Letter spacing | Weight |
| --- | --- | --- | --- | --- | --- |
| `.display` | Hero heading (h1) | 36 / 44 / 52px | 1.1 | -0.02em | 600 |
| `.h2` | Section headings | 28 / 34 / 40px | 1.15 | -0.015em | 600 |
| `.h3` | Card, step and FAQ question titles | 18 / 20 / 20px | 1.3 | -0.01em | 600 |
| `.leadLarge` | Hero subheading | 17 / 18 / 19px | 1.5 | 0 | 400 |
| `.lead` | Section lede under h2 | 16 / 17 / 18px | 1.55 | 0 | 400 |
| `.body` | Card text, list items, FAQ answers | 15 / 16 / 16px | 1.55 | 0 | 400 |
| `.small` | Hero sign-up line, secondary links, meta | 14 / 14 / 14px | 1.45 | 0 | 400 (links 600) |
| `.eyebrow` | Section label above h2, uppercase | 12 / 12 / 12px | 1.3 | 0.08em | 600 |
| `.label` | Status and role chips, step numbers | 12 / 12 / 12px | 1.3 | 0.02em | 600 |
| `.button` | All landing buttons | 15 / 15 / 15px | 1 | 0 | 600 |

Token names follow the pattern `--lb-size-<role>` and `--lb-leading-<role>`, for example `--lb-size-h2: 28px` and `--lb-leading-h2: 1.15`.

**Text colors**

| Token | On beige or white | On black (section 2) |
| --- | --- | --- |
| `--lb-text-primary` | `var(--colorBlack)` | `var(--colorWhite)` |
| `--lb-text-secondary` (lede, body) | `var(--colorGrey700)` | `var(--colorGrey200)` |
| `--lb-text-muted` (eyebrow, numbers) | `var(--colorGrey600)` | `var(--colorGrey300)` |

The black section header applies `.landingDark` (`composes: landingDark from '../landingTokens.module.css'`), which swaps these three tokens. It is not set on the section root, because the cards inside the black section are white and keep the light colors.

**Line length:** `.lead`, `.leadLarge` and `.body` paragraphs have `max-width: var(--lb-measure)` = `60ch`. Headings have no max width except the hero, which uses a manual line break on desktop to stay on two lines.

## Spacing scale

All spacing is a multiple of 4px.

| Token | Value |
| --- | --- |
| `--lb-space-1` | 4px |
| `--lb-space-2` | 8px |
| `--lb-space-3` | 12px |
| `--lb-space-4` | 16px |
| `--lb-space-5` | 24px |
| `--lb-space-6` | 32px |
| `--lb-space-7` | 48px |
| `--lb-space-8` | 56px |
| `--lb-space-9` | 64px |
| `--lb-space-10` | 96px |

## Spacing rules (what uses which step)

| Gap | Phone | From 768px | Token |
| --- | --- | --- | --- |
| Section top and bottom padding | 56px | 96px | `--lb-section-pad` |
| Page side padding | 24px | 32px | `--lb-gutter` |
| App pages: topbar → content | 24px | 32px | `--lb-page-top` (= `--lb-gutter`) |
| App pages: content → footer / page end | 64px | 64px | `--lb-page-bottom` |
| Eyebrow → heading | 12px | 12px | `--lb-space-3` |
| Heading → lede | 16px | 16px | `--lb-space-4` |
| Section header → content | 32px | 48px | `--lb-header-gap` |
| Hero: heading → subheading → search → sign-up line | 16 / 24 / 16px | 16 / 32 / 16px | `--lb-space-4`, `--lb-space-5`/`6` |
| Card inner padding | 24px | 32px | `--lb-card-pad` |
| Gap between cards | 16px | 24px | `--lb-card-gap` |
| Card: title → text | 8px | 8px | `--lb-space-2` |
| List row (steps, FAQ) top and bottom padding | 16px | 24px | `--lb-row-pad` |
| Header column ↔ list column (sections 3 and 5) | stacked | 64px | `--lb-space-9` |
| Button height | 48px | 48px | `--lb-button-height` |
| Button side padding | 24px | 24px | `--lb-space-5` |
| Footer padding (top / bottom) | 32 / 24px | 48 / 32px | `--lb-space-6` / `--lb-space-5`, `--lb-space-7` / `--lb-space-6` |
| Header (topbar) height | 60px | 60px | `--lb-topbar-height` |
| Header logo height | 28px | 28px | `--lb-logo-header` |
| Header link letter spacing | -0.01em | -0.01em | `--lb-tracking-nav` |
| Footer logo height | 24px | 24px | `--lb-logo-footer` |
| Social icon size | 20px | 20px | `--lb-icon-social` |
| Hero search bar: max width | 520px | 520px | `--lb-width-search` |
| Hero search bar: shadow | `0 6px 24px rgba(0,0,0,.06)` | same | `--lb-shadow-search` |

**Rule:** spacing between siblings is set with `gap` on the parent (flex or grid). Children have `margin: 0`. This prevents the global margins described below from leaking in.

## Limitations from the shared template styles

These come from the Sharetribe template and PageBuilder, and they are why the rules above exist.

1. **All `--fontWeight*` tokens are broken app-wide.** `src/styles/marketplaceDefaults.css` (lines 91–101) redefines each weight and font token as itself, for example `--fontWeightSemiBold: var(--fontWeightSemiBold)`. That overrides the real values from `typography.css` and makes them invalid, so any `font-weight: var(--fontWeight…)` falls back to the inherited weight. On the live site, buttons render at 400 instead of 600. **Landing code must use `--lb-weight-*` only.** Fixing the global lines is a separate, app-wide change: it would suddenly make every heading in the app use weight 300 (`--fontWeightHeading`), so it needs its own review.
2. **`--fontFamilyHeading` is broken the same way**, so headings already render in the body font. Landing code sets `font-family: var(--lb-font)` explicitly on its root and never uses `--fontFamilyHeading`.
3. **Global element styles add margins and padding.** `marketplaceDefaults.css` gives every `h1`–`h6` and `p` its own size, padding and margins (for example `p` gets 16px margins on desktop, `h2` gets 24px top margin). The `landingType` classes reset `margin: 0; padding: 0;` so only the spacing tokens apply.
4. **PageBuilder primitives carry their own type.** The `Heading` primitive sets weight 800 or bold, sizes 40–48px, `hyphens: auto` (words can split with hyphens) and margins on whatever follows it. Code-built landing sections must not use PageBuilder's `Heading`, `P` or `Text` primitives.
5. **The hosted hero is styled by four layers:** Console content, `SectionHero.module.css`, `SectionBuilder.module.css` and the `section:first-child` overrides in `LandingPage.module.css`. It cannot follow this spec exactly while it stays hosted.

## Recommendation: build the hero in code too

Moving the hero into code removes limitation 5 and gives the whole page one source of type.

- Add a `landingHero` section type in `landingSections.js`, rendered by a `LandingHero` component that uses `.display`, `.leadLarge` and `.small`.
- Reuse the existing search box: `SearchCTA` from `src/containers/PageBuilder/Primitives/SearchCTA` with `searchFields={{ keywordSearch: true }}` (date range off, as today). Search still goes to the Search page.
- Hero copy moves into translations (`LandingPage.hero.title`, `LandingPage.hero.subtitle`).
- Then delete the `section:first-child` overrides from `LandingPage.module.css`, and `LandingPage.js` drops the hosted sections entirely.
- **Trade-off:** hero text can no longer be edited in Sharetribe Console; changes go through code and translations. The search box keeps its own styles from `SearchCTA`, which only need checking against the button and size tokens.

## Token block for `landingTokens.module.css`

Copy exactly. The values match the tables above.

```css
@import '../../styles/customMediaQueries.css';

.landingTokens {
  /* Font */
  --lb-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
  --lb-weight-regular: 400;
  --lb-weight-semibold: 600;

  /* Type sizes (phone) */
  --lb-size-display: 36px;
  --lb-size-h2: 28px;
  --lb-size-h3: 18px;
  --lb-size-lead-large: 17px;
  --lb-size-lead: 16px;
  --lb-size-body: 15px;
  --lb-size-small: 14px;
  --lb-size-eyebrow: 12px;
  --lb-size-label: 12px;
  --lb-size-button: 15px;

  /* Line heights */
  --lb-leading-display: 1.1;
  --lb-leading-h2: 1.15;
  --lb-leading-h3: 1.3;
  --lb-leading-lead: 1.55;
  --lb-leading-lead-large: 1.5;
  --lb-leading-body: 1.55;
  --lb-leading-small: 1.45;
  --lb-leading-label: 1.3;
  --lb-leading-button: 1;

  /* Letter spacing */
  --lb-tracking-display: -0.02em;
  --lb-tracking-h2: -0.015em;
  --lb-tracking-h3: -0.01em;
  --lb-tracking-eyebrow: 0.08em;
  --lb-tracking-label: 0.02em;

  /* Text colors (light surfaces) */
  --lb-text-primary: var(--colorBlack);
  --lb-text-secondary: var(--colorGrey700);
  --lb-text-muted: var(--colorGrey600);
  --lb-measure: 60ch;

  /* Hero */
  --lb-width-search: 520px;
  --lb-shadow-search: 0 6px 24px rgba(0, 0, 0, 0.06);

  /* Spacing scale */
  --lb-space-1: 4px;
  --lb-space-2: 8px;
  --lb-space-3: 12px;
  --lb-space-4: 16px;
  --lb-space-5: 24px;
  --lb-space-6: 32px;
  --lb-space-7: 48px;
  --lb-space-8: 56px;
  --lb-space-9: 64px;
  --lb-space-10: 96px;

  /* Spacing roles (phone) */
  --lb-section-pad: var(--lb-space-8);
  --lb-gutter: var(--lb-space-5);
  --lb-header-gap: var(--lb-space-6);
  --lb-card-pad: var(--lb-space-5);
  --lb-card-gap: var(--lb-space-4);
  --lb-row-pad: var(--lb-space-4);
  --lb-button-height: 48px;

  font-family: var(--lb-font);

  @media (--viewportMedium) {
    --lb-size-display: 44px;
    --lb-size-h2: 34px;
    --lb-size-h3: 20px;
    --lb-size-lead-large: 18px;
    --lb-size-lead: 17px;
    --lb-size-body: 16px;

    --lb-section-pad: var(--lb-space-10);
    --lb-gutter: var(--lb-space-6);
    --lb-header-gap: var(--lb-space-7);
    --lb-card-pad: var(--lb-space-6);
    --lb-card-gap: var(--lb-space-5);
    --lb-row-pad: var(--lb-space-5);
  }

  @media (--viewportLarge) {
    --lb-size-display: 52px;
    --lb-size-h2: 40px;
    --lb-size-lead-large: 19px;
    --lb-size-lead: 18px;
  }
}

/* Dark surface (section 2): swap the text colors only */
.landingDark {
  --lb-text-primary: var(--colorWhite);
  --lb-text-secondary: var(--colorGrey200);
  --lb-text-muted: var(--colorGrey300);
}
```

## Example: a type class in `landingType.module.css`

```css
.reset {
  margin: 0;
  padding: 0;
  font-family: var(--lb-font);
}

.h2 {
  composes: reset;
  font-size: var(--lb-size-h2);
  line-height: var(--lb-leading-h2);
  letter-spacing: var(--lb-tracking-h2);
  font-weight: var(--lb-weight-semibold);
  color: var(--lb-text-primary);
  text-wrap: balance;
}
```

The other classes follow the same pattern with their own tokens.

## Migration of the current landing code

The `--landing*` tokens already in `LandingPage.module.css` (`--landingSectionPaddingY`, `--landingHeaderGap`, `--landingHeadingSize`, `--landingLedeSize`, `--landingEyebrowSize`) are replaced by the `--lb-*` tokens. Then every component in `sections/` swaps its own font and spacing values for `composes:` and tokens. Every `var(--fontWeight…)` in `sections/` (currently in `SectionHeader`, `StageCard`, `StepList`, `FaqList`, `AudienceCard`, `StatusChip`) becomes `var(--lb-weight-…)`.

Known inconsistencies this fixes: card titles at 18, 20 and 22px become one `.h3`; the FAQ question no longer switches from 600 to 400 on desktop; hero 800, section headings 700 and new headings 600 become one 600.
