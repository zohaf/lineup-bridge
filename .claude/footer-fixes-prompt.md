# Prompt: footer spacing and alignment fixes

Copy everything below the line into a new Claude Code session in `web-template/`.

---

Make these footer changes. Everything is decided. These are CSS-only changes, plus one class in
`Footer.js`. No new words, no new dependencies, and no tests, builds or linting
(`.claude/working-rules.md`).

Sources of truth: `.claude/footer.md` (see "Changes (Oct 14, 2026)") and `.claude/design/footer.html`
(Mobile, iPad 768 and Desktop views). If the code doesn't match what these files expect, stop and ask
Zoha. Don't guess.

## 1. `src/styles/lineupTokens.css`

- `--lb-logo-footer: 24px` → `38px`.

## 2. `src/containers/FooterContainer/Footer.module.css`

- `.root`: remove `gap` (keep `display: grid`).
- `.top`: `gap: var(--lb-space-2)` (was `--lb-space-6`). In `@media (--viewportMedium)`:
  `align-items: flex-start` (was `center`) and add `padding-bottom: var(--lb-space-4)`.
- `.social`, inside `@media (--viewportMedium)`: add
  `margin-top: calc((var(--lb-logo-footer) - 44px) / 2)`. This centres the 44px tap box, and so the
  20px icon, on the logo.
- `.meta`: `padding-top: var(--lb-space-2)` at all sizes (remove the 16px base value), base
  `align-items: flex-start`, row gap `var(--lb-space-2)` (so `gap: var(--lb-space-2) var(--lb-space-6)`).
- `.copyright`: `padding: 0` (remove the 8px `padding-top`). Keep the `order` and `flex-basis` rules.
- `.nav`, in `@media (--viewportMedium)`: `flex-wrap: nowrap; flex-shrink: 0;`. This keeps FAQ and
  Contact us on one line at the right edge on iPad.
- Add `.navItem { display: flex; }`. Without it, each `<li>` sits on a text baseline and pushes FAQ
  and Contact us a few px below the legal links.

## 3. `src/containers/FooterContainer/Footer.js`

- Add `className={css.navItem}` to both `<li>` elements in the FAQ / Contact us list.

## Expected result

- **Mobile:** logo (38px) → slogan 8px → social icons 8px → rule → legal links, copyright right
  under them → FAQ, Contact us.
- **iPad 768:** logo + slogan on the left, icons on the right, level with the logo. Rule. Legal links
  on the left, FAQ and Contact us on one line on the right, level with them. Copyright on the next
  line, tight under the legal links.
- **Desktop 1024+:** the same, but the copyright joins the legal links on one line.

## Check

In the browser, at desktop width, check that the icons look centred on the logo letters. The real
logo is an image, so any empty space inside the image file moves its letters. If the icons look
visibly higher or lower than the letters, don't adjust the value. Report the offset to Zoha.

When done, list the files you changed in one line.
