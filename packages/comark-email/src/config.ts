import type { EmailConfig, EmailTheme } from './types.ts'

/** Minimal default CSS injected into every assembled email document. */
export const DEFAULT_EMAIL_CSS =
  '.comark-email-columns{width:100%;border-collapse:collapse}.comark-email-divider{width:100%}'

/**
 * Build a hidden preheader element that email clients show as preview text.
 * The element is visually hidden via inline styles.
 */
export const buildPreheader = (previewText: string): string =>
  `<div style="display:none;font-size:1px;color:#fff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${previewText}</div>`

/**
 * Build a Maizzle v4 render config from an EmailConfig and the assembled HTML string.
 *
 * Maps theme colors to Tailwind's theme.extend.colors so they are available as
 * utility classes (e.g. `bg-primary`, `text-background`).
 * Sets css.inline=true and css.purge=true for email-safe output.
 * Passes the assembled HTML as Tailwind content so class detection works correctly.
 *
 * @param email - Resolved email config (frontmatter + options merged).
 * @param html - The assembled HTML string to process (used for Tailwind content detection).
 * @param tailwindConfig - Extra Tailwind config merged in after theme colors.
 */
export const frontmatterToMaizzleConfig = (
  email: EmailConfig,
  html: string,
  tailwindConfig?: Record<string, unknown>
): Record<string, unknown> => {
  const colors = resolveThemeColors(email.theme)

  const baseTailwindTheme = (tailwindConfig as { theme?: Record<string, unknown> } | undefined)?.theme
  const baseTailwindExtend = (baseTailwindTheme as { extend?: Record<string, unknown> } | undefined)?.extend

  const tailwind: Record<string, unknown> = {
    ...(tailwindConfig ?? {}),
    theme: {
      ...baseTailwindTheme,
      extend: {
        ...baseTailwindExtend,
        colors: { ...colors, ...(baseTailwindExtend as { colors?: Record<string, unknown> } | undefined)?.colors },
      },
    },
    content: [{ raw: html, extension: 'html' }],
  }

  return { css: { inline: true, purge: true, tailwind } }
}

const resolveThemeColors = (theme?: EmailTheme): Record<string, string> => {
  if (!theme) return {}
  const colors: Record<string, string> = {}
  for (const [key, value] of Object.entries(theme)) {
    if (value !== undefined) colors[key] = value
  }
  return colors
}
