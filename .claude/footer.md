# Footer: spec

Oct 13, 2026 · Zoha Fard

Design: [design/footer.html](design/footer.html). Rules: [design-system-rules.md](design-system-rules.md),
tokens: [tokens.md](tokens.md).

## Today

The footer has two sources of content:

- **Console** (`content/footer.json` hosted asset, rendered by `FooterContainer` →
  `PageBuilder/SectionBuilder/SectionFooter`): slogan, copyright, the legal links line (written as
  markdown with `|` typed between the links), and social links. The social list is **empty** in
  Console, and `SectionFooter.js` does not render `socialMediaLinks` either. That's why there are no
  icons.
- **Code** (`SectionFooter.js`): the logo, and "Contact us" and "FAQ" hardcoded in English. FAQ points
  at an absolute `https://www.lineupbridge.com/p/faq` URL.

## Goal

The footer is built entirely in code, so it no longer depends on Console. Every text goes through
translations. Same words as today.

## Content (existing words only)

| Item | Text | Link |
| --- | --- | --- |
| Logo | image (`LinkedLogo`) | home |
| Slogan | Built for the electronic music industry | — |
| Help links | FAQ · Contact us | `/p/faq` · `/p/contact-us` |
| Legal links | Privacy policy · Terms of use · Payment terms | `/privacy-policy` · `/p/terms-of-use` · `/p/payment-terms` |
| Copyright | © 2026 LineupBridge. All rights reserved | — |
| Social | icons only, with an `aria-label` per platform | **to be decided** |

## Layout

Beige page background, 1px `--colorGrey100` rule above, full width with `--lb-gutter` side padding
(same inset as the topbar).

- **Desktop (from 1024px):** row 1 has logo + slogan on the left, FAQ and Contact us on the right. A 1px rule, then
  row 2: copyright, Privacy policy, Terms of use, Payment terms on the left, social icons on the right.
- **iPad 768:** same, but the copyright drops to its own line under the legal links.
- **Mobile:** everything stacked and left-aligned: logo, slogan, help links, rule, legal links,
  copyright, social icons.

Type and color:

- Slogan: `.small` in `--lb-text-secondary`.
- Help links: `.small`, 600, black.
- Legal links and copyright: `.small` in `--lb-text-muted`. Links turn black and underlined on hover.
- Social icons: 20px, muted, black on hover.
- No `|` separators: the gaps do the work. Every link and icon is at least 44px tall.

Spacing:

- Padding: 32/24px on phones, 48/32px from 768px (top/bottom).
- 32px between the rows. Logo → slogan 8px. Links 24px apart.

## Open decisions

1. **Social links:** which platforms, and their URLs. Until then, the row is hidden.
2. **Social icons:** `lucide-react` 1.x has no brand icons. The options are the template's existing
   SVG icons in PageBuilder, or an exception to rule 5.
3. **Copyright year:** a fixed "2026" (as today), or the current year from code.
4. The search page has no footer (template default). That stays as it is.
