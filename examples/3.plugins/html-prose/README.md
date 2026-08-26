# Comark HTML + Prose example

A fully interactive docs page with **no framework**: markdown is rendered to an HTML string with `@comark/html`, the `@comark/prose` plugin lowers callouts, tabs, code groups, steps and accordions to plain HTML, and one script tag registers the two custom elements that power tabs and copy buttons.

```bash
pnpm install
pnpm dev
```

## What to look at

- `src/main.ts` — `renderHtml(markdown, { plugins: [prose()] })` plus three imports: `components.css`, `typography.css`, and `client/register`.
- Disable JavaScript in your browser: tab panels render stacked, accordions and callouts keep working, copy buttons disappear.
- The tabs and the code group share `sync="pkg"` — switching one switches the other, persisted in `localStorage`.
