# Changelog

All notable changes to `@comark/email` are documented in this file.

## 0.2.0

### Breaking Changes

- Replaced Maizzle/PostHTML engine with [MJML](https://mjml.io) v5.
- `pnpm add mjml` is now required instead of `@maizzle/framework`.
- `EmailRendererOptions` no longer has `tailwindConfig`, `maizzleOptions`, or `baseCss`. Use `mjmlOptions` and `headCss` instead.
- `assembleEmailHtml`, `renderEmailBody`, `frontmatterToMaizzleConfig`, `DEFAULT_EMAIL_CSS`, and `buildPreheader` are removed.
- Email component attributes are now native MJML attributes (e.g. `background-color`, `border-color`) instead of Tailwind utility classes.
- `::email-button` maps to `<mj-button>`, `::email-columns` to `<mj-section>` + `<mj-column>`, `::email-divider` to `<mj-divider>`.
- `EmailRenderResult.errors` is now typed as `MjmlCompileError[]` (not `unknown[]`).

### Added

- `documentToMjml(doc, options)` — returns MJML XML string for debugging.
- `compileMjml` is re-exported from the main entry point.
- `MjmlNode`, `MjmlCompileError`, `MjmlCompileOptions` types exported.
- `headCss` option injects CSS into `<mj-style>` in the email head.
- `brandColor` frontmatter/options key sets default `mj-button` background.
