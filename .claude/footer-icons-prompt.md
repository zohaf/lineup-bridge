# Prompt: footer icons level with the logo

Copy everything below the line into a new Claude Code session in `web-template/`.

---

Fix the footer so it matches decision "option 1" in `.claude/footer.md`: from 768px up, the social
icons are centred on the logo letters. Change only CSS and one class. No new words. No tests, builds
or linting (`.claude/working-rules.md`).

## Why it's off today

1. The template's global CSS gives every `<li>` `padding: 5px 0 3px`. That pushes the social icons,
   and FAQ / Contact us, 5px down.
2. The logo PNG (`brand-logo.png`, 1024×214) has empty space under the letters for the tail of the
   "p". So the centre of the 38px image box is lower than the centre of the letters. The letters run
   from the top of the capitals to the baseline, and their centre is at 40% of the image height.
   This was measured from the image.

## Changes

**`src/containers/FooterContainer/Footer.module.css`**

- `.navItem`: add `padding: 0;`.
- Add `.socialItem { display: flex; padding: 0; }`.
- `.social`, inside `@media (--viewportMedium)`: replace the `margin-top` with:

  ```css
  /* Visible icon centred on the logo letters: their centre is at 40% of the logo image height
     (brand-logo.png). 22px = half the 44px tap box. Re-measure if the logo image changes. */
  margin-top: calc(var(--lb-logo-footer) * 0.4 - 22px);
  ```

**`src/containers/FooterContainer/Footer.js`**

- Add `className={css.socialItem}` to the `<li>` in the social list.

## Check (desktop, 1280px wide)

- The centre of the icons is level with the centre of the logo letters. It should be 0px apart,
  measured with `getBoundingClientRect`: icon top + 10px = logo image top + 38px × 0.4.
- FAQ and Contact us have the same `top` as Privacy policy.
- Mobile is unchanged, apart from losing the 5px of `li` padding.

When done, list the files you changed in one line.
