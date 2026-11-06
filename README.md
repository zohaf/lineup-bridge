# LineupBridge

LineupBridge is a booking platform for professional DJs. An event organizer sends a structured
offer, both sides negotiate on that same offer, and the agreed terms become a confirmed booking with
secure payment.

| Where     | Link                                                                            |
| --------- | ------------------------------------------------------------------------------- |
| Live app  | [lineupbridge.com](https://www.lineupbridge.com)                                |
| Figma     | [LineupBridge design file](https://www.figma.com/design/uUt1bfNw7imHngWi1QFXGJ) |
| Storybook | [Component library](https://lineupbridge-storybook.vercel.app)                  |

## Stack

| Layer      | Technology                                                                  |
| ---------- | --------------------------------------------------------------------------- |
| Frontend   | React 18, Redux Toolkit 2, React Router 5, React Final Form 6, React Intl 7 |
| Server     | Express 5 with server-side rendering                                        |
| Payments   | Stripe                                                                      |
| Components | Storybook 10                                                                |
| Quality    | Jest and Testing Library, Prettier, CircleCI                                |
| Runtime    | Node.js 22.22 or newer, Yarn 4                                              |

## Run locally

```sh
yarn install
yarn config      # creates .env
yarn dev         # http://localhost:3000
yarn storybook   # http://localhost:6006
```

| Command            | Purpose                                |
| ------------------ | -------------------------------------- |
| `yarn test`        | Frontend and component tests           |
| `yarn test-server` | Server tests                           |
| `yarn format`      | Prettier                               |
| `yarn build`       | Production build; `yarn start` runs it |

Never commit `.env`.

## License

Apache-2.0. See [LICENSE](LICENSE).
