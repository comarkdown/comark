import type { EmailConfig, EmailRendererOptions, MjmlNode } from './types.ts'

/**
 * Resolve the final EmailConfig from frontmatter and options.
 *
 * Merge order (last write wins):
 *   1. Top-level frontmatter aliases (subject, previewText, brandColor)
 *   2. frontmatter.email.*
 *   3. options.email
 *
 * brandColor falls back to theme.primary when not explicitly set.
 */
export const resolveEmailConfig = (
  frontmatter: Record<string, unknown>,
  options?: EmailRendererOptions
): EmailConfig => {
  const fm = frontmatter ?? {}
  const fmEmail = (fm.email ?? {}) as EmailConfig
  const opt = options?.email ?? {}

  const merged: EmailConfig = {
    subject: (fm.subject as string | undefined) ?? fmEmail.subject,
    previewText: (fm.previewText as string | undefined) ?? fmEmail.previewText,
    brandColor: (fm.brandColor as string | undefined) ?? fmEmail.brandColor,
    theme: fmEmail.theme,
    ...opt,
  }

  // brandColor falls back to theme.primary
  if (!merged.brandColor && merged.theme?.primary) {
    merged.brandColor = merged.theme.primary
  }

  return merged
}

/**
 * Build the mj-head JSON node from a resolved EmailConfig.
 *
 * Produces:
 *   - mj-title (subject)
 *   - mj-preview (previewText)
 *   - mj-attributes (font defaults, brandColor on mj-button, background on mj-body)
 *   - mj-style (headCss when set)
 */
export const buildMjmlHead = (config: EmailConfig, headCss?: string): MjmlNode => {
  const children: MjmlNode[] = []

  if (config.subject) {
    children.push({ tagName: 'mj-title', attributes: {}, content: config.subject })
  }

  if (config.previewText) {
    children.push({ tagName: 'mj-preview', attributes: {}, content: config.previewText })
  }

  const attrChildren: MjmlNode[] = [
    {
      tagName: 'mj-all',
      attributes: { 'font-family': 'Arial, sans-serif' },
    },
    {
      tagName: 'mj-text',
      attributes: { 'line-height': '1.6', 'font-size': '15px', color: '#333333' },
    },
  ]

  if (config.brandColor) {
    attrChildren.push({
      tagName: 'mj-button',
      attributes: { 'background-color': config.brandColor },
    })
  }

  if (config.theme?.background) {
    attrChildren.push({
      tagName: 'mj-body',
      attributes: { 'background-color': config.theme.background },
    })
  }

  children.push({ tagName: 'mj-attributes', attributes: {}, children: attrChildren })

  if (headCss) {
    children.push({ tagName: 'mj-style', attributes: {}, content: headCss })
  }

  return { tagName: 'mj-head', attributes: {}, children }
}
