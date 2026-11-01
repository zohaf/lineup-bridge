# LineupBridge docs

How LineupBridge went from product rules to shipped pages. Six stages; each one uses only what the
stages above it define.

```
1 PRODUCT        what LineupBridge allows                  1-product/
2 WIREFRAMES     one screen at a time, low fidelity        2-wireframes/  (Figma)
3 JOURNEYS       screens in order, per user and goal        3-journeys/
4 DESIGN SYSTEM  rules → tokens → layouts → components      4-design-system/  → src/styles/lineup*, src/components/
5 PAGES          one spec per page, built from the system   5-pages/  → src/containers/
6 CLAUDE         how Claude Code works inside these rules   6-working-with-claude/  → CLAUDE.md, .claude/
```

## Order of change

Doc first, then tokens and shared styles, then components, then pages. A page uses only components,
layouts and tokens that already exist; anything new goes into the design system first.

## Control rules

- A doc exists only in `docs/<stage>/` and is listed below. Anything else is a working file and lives
  in `.claude/work/` (gitignored): prompts, plans, explorations.
- Every spec starts with one line: date · status (draft / approved / built) · design · code.
- No new words: UI text comes from the app (live Console translations override `en.json`); a new word
  needs Zoha's approval.
- Business rules and Sharetribe's process are separate sources of truth; neither changes to fit the
  other without approval ([business rules](1-product/business-rules.md)).

## Index

| Stage | Doc | What it holds |
| --- | --- | --- |
| 1 | [business-rules.md](1-product/business-rules.md) | Users, account, payout, public profile; business vs Sharetribe |
| 1 | [negotiation-flow.md](1-product/negotiation-flow.md) | Offer → counteroffer → final offer → payment → performance; titles; Sharetribe mapping |
| 2 | [2-wireframes/README.md](2-wireframes/README.md) | Link to the Figma wireframes |
| 3 | [booking.md](3-journeys/booking.md) · [.html](3-journeys/booking.html) | Send offer to payment, both roles |
| 3 | [account-and-profile-setup.md](3-journeys/account-and-profile-setup.md) · [.html](3-journeys/account-and-profile-setup.html) | Public profile builder, account settings, payouts |
| 3 | [auth.md](3-journeys/auth.md) | Log in, sign up, verify email |
| 4 | [rules.md](4-design-system/rules.md) | Design rules, component library, front-end architecture, review checklist |
| 4 | [tokens.md](4-design-system/tokens.md) | Font, type scale, spacing |
| 4 | [layouts.md](4-design-system/layouts.md) · [.html](4-design-system/layouts.html) | Centered and Split layouts |
| 4 | [components.html](4-design-system/components.html) | Every component in every state |
| 4 | [brand.html](4-design-system/brand.html) | Logo, colours, type |
| 5 | [home.md](5-pages/home.md) · [.html](5-pages/home.html) | Logged-in home |
| 5 | [public-profile.md](5-pages/public-profile.md) · [.html](5-pages/public-profile.html) | DJ public profile |
| 5 | [offer-builder.md](5-pages/offer-builder.md) · [.html](5-pages/offer-builder.html) | Complete your offer |
| 5 | [header.md](5-pages/header.md) · [.html](5-pages/header.html) · [plan](5-pages/header-plan.html) | Header and menu |
| 5 | [footer.md](5-pages/footer.md) · [.html](5-pages/footer.html) | Footer |
| 5 | [landing.html](5-pages/landing.html) | Landing page design |
| 5 | [content-pages.html](5-pages/content-pages.html) | Console content pages |
| 6 | [6-working-with-claude/README.md](6-working-with-claude/README.md) | CLAUDE.md, rules, skills, reviewer agents, hooks |
| 6 | [example-prompt.md](6-working-with-claude/example-prompt.md) | A two-part build prompt |
