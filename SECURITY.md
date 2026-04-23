# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| Latest  | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in Comark, please report it responsibly.

**Do not open a public issue.** Instead, please email us at:

**security@comark.dev**

Include the following in your report:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Response Timeline

- **Acknowledgment**: Within 48 hours of receiving the report
- **Assessment**: Within 7 days we will assess the severity and impact
- **Fix**: Critical vulnerabilities will be patched as soon as possible
- **Disclosure**: We will coordinate with you on public disclosure timing

## Scope

This policy applies to all packages in the Comark monorepo:

- `comark`
- `@comark/html`
- `@comark/ansi`
- `@comark/vue`
- `@comark/react`
- `@comark/svelte`
- `@comark/nuxt`

## Built-in Security

Comark includes a built-in [security plugin](https://comark.dev/plugins/core/security) (`comark/plugins/security`) that provides XSS sanitization. We recommend enabling it when rendering user-generated content.

Thank you for helping keep Comark and its users safe.
