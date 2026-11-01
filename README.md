# LineupBridge

A marketplace for booking professional DJs. An event organizer sends a DJ a structured offer (date,
set times, venue, fee), the two negotiate for at most three rounds, and the booking is paid and paid
out through the platform.

Product, design and engineering by [Zoha Fard](https://github.com/zohaf).

| Where       | Link                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------- |
| Live app    | [lineupbridge.com](https://www.lineupbridge.com)                                          |
| Figma       | [LineupBridge design file](https://www.figma.com/design/uUt1bfNw7imHngWi1QFXGJ)           |
| Storybook   | [Component library](https://claude.ai/artifact/6tPY5AR84QkRBGcw3R6kUH) (`yarn storybook`) |
| Docs        | [docs/README.md](docs/README.md)                                                          |
| Coming soon | [lineupbridge-landing](https://github.com/zohaf/lineupbridge-landing) (separate repo)     |

## The application

LineupBridge is an MVP. It covers one flow from start to end:

find a DJ → offer → counteroffer → final offer → payment → performance → confirmation → payout

- Two user types: **DJ** (Sharetribe provider) and **event organizer** (Sharetribe customer).
- Rules: [business rules](docs/1-product/business-rules.md) and
  [negotiation flow](docs/1-product/negotiation-flow.md).
- Outside the MVP: refunds (handled per the terms), reviews (in the process, hidden in the UI) and
  "Request changes" after a performance.

## Design

Design moves through six stages, and each stage uses only what the stages before it define. Every
stage has a folder in [docs/](docs/README.md):

| Stage            | Folder                                                         | Output                                    |
| ---------------- | -------------------------------------------------------------- | ----------------------------------------- |
| 1. Product       | [1-product/](docs/1-product/)                                  | Business rules and the negotiation flow   |
| 2. Wireframes    | [2-wireframes/](docs/2-wireframes/README.md)                   | Low-fidelity screens in Figma             |
| 3. Journeys      | [3-journeys/](docs/3-journeys/)                                | Screens in order per user and goal        |
| 4. Design system | [4-design-system/](docs/4-design-system/)                      | Rules, tokens, layouts, components, brand |
| 5. Pages         | [5-pages/](docs/5-pages/)                                      | One spec per page, built from the system  |
| 6. Claude Code   | [6-working-with-claude/](docs/6-working-with-claude/README.md) | How the agent works inside these rules    |

The design system exists in three places that describe the same components:

- **Docs:** [rules](docs/4-design-system/rules.md), [tokens](docs/4-design-system/tokens.md),
  [layouts](docs/4-design-system/layouts.md) and
  [every component in every state](docs/4-design-system/components.html).
- **Figma:** variables, components, layouts, pages, journeys and wireframes, built from the code.
- **Storybook:** the components rendered by the app's own code, with the app's providers and
  `en.json` text.

UI text comes from the app only: live Sharetribe Console translations, then `en.json`. A new word
needs approval ([rules](docs/4-design-system/rules.md)).

## Engineering

### Stack

| Layer      | Technology                                                                              |
| ---------- | --------------------------------------------------------------------------------------- |
| Base       | Fork of the [Sharetribe Web Template](https://github.com/sharetribe/web-template) 10.15 |
| Frontend   | React 18, Redux Toolkit 2, React Router 5, React Final Form 6, React Intl 7             |
| Server     | Express 5 with server-side rendering                                                    |
| Platform   | Sharetribe Marketplace API (listings, users, transactions, messages)                    |
| Payments   | Stripe Connect through Sharetribe                                                       |
| Styling    | CSS Modules, PostCSS (custom media, nesting), `--lb-*` design tokens                    |
| Components | Storybook 10                                                                            |
| Quality    | Jest and Testing Library, Prettier, CircleCI (format check, tests, build)               |
| Runtime    | Node.js 22.22 or newer, Yarn 4                                                          |

### Booking model

Bookings run on Sharetribe's `default-negotiation` transaction process
([ext/transaction-processes/](ext/transaction-processes/)). The process allows more paths than the
product does; the [business rules](docs/1-product/business-rules.md) decide which ones are used, and
rules Sharetribe does not enforce are enforced in this code (server first, UI second). Counteroffers
are stored on the transaction and shown as proposed values next to the current terms.

### Where things live

```text
docs/                      Product, journeys, design system and page specs
src/styles/lineup*         Design tokens and shared styles (type, layout, buttons, forms, modals)
src/components/            Shared components; *.stories.js next to each LineupBridge component
src/containers/            Pages; data loads in each page's loadData for server rendering
server/                    Express server, SSR and privileged transitions
ext/transaction-processes/ Sharetribe process definitions
.storybook/                Storybook setup (reuses the app's webpack config and providers)
CLAUDE.md, .claude/        Rules, skills, reviewer agents and hooks for Claude Code
```

Configuration and translations come from Sharetribe Console as hosted assets and override the local
defaults in `src/config/` and `src/translations/`.

### How a change is made

1. Docs first: the spec or rule in `docs/`.
2. Tokens and shared styles in `src/styles/lineup*`.
3. Components, with a story in Storybook.
4. Pages.

Template components are restyled through their class props, so upstream Sharetribe updates still
merge. Transaction process changes need approval and a push to Sharetribe as well as this repo
([src/transactions/README.md](src/transactions/README.md)).

Branches: feature branch → `dev` (staging) → `main` (live).

## Run locally

```sh
yarn install
yarn config      # creates .env (Sharetribe, Stripe and Mapbox keys)
yarn dev         # app and API at http://localhost:3000
yarn storybook   # Storybook at http://localhost:6006, no .env needed
```

| Command            | Purpose                                |
| ------------------ | -------------------------------------- |
| `yarn test`        | Frontend and component tests           |
| `yarn test-server` | Server tests                           |
| `yarn format`      | Prettier for JavaScript and CSS        |
| `yarn build`       | Production build; `yarn start` runs it |

Optional settings are listed in `.env-template`. Never commit `.env`. For the template's own coding
conventions see [AGENTS.md](AGENTS.md); for the platform see the
[Sharetribe Developer Docs](https://www.sharetribe.com/docs/).

## License

Apache-2.0. See [LICENSE](LICENSE).
