# Landing page (`/`)

2026-11-05 · built · Figma: [Foundations](https://www.figma.com/design/uUt1bfNw7imHngWi1QFXGJ?node-id=0-1) (grille variables) · code: `src/containers/LandingPage/` (`landingSections.js`,
`sections/`), `TopbarContainer/Topbar/Topbar.js`

The landing page is the marketing surface ([rules.md §2](../4-design-system/rules.md#2-sources-and-sync)).
It uses the app's tokens, header and footer, and may add expressive elements in its own sections. The
sections are defined in code (`landingSections.js`); the hosted Console sections are ignored. Text
comes from the `LandingPage.*` translation keys.

## Sections, top to bottom

| # | Section | Id | Surface |
| --- | --- | --- | --- |
| 1 | Hero: title, subtitle, hero search (`HeroSearch`); fills the window (`100svh`), so section 2 starts below the fold | `landing-hero` | black area |
| 2 | Why LineupBridge: four stage cards | `landing-value` | black area |
| 3 | How it works: five steps with roles | `landing-steps` | beige |
| 4 | Get started: one card per audience (DJ, event organizer) | `landing-audiences` | beige |
| 5 | FAQ | `landing-faq` | beige |

## Black area and speaker-grille dots

- Hero and Why LineupBridge share one black area (`LandingHero` `.darkArea`). It starts at the top of
  the window, under the header, and ends where Why LineupBridge ends.
- Grey dots in a grid (`--lb-grille-dot`, every `--lb-grille-pitch`) appear in a soft circle
  (`--lb-grille-reveal`) around the pointer anywhere over the black area, including behind the
  transparent header. They fade in and out (`--lb-motion-fade`) when the pointer enters or leaves.
- The effect is made for a mouse or trackpad. On touch screens dots show where a finger touches and
  go when it lifts or the page starts to scroll.
- Reduced motion (`prefers-reduced-motion`): no dots at all ([rules.md §2](../4-design-system/rules.md#2-sources-and-sync)).
- The dots sit behind all text, cards and controls and are hidden from assistive technology.

## Header on the landing page

| Scroll position | Header |
| --- | --- |
| Top (scrolled 24px or less) | Transparent, white logo and links; the dots run behind it |
| Over the black area | Black, white logo and links |
| Below the black area | Beige, black logo and links (as on app pages) |

## Continuity conditions

The effect holds only while these stay true. A change to any of them updates the others.

1. The black area spans **grid rows 1–2 of `main`**: the hero is the first section and Why
   LineupBridge the second (`grid-row` in `LandingHero.module.css` and `LandingValue.module.css`).
   Both use `LandingSection` variant `clear`. Adding or moving a black section changes these rows.
2. The header finds the end of the black area by the id **`landing-value`**
   (`LANDING_DARK_END_ID` in `Topbar.js`). If the last black section changes, this id changes.
3. `main` starts under the header (`margin-top: calc(-1 * var(--lb-topbar-height))`,
   `LandingPage.module.css`) and the hero's top padding is **`--lb-topbar-height`**, so the hero
   content stays clear of the header.
