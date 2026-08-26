import { readFile } from 'node:fs/promises'

const componentJavaScript = await readFile(new URL('../dist/components/markdown.component.js', import.meta.url), 'utf8')
const componentDeclarations = await readFile(
  new URL('../dist/components/markdown.component.d.ts', import.meta.url),
  'utf8'
)

if (!componentJavaScript.includes('ɵɵngDeclareFactory') || !componentJavaScript.includes('ɵɵngDeclareComponent')) {
  throw new Error('Angular partial-compilation metadata is missing from the JavaScript build output.')
}

if (!componentDeclarations.includes('ɵfac:') || !componentDeclarations.includes('ɵcmp:')) {
  throw new Error('Angular component metadata is missing from the declaration build output.')
}
