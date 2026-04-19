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

- Node.js `22.x` or another Angular 21 compatible runtime such as `20.19+`
- npm `10.9.2` or newer npm 10 release
- a valid Font Awesome Pro npm token

This repository currently depends on Font Awesome Pro packages. A fresh `npm install` will fail until you provide your own token.

## Getting Started

1. Export `FONTAWESOME_PACKAGE_TOKEN` in your shell with your Font Awesome Package Manager token.
2. Install dependencies:

```bash
npm ci
```

3. Start the app:

```bash
npm start
```

The dev server runs on `http://localhost:4200/`.

## Scripts

- `npm start` runs the Angular dev server
- `npm run dev` is an alias for the Angular dev server
- `npm run build` creates a production build
- `npm run build:dev` creates a development build
- `npm run test:algorithms` runs the Vitest suite for the algorithms feature
- `npm run test:algorithms:coverage` runs the same suite with coverage output
- `npm run verify` runs the algorithm tests and the production build
- `npm run verify:quick` runs only the production build
- `npm run deploy:production` promotes `main` to the `production` branch
- `npm run release:production` verifies the app and then promotes `main` to `production`
- `npm run i18n:extract` extracts translation keys
- `npm run i18n:find` finds translation key usage

## CI

GitHub Actions expects a repository secret named `FONTAWESOME_PACKAGE_TOKEN`.

Without that secret, dependency installation for the workflow will fail because the project imports private Font Awesome packages.

The repository also includes:
- a CI workflow for pushes and pull requests
- a manual `Release Production` workflow for promoting a chosen ref to `production`
- weekly Dependabot updates for npm packages and GitHub Actions
- a CodeQL workflow for JavaScript and TypeScript security scanning

## Netlify Deploy

The repository includes [netlify.toml](./netlify.toml) with:
- `npm run build` as the build command
- `dist/ohno/browser` as the publish directory
- an SPA fallback redirect for Angular routes
- a small set of CDN response headers

Before the first Netlify deploy, add a site environment variable named `FONTAWESOME_PACKAGE_TOKEN`.

The repository now includes a checked-in `.npmrc` that safely references `${FONTAWESOME_PACKAGE_TOKEN}`. npm replaces that placeholder at install time, so you do not need a separate `NPM_RC` variable on Netlify.

## Branch Workflow

Recommended branch model:
- `feature/*` for in-progress work
- `main` as the integration branch
- `production` as the Netlify production branch

With Netlify configured to deploy from `production`:
- pushes to `main` do not update the live site
- production deploys happen only when `production` is updated
- pull requests targeting `main` or `production` run CI in GitHub Actions

To promote the current `main` state to production:

```bash
npm run deploy:production
```

To verify before promoting:

```bash
npm run release:production
```

You can also trigger the `Release Production` workflow in GitHub Actions and choose which ref should be promoted to the `production` branch. If you later add a GitHub Environment named `production` with required reviewers, this workflow will wait for approval before promoting the release.

## Security

- `SECURITY.md` documents the reporting policy for vulnerabilities.
- Dependabot and CodeQL are configured in `.github/` so the repository can surface basic dependency and code scanning issues automatically.

## Notes Before Publishing

- The old tracked `.npmrc` with a live token has been removed from the repository.
- If that token was ever pushed to any remote, rotate or revoke it in Font Awesome immediately.
- The app currently builds with a few Angular budget warnings. They do not block the build, but they are known technical debt.

## License

This project is available under the MIT License. See [LICENSE](./LICENSE).
