# Ohno

Ohno is an Angular playground for learning algorithms and data structures through interactive, animated visualizations.

The project focuses on:
- algorithm walkthroughs with step-by-step state
- rich visual scenes for sorting, graph, DP, string, grid, geometry, and network problems
- multilingual UI with Polish and English translations
- a growing unit-test suite around the algorithm layer

## Stack

- Angular 21
- TypeScript
- Vitest
- D3, Anime.js, Three.js
- Transloco
- Font Awesome

## Requirements

- Node.js `22.14.0` or compatible Node 22 runtime
- npm `10.9.2` or newer npm 10 release
- a valid Font Awesome Pro npm token

This repository currently depends on Font Awesome Pro packages. A fresh `npm install` will fail until you provide your own token.

## Getting Started

1. Install dependencies for the first time by creating a local `.npmrc` from [.npmrc.example](./.npmrc.example).
2. Replace `${FONTAWESOME_NPM_AUTH_TOKEN}` with your own Font Awesome Pro npm token or export it as an environment variable before running npm.
3. Install dependencies:

```bash
npm ci
```

4. Start the app:

```bash
npm start
```

The dev server runs on `http://localhost:4200/`.

## Scripts

- `npm start` runs the Angular dev server
- `npm run build` creates a production build
- `npm run test:algorithms` runs the Vitest suite for the algorithms feature
- `npm run test:algorithms:coverage` runs the same suite with coverage output
- `npm run i18n:extract` extracts translation keys
- `npm run i18n:find` finds translation key usage

## CI

GitHub Actions expects a repository secret named `FONTAWESOME_NPM_AUTH_TOKEN`.

Without that secret, dependency installation for the workflow will fail because the project imports private Font Awesome packages.

## Netlify Deploy

The repository includes [netlify.toml](./netlify.toml) with:
- `npm run build` as the build command
- `dist/ohno` as the publish directory
- an SPA fallback redirect for Angular routes
- a small set of CDN response headers

Before the first Netlify deploy, add a site environment variable named `NPM_RC` with this content:

```ini
@fortawesome:registry=https://npm.fontawesome.com/
//npm.fontawesome.com/:_authToken=YOUR_FONTAWESOME_TOKEN
```

This is required because the project depends on private Font Awesome Pro packages and no longer stores a real `.npmrc` in the repository.

## Notes Before Publishing

- The old tracked `.npmrc` with a live token has been removed from the repository.
- If that token was ever pushed to any remote, rotate or revoke it in Font Awesome immediately.
- The app currently builds with a few Angular budget warnings. They do not block the build, but they are known technical debt.

## License

This project is available under the MIT License. See [LICENSE](./LICENSE).
