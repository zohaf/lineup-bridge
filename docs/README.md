# LineupBridge docs

Product rules, design system rules and page behaviour for LineupBridge. Five stages; each one uses
only what the stages above it define.

```
1 PRODUCT        what LineupBridge allows                   1-product/
2 WIREFRAMES     user flows and wireframes                   2-wireframes/  (Figma)
3 JOURNEYS       screens in order, per user and goal         3-journeys/
4 DESIGN SYSTEM  rules → tokens → layouts → components       4-design-system/  → src/styles/lineup*, src/components/
5 PAGES          one spec per page, built from the system    5-pages/  → src/containers/
```

## Where design lives

| What                                | Source of truth                                | Shown in                                                       |
| ----------------------------------- | ---------------------------------------------- | -------------------------------------------------------------- |
| Tokens and components               | code (`src/styles/lineup*`, `src/components/`) | [Storybook](https://lineupbridge-storybook.vercel.app) · Figma |
| Pages                               | code (`src/containers/`)                       | the running app · Figma (Pages)                                |
| Journeys and wireframes             | Figma                                          | Figma (Journeys, Wireframes)                                   |
| Rules, behaviour, states, decisions | these docs                                     |                                                                |

Code leads: a design can be explored in Figma, but it ships only through code, and a change to a
token or component updates Storybook and Figma in the same change
([rules.md §2](4-design-system/rules.md#2-sources-and-sync)).

LineupBridge has two UI surfaces on one design system: the **app** and the **landing page** (`/`).
The header and footer belong to the app and are shared by both.

## Order of change

Doc first, then tokens and shared styles, then components (with their Storybook story), then pages.
A page uses only components, layouts and tokens that already exist; anything new goes into the
design system first.

## Control rules

- A doc exists only in `docs/<stage>/` and is listed below.
- Every spec starts with one line: date · status (approved / built) · Figma · code.
- Docs describe decided or built behaviour only. Open questions are tracked outside the repo.
- No new words: UI text comes from the app (live Console translations override `en.json`); a new
  word needs the product owner's approval.
- Business rules and Sharetribe's process are separate sources of truth; neither changes to fit the
  other without approval ([business rules](1-product/business-rules.md)).

## Index

| Stage | Doc                                                                     | What it holds                                                                               |
| ----- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1     | [business-rules.md](1-product/business-rules.md)                        | Users, account, payout, public profile; business vs Sharetribe                              |
| 1     | [negotiation-flow.md](1-product/negotiation-flow.md)                    | Offer → counteroffer → final offer → payment → performance; titles; Sharetribe mapping      |
| 2     | [2-wireframes/README.md](2-wireframes/README.md)                        | What the Figma file holds                                                                   |
| 3     | [booking.md](3-journeys/booking.md)                                     | Send offer to payment, both roles                                                           |
| 3     | [account-and-profile-setup.md](3-journeys/account-and-profile-setup.md) | Public profile builder, account settings, payouts                                           |
| 3     | [auth.md](3-journeys/auth.md)                                           | Log in, sign up, verify email                                                               |
| 4     | [rules.md](4-design-system/rules.md)                                    | Design rules, sources and sync, component library, front-end architecture, review checklist |
| 4     | [tokens.md](4-design-system/tokens.md)                                  | Logo, font, type scale, spacing, colour use                                                 |
| 4     | [layouts.md](4-design-system/layouts.md)                                | Centered and Split layouts                                                                  |
| 4     | [components.html](4-design-system/components.html)                      | Frozen: components that have no Storybook story yet. No new entries                         |
| 5     | [landing.md](5-pages/landing.md)                                        | Landing page (marketing surface)                                                            |
| 5     | [home.md](5-pages/home.md)                                              | Logged-in home                                                                              |
| 5     | [public-profile.md](5-pages/public-profile.md)                          | DJ public profile                                                                           |
| 5     | [offer-builder.md](5-pages/offer-builder.md)                            | Complete your offer                                                                         |
| 5     | [header.md](5-pages/header.md)                                          | Header and menu                                                                             |
| 5     | [footer.md](5-pages/footer.md)                                          | Footer                                                                                      |

Console content pages (Privacy, Terms of use, Payment terms, FAQ, Contact) take their text from
Sharetribe Console and use the app's type and cards: one card per Console block, the first one open.
