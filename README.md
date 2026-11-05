# LineupBridge

A marketplace for booking professional DJs. An event organizer sends a DJ a structured offer (date,
set times, venue, fee), the two negotiate for at most three rounds, and the booking is paid and paid
out through the platform.

| Where     | Link                                                                              |
| --------- | --------------------------------------------------------------------------------- |
| Live app  | [lineupbridge.com](https://www.lineupbridge.com)                                  |
| Figma     | [LineupBridge design file](https://www.figma.com/design/uUt1bfNw7imHngWi1QFXGJ)   |
| Storybook | [Component library](https://lineupbridge-storybook.vercel.app) (`yarn storybook`) |
| Docs      | [docs/README.md](docs/README.md)                                                  |

## The application

LineupBridge is an MVP covering one flow end to end: find a DJ, offer, counteroffer, final offer,
payment, performance, confirmation, payout.

- Two user types: **DJ** (Sharetribe provider) and **event organizer** (Sharetribe customer).
- Outside the MVP: refunds (handled per the terms), reviews (in the process, hidden in the UI) and
  "Request changes" after a performance.

Product rules, user journeys, the design system and page specs are in [docs/](docs/README.md). The
design system lives in code: Storybook renders its tokens and components from the app's own code,
and Figma mirrors them. User flows and wireframes are worked out in Figma.

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

A change to the process has to be deployed to Sharetribe as well as committed here
([src/transactions/README.md](src/transactions/README.md)).

### Where things live

```text
docs/                      Product rules, journeys, design system and page specs
src/styles/lineup*         Design tokens and shared styles (type, layout, buttons, forms, modals)
src/components/            Shared components; *.stories.js next to each LineupBridge component
src/containers/            Pages; data loads in each page's loadData for server rendering
server/                    Express server, SSR and privileged transitions
ext/transaction-processes/ Sharetribe process definitions
.storybook/                Storybook setup (reuses the app's webpack config and providers)
```

Configuration and UI text come from Sharetribe Console as hosted assets and override the local
defaults in `src/config/` and `src/translations/`.

Styles are layered: tokens, then shared styles, then components, then pages. Template components are
restyled through their class props, so upstream Sharetribe updates still merge.

Branches: feature branch → `dev` (staging) → `main` (live).

### How the design system is enforced

Development uses Claude Code with the rules in [docs/](docs/README.md). The parts that check work
are in `.claude/`:

| Check | Where | What it does |
| --- | --- | --- |
| Rules per file type | `.claude/rules/` | Tokens only in CSS, no new UI words, component conventions |
| Hooks | `.claude/hooks/`, `scripts/check-tokens.sh` | Prettier on save; raw CSS values fail; transaction process files cannot be edited |
| Reviewers | `.claude/agents/` | Read-only checks of a change against the design system, the page spec and WCAG 2.2 AA |

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

Optional settings are listed in `.env-template`. Never commit `.env`. For the template's coding
conventions see [AGENTS.md](AGENTS.md); for the platform see the
[Sharetribe Developer Docs](https://www.sharetribe.com/docs/).

## License

Apache-2.0. See [LICENSE](LICENSE).
