# Security policy

## Supported versions

| Version | Supported          |
|---------|--------------------|
| Latest  | :white_check_mark: |

## Reporting a vulnerability

If you discover a security vulnerability in Comark, report it privately.

**Do not open a public issue.** Email **security@comark.dev** with:

- A description of the vulnerability
- Steps to reproduce
- Potential impact
- A suggested fix, if you have one

## Response timeline

- **Acknowledgment**: within 48 hours of receiving the report
- **Assessment**: we assess severity and impact within 7 days
- **Fix**: we patch critical vulnerabilities as soon as possible
- **Disclosure**: we coordinate public disclosure timing with you

## Scope

This policy applies to all packages in the Comark monorepo:

- `comark`
- `@comark/html`
- `@comark/ansi`
- `@comark/vue`
- `@comark/react`
- `@comark/svelte`
- `@comark/angular`
- `@comark/nuxt` (deprecated)

## Built-in security

Comark includes a [security plugin](https://comark.dev/plugins/built-in/security) (`comark/plugins/security`) for XSS sanitization. Enable it when rendering untrusted or user-generated content.

Thank you for helping keep Comark and its users safe.
