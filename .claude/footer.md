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

The code controls the footer UI. All text is in code and goes through translations, with the same
words as today. Only the social links come from Console.

## Content (existing words only)

| Item | Text | Link |
| --- | --- | --- |
| Logo | image (`LinkedLogo`) | home |
| Slogan | Built for the electronic music industry | — |
| Help links | FAQ · Contact us | `/p/faq` · `/p/contact-us` |
| Legal links | Privacy policy · Terms of use · Payment terms | `/privacy-policy` · `/p/terms-of-use` · `/p/payment-terms` |
| Copyright | © 2026 LineupBridge. All rights reserved | — |
| Social | icons only, with an `aria-label` per platform | from Console (`footer.socialMediaLinks`) |

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

## Decisions (Oct 13, 2026)

1. **Social links stay in Console** (Content → Footer → Social media links). The code reads them and
   controls how they look. Everything else in the footer is in code and translations. If Console has
   no social links, the icon row is not rendered.
2. **Social icons:** a new shared `SocialIcon` component (`src/components/SocialIcon/`). It uses the
   same paths as the template's SVGs (`PageBuilder/Primitives/Link/Icons`) with a `viewBox` added,
   because the template icons have fixed sizes (13–18px) and no `viewBox`, so CSS can't scale them.
   The template files stay untouched. This is an approved exception to rule 5. Supported platforms
   (the same keys as the template): facebook, instagram, linkedin, pinterest, tiktok, twitter (X),
   youtube.
3. **Copyright year:** the current year, from code. The wording stays as it is today.
4. **Sizes:** the logo is 24px high (`--lb-logo-footer`), social icons are 20px (`--lb-icon-social`).
5. **Link styles:** Footer link (FAQ, Contact us) and Muted link (legal links), added to the UI
   library.
6. The search page has no footer (template default). That stays as it is.
