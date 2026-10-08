# LineupBridge Marketplace

LineupBridge is a professional DJ booking marketplace built on React, Express, and Sharetribe. The
application supports marketplace discovery, listing and profile management, messaging, bookings,
payments, authentication, and server-side rendering.

The `landing-page-clean` directory contains the separate coming-soon landing page. This directory
contains the main marketplace application.

## Requirements

- Node.js 22.22.0 or newer
- Yarn
- A Sharetribe marketplace and application
- A Stripe account configured for the marketplace
- A Mapbox access token, unless another map provider is configured

## Local setup

From this directory:

```sh
yarn install
yarn config
yarn dev
```

The configuration command creates `.env` and prompts for the required values. The development server
starts the React frontend and Express API together at `http://localhost:3000`.

Never commit `.env` or any other file containing credentials.

## Environment variables

The most important local settings are:

| Variable                             | Purpose                                                    |
| ------------------------------------ | ---------------------------------------------------------- |
| `REACT_APP_SHARETRIBE_SDK_CLIENT_ID` | Sharetribe client ID                                       |
| `SHARETRIBE_SDK_CLIENT_SECRET`       | Secret for privileged Sharetribe API calls                 |
| `REACT_APP_MARKETPLACE_NAME`         | Marketplace name shown by the app                          |
| `REACT_APP_MARKETPLACE_ROOT_URL`     | Canonical app URL, without a trailing slash                |
| `REACT_APP_STRIPE_PUBLISHABLE_KEY`   | Stripe publishable key                                     |
| `REACT_APP_MAPBOX_ACCESS_TOKEN`      | Mapbox access token                                        |
| `REACT_APP_ENV`                      | Runtime environment, such as `development` or `production` |

See `.env-template` for optional settings, including social login, analytics, content security
policy, Sentry, and proxy configuration. The Stripe secret key must also be configured in Sharetribe
Console; it is not stored in this frontend repository.

## Common commands

| Command             | Description                                 |
| ------------------- | ------------------------------------------- |
| `yarn dev`          | Run the frontend and development API server |
| `yarn build`        | Build the browser bundle and server bundle  |
| `yarn start`        | Run the production server after building    |
| `yarn test`         | Run frontend and component tests            |
| `yarn test-server`  | Run server tests                            |
| `yarn test-ci`      | Run the complete CI test suite              |
| `yarn format`       | Format JavaScript and CSS files             |
| `yarn format-docs`  | Format Markdown files                       |
| `yarn config-check` | Verify that `.env` exists                   |

To test the production server locally:

```sh
yarn build
yarn start
```

## Project structure

```text
src/                       # React application
|-- components/            # Shared presentational components
|-- config/                # Local configuration defaults
|-- containers/            # Page-level components and data loading
|-- ducks/                 # Shared Redux Toolkit logic
|-- routing/               # Routes and route configuration
|-- transactions/          # Client-side transaction process graphs
|-- translations/          # Localized fallback messages
|-- util/                  # Shared application utilities
server/                    # Express server, API routes, and SSR
public/                    # Static assets and browser entry files
ext/transaction-processes/ # Sharetribe process definitions
```

The app loads many configuration and translation assets from Sharetribe Console. Local values in
`src/config` provide defaults and fallbacks.

## Transaction processes

The client transaction graphs in `src/transactions` must match the transaction processes configured
in Sharetribe Console. The repository includes booking, purchase, inquiry, and negotiation flows.

When changing a transaction process, update both the Sharetribe backend and the corresponding
client-side graph. Review [src/transactions/README.md](src/transactions/README.md) before making
these changes.

## Deployment

Build the application in the deployment environment and run the production server:

```sh
yarn install
yarn build
yarn start
```

Set all required environment variables in the hosting provider. The production server requires
`REACT_APP_SHARETRIBE_SDK_CLIENT_ID`, `SHARETRIBE_SDK_CLIENT_SECRET`, `REACT_APP_MARKETPLACE_NAME`,
and `REACT_APP_MARKETPLACE_ROOT_URL`.

For Sharetribe platform configuration and API details, see the
[Sharetribe Developer Docs](https://www.sharetribe.com/docs/).

## License

This project is licensed under the Apache-2.0 license. See [LICENSE](LICENSE).
