# Header: spec and rollout plan

Oct 13, 2026 · Zoha Fard

Design: [design/header.html](design/header.html). Rules: [design-system-rules.md](design-system-rules.md),
tokens: [tokens.md](tokens.md).

## Today

Two header components, both from the Sharetribe template:

- **`Topbar`** (`src/containers/TopbarContainer/`): every page except the three below. Logo on the
  left from 1024px, centred below that. Mobile bar 72px, tablet 120px, desktop about 96px; logo
  52px tall on desktop.
- **`TopbarSimplified`** (`src/components/TopbarSimplified/`): Make offer, Request quote, Checkout.
  Logo only, centred.

What each user sees (code + Console, unchanged by this redesign):

| | Desktop | Phone (menu button) |
| --- | --- | --- |
| Guest | Sign up · Log in | Sign up / Log in behind the menu |
| Event organizer | Home · Find a DJ · avatar menu (Account settings, Log out) | Hello {name} · Log out · Find a DJ · Account settings · Home |
| DJ | Home · avatar menu (My public profile, Account settings, Log out) | Hello {name} · Log out · My public profile · Account settings · Home |

## Decisions

| What | Decision |
| --- | --- |
| Logo position | Always on the left. Everything else on the right. |
| Bar height | 60px at every width (reference: peec.ai). |
| Logo | The brand image, 28px tall (about 134px wide). |
| Sign up / Log in | In the bar at every width, phones included. Styled like peec.ai's menu links but black: 14px (`--lb-size-small`), regular 400, letter spacing -0.01em, no underline; underlined on hover (offset 3px). 44px tap height. |
| Rule under the bar | 1px `--colorGrey100`. |
| Items per role | Exactly as in code today. Nothing added, removed or reordered. |

### New tokens (`src/styles/lineupTokens.css`, also added to tokens.md)

```css
--lb-topbar-height: 60px;
--lb-logo-header: 28px;
--lb-tracking-nav: -0.01em;
```

## Front-end architecture

1. **`SiteHeader`**, a new shared component in `src/components/SiteHeader/` (named so it isn't
   confused with the existing `PageHeader`). It only displays: the logo on
   the left, and whatever it is given (`children`) on the right. It doesn't read Redux, doesn't know
   about roles and contains no text. Every later stage adds to it by passing content in, so it
   never needs to be rewritten.
2. **`TopbarContainer` / `Topbar` keep the logic** (who is logged in, which role, which links).
   They render `SiteHeader` and pass in the links. The role logic is not touched.
3. **`TopbarSimplified`** renders the same `SiteHeader` with nothing on the right.
4. **Load time and layout shift:** the bar has a fixed height (`--lb-topbar-height`), and the logo
   image has width and height set, so nothing moves when the page loads. The guest header is plain
   links, so it renders on the server with no extra JavaScript. The logged-in menus stay in the
   separately loaded `Topbar` chunk.

## Rollout (one stage at a time, check before moving on)

**Stage 1: guest header + simplified header** (prompt: [header-prompt.md](header-prompt.md))

- Build `SiteHeader`. Use it for the **guest** state of `Topbar` and for `TopbarSimplified`.
- What changes: everything a logged-out visitor sees (landing page, log in / sign up, search,
  DJ profiles) and the offer builder, request quote and checkout bars.
- Why not landing page only: the topbar has no clean "landing only" switch, so landing-only code
  would be thrown away in stage 2. Guest and logged-in are the natural split in the code, and log in /
  sign up and the offer builder are already redesigned.
- Logged-in users keep today's topbar until stage 2. Between stages the two bars have different
  heights; that's expected.

**Stage 2: logged-in header, starting from Home (`/p/home`)**

- Needs a design first: the avatar menu and the phone menu (the prototype shows only the closed bar).

- Event organizer and DJ items in the bar, the avatar menu and the phone menu, all with today's
  items. Check on Home first, then on the other logged-in pages.

**Stage 3: clean-up and open decisions**

- Remove what's switched off (header search, "Post a new listing", the "More" link overflow), if
  Zoha agrees. Decide the open items below.

## Migration plan: every page on the new header (approved Oct 15, 2026)

Picture of every page × user × width, today and proposed, with bugs and dead code:
[design/header-journey.html](design/header-journey.html). This plan replaces the "Rollout" stages 2–3
above.

### What we are building

| | Phone (< 768) | iPad 768 and desktop |
| --- | --- | --- |
| Guest | Logo · menu icon → panel: Sign up, Log in | Logo · Sign up · Log in |
| Event organizer | Logo · avatar → panel: Hello {name}, Home, Find a DJ, Account settings, Log out | Logo · Home · Find a DJ · avatar → Hello {name}, Account settings, Log out |
| DJ | Logo · avatar → panel: Hello {name}, Home, My public profile, Account settings, Log out | Logo · Home · My public profile · avatar → Hello {name}, Account settings, Log out |

- Same 60px bar on **every** page, offer builder and payment included. No logo-only bar.
- Logo: guest → landing `/`; logged in → `/p/home`.
- My public profile opens the DJ's own profile (`/l/…`), which shows the owner's Edit profile link.
- Avatar = initials circle, no chevron. Red dot on Home (phone: on the avatar) for unread offers.
- Current page: underlined in the bar, 600 in the menu, `aria-current="page"`.
- Dropdown: white, 1px `--colorGrey100`, 8px radius, `--lb-shadow-search`, 240px, 44px rows.
  Phone panel: under the bar, 48px rows, no divider lines, scrim behind, Log out last.

### Stages (one at a time; check guest, organizer and DJ at 375, 768 and 1280px)

0. **Done:** guest bar on `SiteHeader`, logo-only bar.
1. **One height** (prompt: [header-height-prompt.md](header-height-prompt.md)). Point `--topbarHeight` / `--topbarHeightDesktop` at `--lb-topbar-height`; check
   sticky side nav, search map, anchors, full-height pages; drop dead `.topbar` rules in Checkout
   and MakeOffer CSS. *Fixes: offsets 12px off.*
2. **Header menu in the library (docs first).** Add avatar trigger, dropdown, phone panel and guest
   menu to `components.html` and `design-system-rules.md`; tokens `--lb-avatar-header` (32px),
   `--lb-menu-width` (240px), `--lb-scrim` to `tokens.md` + `lineupTokens.css`. Build a shared
   `HeaderMenu` on `Menu` / `MenuLabel` / `MenuContent` class props with `aria-expanded`, Esc and
   focus return. *Fixes: menu not announced to screen readers.*
3. **Logged-in header everywhere.** `Topbar` renders `SiteHeader` for all users: one nav, one logo,
   no `matchMedia`. Role items as in the table; current page; logo target; Home label from Console.
   *Fixes: height jump on log in / sign up, two logos in the DOM, DJ profile highlight, hardcoded
   "Home", logo going to `/`.*
4. **Guest phone menu.** Menu icon (lucide `Menu`, "Open menu") opens the panel with Sign up, Log in.
5. **Offer builder and payment.** `RequestQuotePage`, the three `CheckoutPage` variants and
   `MakeOfferPage` use `TopbarContainer`.
6. **Unread offers.** Red dot from the existing notification count. *Fixes: dot leading nowhere.*
7. **Clean-up.** Delete `TopbarSimplified`, `TopbarDesktop`, `TopbarMobileMenu`, `CustomLinksMenu`,
   header search, "Post a new listing", the guest "Hello there" menu; update `header.md`,
   `bugs.md`, `components.html`.

### Still open

- [ ] Accounts with both roles: show both Find a DJ and My public profile? (Recommended; stage 3.)
- [ ] Offer builder form is not saved: warn before leaving with changes? Needs existing wording
      (stage 5).

## Open items (not part of stage 1)

- [ ] **Activity link.** "Activity" is the existing label for the inbox, the page listing all
      bookings, offers and messages (`/inbox/orders` for organizers, `/inbox/sales` for DJs). The
      code has the label and works out the right tab but shows no link. The phone menu button
      shows a red unread dot that leads nowhere. Showing the link is a feature decision.
- [ ] Where the logo goes for logged-in users: `/` (marketing landing) or `/p/home`.
- [ ] "Home" is hardcoded in English in `Topbar.js`, not translated.
- [ ] A user without a known user type sees neither Find a DJ nor My public profile.
