/** Inline Lucide SVG icons (MIT licensed) — used in the devtools renderer */
export const LUCIDE_MOON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>'
export const LUCIDE_SUN =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>'
export const LUCIDE_MONITOR =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>'

/** Comark logo SVG icons for the Vite DevTools dock */
const COMARK_SVG = (color: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212 212"><path stroke="${color}" stroke-width="8" fill="none" d="M200.4 52.5v110H10.4v-110h190z"/><path fill="${color}" d="M129.4 94.8V75.5h19.9v19.3h-19.9zm0 44.7v-19.2h19.9v19.2h-19.9zm30.1-44.7V75.5h19.9v19.3h-19.9zm0 44.7v-19.2h19.9v19.2h-19.9zM31.4 141.5v-68h20l20 25 20-25h20v68h-20V102.5l-20 25-20-25v39z"/></svg>`
export const COMARK_LIGHT_ICON = `data:image/svg+xml,${encodeURIComponent(COMARK_SVG('#000'))}`
export const COMARK_DARK_ICON = `data:image/svg+xml,${encodeURIComponent(COMARK_SVG('#fff'))}`
