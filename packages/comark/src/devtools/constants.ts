/** Inline Lucide SVG icons (MIT licensed) — used in the devtools renderer */
export const LUCIDE_MOON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>'
export const LUCIDE_SUN =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>'
export const LUCIDE_MONITOR =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>'

/**
 * Comark logo SVG icons for the Vite DevTools dock.
 *
 * Vite DevTools renders dock icons as either Iconify names or `<img src>` for
 * URL / data-URI strings. Use a solid filled mark (no strokes) and base64 so the
 * icon stays crisp at 16–20px and survives the dark/light dock themes.
 */
function comarkSvg(color: string): string {
  // Compact mark adapted from the brand logo: squared frame + M + 2×2 dots.
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">`,
    `<rect x="2.5" y="6.5" width="27" height="19" rx="2" stroke="${color}" stroke-width="2.25"/>`,
    `<path fill="${color}" d="M7 22V10h2.8l3.3 5.6L16.4 10H19.2v12h-2.6v-6.9L13.5 20h-1.8l-3.1-4.9V22H7zm12.4-7.8V10H24v4.2h-4.6zm0 7.8v-4.2H24V22h-4.6zm5.4-7.8V10H29v4.2h-4.2zm0 7.8v-4.2H29V22h-4.2z"/>`,
    `</svg>`,
  ].join('')
}

function toDataUri(svg: string): string {
  // base64 matches other Vite DevTools plugins (e.g. rolldown) and avoids
  // percent-encoding quirks with `#` in colors inside some img parsers.
  // Prefer Buffer in Node; fall back to btoa in the browser.
  const base64 = typeof Buffer !== 'undefined' ? Buffer.from(svg).toString('base64') : btoa(svg)
  return `data:image/svg+xml;base64,${base64}`
}

export const COMARK_LIGHT_ICON = toDataUri(comarkSvg('#0a0a0a'))
export const COMARK_DARK_ICON = toDataUri(comarkSvg('#f5f5f5'))

export const DEVTOOLS_SHIKI_THEMES = ['github-light', 'github-dark'] as const

/** Languages loaded by the devtools Shiki highlighter */
export const DEVTOOLS_SHIKI_LANGS = [
  'bash',
  'cpp',
  'csharp',
  'css',
  'csv',
  'diff',
  'docker',
  'dockerfile',
  'git-commit',
  'git-rebase',
  'go',
  'graphql',
  'html',
  'http',
  'ini',
  'java',
  'javascript',
  'js',
  'json',
  'json5',
  'jsonc',
  'jsonl',
  'jsx',
  'log',
  'lua',
  'makefile',
  'markdown',
  'md',
  'mdc',
  'mdx',
  'mermaid',
  'nginx',
  'php',
  'postcss',
  'powershell',
  'proto',
  'python',
  'r',
  'ruby',
  'rust',
  'sass',
  'scss',
  'shell',
  'shellscript',
  'shellsession',
  'sql',
  'ssh-config',
  'svelte',
  'swift',
  'toml',
  'ts',
  'tsx',
  'typescript',
  'vue',
  'vue-html',
  'xml',
  'yaml',
] as const
