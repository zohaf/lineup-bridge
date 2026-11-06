# Tokens: typography and spacing

2026-10-12 · built · Figma: [Foundations](https://www.figma.com/design/uUt1bfNw7imHngWi1QFXGJ?node-id=0-1) · code: `src/styles/lineupTokens.css`, `src/styles/lineupType.module.css`

The single source of truth for type and spacing in the whole app. Every value here exists once in code as a CSS custom property with the **same name**. Components use only those tokens, so code and this document stay 100% in sync.

## How this document and the code stay in sync

1. **Tokens live in one file:** `src/styles/lineupTokens.css`, on `:root`, imported once in `src/styles/marketplaceDefaults.css`. The token names and values below are copied there exactly.
2. **Type styles live in one file:** `src/styles/lineupType.module.css` holds one class per text role (`.display`, `.h2`, `.h3`, `.lead`, `.leadLarge`, `.body`, `.small`, `.eyebrow`, `.label`, `.button`). Components never set font properties themselves; they use `composes: h2 from '../../styles/lineupType.module.css';` (path relative to the component).
3. **No raw values in components.** In every redesigned page and shared component, every `font-size`, `font-weight`, `line-height`, `letter-spacing`, `margin`, `padding` and `gap` uses a `--lb-*` token. Allowed exceptions: `0`, `1px` borders, `%`, and the existing `--borderRadius*` tokens.
4. **To change a value:** update this document first, then the token file. Never change a value in a component.
5. **Review check:** searching a redesigned page's CSS for `px` in font or spacing properties must return nothing (`lineupTokens.css` is the only place for values).
6. **Design files:** when a value changes here, update `lineupTokens.css`, then the Figma variables and any design file that uses it.

## Font

| Token | Value |
| --- | --- |
| `--lb-font` | `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'` |
| `--lb-weight-regular` | `400` |
| `--lb-weight-semibold` | `600` |

- One family, two weights. Headings, labels and buttons use 600; everything else uses 400.
- Visitors see San Francisco (Apple), Segoe UI (Windows) or Roboto (Android). Nothing is downloaded.
- The logo spec is under [Logo](#logo) below.

## Logo

Decided 2026-10-17. The logo is a wordmark: LineupBridge, one word, capital L and capital B. No icon and
no colour version. It is an outlined SVG (`src/assets/lineupbridge-logo.svg`), never live text, so it
looks the same on every device.

| | |
| --- | --- |
| Font | SF Pro (Display optical size), Semibold 600, letter spacing −0.01em (Figma −1%) |
| Case | LineupBridge: never all caps, never two words |
| Colours | Black `#000000` on beige or white; white `#FFFFFF` on black (the SVG inverted, `SiteHeader` `.inverse`) |
| Header size | Cap height 16px (the height of the L), 132.6 × 21px (`--lb-logo-header`) |
| Proportions | Width = 6.32 × height (top of the d to the bottom of the g) |
| Clear space | One L height on every side (16px at header size) |
| Minimum size | 80px wide on screen, 20mm in print |
| In the header | 60px bar, logo centred vertically; 16px from the edge on phones, 32px from 768px |

## Type scale

Phone values are the base; sizes grow from `--viewportMedium` (768px) and `--viewportLarge` (1024px). Values are in `src/styles/lineupTokens.css` and shown in Storybook (Foundations/Tokens).

| Role (class) | Used for |
| --- | --- |
| `.display` | Hero heading (h1) |
| `.h2` | Section headings |
| `.h3` | Card, step and FAQ question titles |
| `.leadLarge` | Hero subheading |
| `.lead` | Section lede under h2 |
| `.body` | Card text, list items, FAQ answers |
| `.small` | Hero sign-up line, secondary links, meta |
| `.eyebrow` | Section label above h2, uppercase |
| `.label` | Status and role chips, step numbers |
| `.button` | All landing buttons |

Token names follow the pattern `--lb-size-<role>` and `--lb-leading-<role>`, for example `--lb-size-h2` and `--lb-leading-h2`.

**Text colors**

| Token | On beige or white | On black (section 2) |
| --- | --- | --- |
| `--lb-text-primary` | `var(--colorBlack)` | `var(--colorWhite)` |
| `--lb-text-secondary` (lede, body) | `var(--colorGrey700)` | `var(--colorGrey200)` |
| `--lb-text-muted` (eyebrow, numbers) | `var(--colorGrey600)` | `var(--colorGrey300)` |

The black section header applies `.landingDark` (`composes: landingDark from '../landingTokens.module.css'`), which swaps these three tokens. It is not set on the section root, because the cards inside the black section are white and keep the light colors.

**Line length:** `.lead`, `.leadLarge` and `.body` paragraphs have `max-width: var(--lb-measure)` = `60ch`. Headings have no max width except the hero, which uses a manual line break on desktop to stay on two lines.

## Spacing scale

All spacing is a multiple of 4px: `--lb-space-1` (4px) to `--lb-space-10` (96px). Values are shown in Storybook (Foundations/Tokens → Spacing).

## Spacing rules (what uses which step)

| What | Token |
| --- | --- |
| Section top and bottom padding | `--lb-section-pad` |
| Page side padding | `--lb-gutter` |
| App pages: topbar → content | `--lb-page-top` (= `--lb-gutter`) |
| App pages: content → footer / page end | `--lb-page-bottom` |
| Eyebrow → heading | `--lb-space-3` |
| Heading → lede | `--lb-space-4` |
| Section header → content | `--lb-header-gap` |
| Hero: heading → subheading → search → sign-up line | `--lb-space-4`, `--lb-space-5`/`6` |
| Card inner padding | `--lb-card-pad` |
| Gap between cards | `--lb-card-gap` |
| Card: title → text | `--lb-space-2` |
| List row (steps, FAQ) top and bottom padding | `--lb-row-pad` |
| Header column ↔ list column (sections 3 and 5) | `--lb-space-9` |
| Button height | `--lb-button-height` |
| Button side padding | `--lb-space-5` |
| Footer padding (top / bottom) | `--lb-space-6` / `--lb-space-5`, `--lb-space-7` / `--lb-space-6` |
| Header (topbar) height | `--lb-topbar-height` |
| Header side padding (logo and links) | `--lb-header-side` (new; 16px is `--lb-space-4`, 32px is `--lb-space-6`) |
| Header logo height (SVG, top of the d to the bottom of the g; cap height 16px) | `--lb-logo-header` |
| Logo letter spacing (built into the SVG) | none (built into the SVG) |
| Header link letter spacing | `--lb-tracking-nav` |
| Header avatar | `--lb-avatar-header` |
| Header menu width (dropdown) | `--lb-menu-width` |
| Header menu scrim (phone) | `--lb-scrim` (the value the template's modals already use) |
| Footer logo height (same logo as the header) | `--lb-logo-footer` |
| Social icon size | `--lb-icon-social` |
| Hero search bar: max width | `--lb-width-search` |
| Hero search bar: shadow | `--lb-shadow-search` |
| Landing: grille dots (landing page only, see [landing.md](../5-pages/landing.md)) | `--lb-grille-dot` `#6f6f6b` (warm grey, outside the template greys), `--lb-grille-pitch` 9px, `--lb-grille-dot-size` 1.6px with a soft edge to `--lb-grille-dot-edge` 2.2px, `--lb-grille-reveal` 460px, `--lb-motion-fade` 0.4s |

**Rule:** spacing between siblings is set with `gap` on the parent (flex or grid). Children have `margin: 0`. This prevents the global margins described below from leaking in.

Template limitations that explain these rules (broken `--fontWeight*` tokens, global element margins,
PageBuilder primitives): [rules.md](rules.md) section 6.
