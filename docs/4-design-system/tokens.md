# Tokens: typography and spacing

2026-10-12 · built · code: `src/styles/lineupTokens.css`, `src/styles/lineupType.module.css`

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
- The logo is the wordmark LineupBridge in SF Pro Semibold (600), letter spacing −0.01em, cap height 16px (the height of the L). It is used as an outlined SVG (`src/assets/lineupbridge-logo.svg`), not as live text, so it looks the same on every device. Full spec and colours: [brand.html](brand.html) (decided 2026-10-17).

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
| Header side padding (logo and links) | 16px | 32px | `--lb-header-side` (new; 16px is `--lb-space-4`, 32px is `--lb-space-6`) |
| Header logo height (SVG, top of the d to the bottom of the g; cap height 16px) | 21px | 21px | `--lb-logo-header` |
| Logo letter spacing (built into the SVG) | -0.01em | -0.01em | none |
| Header link letter spacing | -0.01em | -0.01em | `--lb-tracking-nav` |
| Header avatar | 32px | 32px | `--lb-avatar-header` |
| Header menu width (dropdown) | full width | 240px | `--lb-menu-width` |
| Header menu scrim (phone) | `rgba(0, 0, 0, 0.4)` | none | `--lb-scrim` (the value the template's modals already use) |
| Footer logo height (same logo as the header) | 21px | 21px | `--lb-logo-footer` |
| Social icon size | 20px | 20px | `--lb-icon-social` |
| Hero search bar: max width | 520px | 520px | `--lb-width-search` |
| Hero search bar: shadow | `0 6px 24px rgba(0,0,0,.06)` | same | `--lb-shadow-search` |

**Rule:** spacing between siblings is set with `gap` on the parent (flex or grid). Children have `margin: 0`. This prevents the global margins described below from leaking in.

Template limitations that explain these rules (broken `--fontWeight*` tokens, global element margins,
PageBuilder primitives): [rules.md](rules.md) section 6.
