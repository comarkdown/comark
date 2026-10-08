# Contributing to Comark

Thanks for contributing! For a bug fix, include a reproduction and a regression test. If you are planning a new API or a larger change, an issue is a good place to discuss the scope before implementation.

## Local setup

Use Node.js 24 (the version used in CI) and the pnpm version pinned in the root `package.json`. With Corepack installed, enable it before installing dependencies:

```sh
corepack enable
pnpm install
```

Run commands from the repository root unless a different directory is shown. Installation runs `pnpm stub`: package `dist/` files re-export their TypeScript sources, and `pnpm sync-plugins` adds plugin re-exports to the renderer packages. These files are generated and should not be committed.

## Develop with an example

The default example is the Vue app in `examples/2.vite/vue`:

```sh
pnpm dev
```

Other examples have their own root scripts, including `pnpm dev:react`, `pnpm dev:svelte`, `pnpm dev:angular`, `pnpm dev:html`, and `pnpm dev:nuxt`. Use the example for the renderer you are changing.

With source stubs in place, example bundlers load local package sources directly. You do not normally need a second terminal running `pnpm dev:packages`.

`pnpm build` replaces the stubs with compiled output. After building, restore source exports before continuing development:

```sh
pnpm stub
```

If you want to develop against compiled output instead, run `pnpm dev:packages` in a separate terminal alongside the example. This runs the available package compiler watchers; packages without a `dev` script still need their own build command. For Svelte's compiler watcher, use `pnpm --dir packages/comark-svelte run build:watch`.

The documentation site uses a separate app:

```sh
pnpm docs
```

## Find the right package

- `packages/comark`: parser, document model, core plugins and Markdown string rendering.
- `packages/comark-html` and `packages/comark-ansi`: HTML and terminal renderers.
- `packages/comark-vue`, `packages/comark-react`, `packages/comark-svelte`, and `packages/comark-angular`: framework renderers.
- `packages/comark-nuxt`: Nuxt integration.
- `docs/content`: user-facing documentation.

Keep parser-only behavior in the core package and framework-specific behavior in its renderer. The [architecture reference](./AGENTS.md) has a more detailed package map.

## Add or change a plugin

Core plugins live in `packages/comark/src/plugins` and use `defineComarkPlugin` from `comark/parse`. Add tests in `packages/comark/test/plugins` and document the plugin in `docs/content/4.plugins`.

For plugins without a framework component, `pnpm sync-plugins` generates the renderer re-exports. If a plugin needs a component, add the wrapper in the relevant renderer package and keep the renderer APIs consistent.

See the [plugin API](https://comark.dev/plugins/custom/plugin-api) for hooks and examples.

## Check your changes

Run the repository checks before opening a pull request:

```sh
pnpm verify
```

This runs linting, package tests and the root TypeScript check. Formatting uses oxfmt, with no semicolons, single quotes and a 120-column limit. To format a file, use `pnpm exec oxfmt path/to/file`; review the diff before committing.

For a focused parser test:

```sh
cd packages/comark
pnpm exec vitest run test/parse/sub-sup.test.ts
```

Parser fixtures live in `packages/comark/SPEC` and run through `test/index.test.ts`. Parser changes should also preserve streaming behavior in `test/streaming.test.ts`.

Svelte's local tests include a headless Chromium project. Install the browser if needed:

```sh
pnpm exec playwright install chromium
```

For changes to build output or package exports, also run the build and bundle snapshot check used in CI:

```sh
pnpm prepack
pnpm exec vitest run bundle
```

If your change legitimately alters package sizes, update the snapshot with `pnpm exec vitest run bundle -u` after building, and review the resulting diff. Restore source stubs with `pnpm stub` before returning to example development.

## Prepare a pull request

Link the relevant issue and follow the pull request template's **What** and **Why** sections. Describe the user-visible problem, the chosen fix and any compatibility impact. Include the checks you ran and any remaining limitations.

Use Conventional Commits, for example `fix(parse): preserve inline comments`, `feat(html): add an option`, or `docs: clarify local setup`. Mark breaking changes explicitly. Maintainers use these messages to generate package releases; contributors do not need to bump versions or publish packages.

All commits in a pull request that is ready for review must have a signature that GitHub verifies. Use a signing key registered with your GitHub account and check the commit's **Verified** status before submitting. See GitHub's [commit signing guide](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits).

Report security vulnerabilities privately using [SECURITY.md](./SECURITY.md).
