---
title: 'Syntax Highlighting in Vue Markdown with Shiki'
description: Highlight fenced code blocks in light and dark themes with Shiki in Vue and Vite.
navigation:
  title: 'Syntax highlighting'
  icon: i-lucide-code
---

::code-explorer
---
org: comarkdown
repo: comark@81a416b278b0f304d7e7577c7ac6bbfc78414790
path: examples/3.plugins/vue-vite-highlight
defaultValue: src/App.vue
---
::

This example highlights fenced code blocks in Vue and Vite with `@comark/vue/plugins/shiki`, direct theme and grammar imports, and a light/dark theme toggle.

## Features

- **Dual themes**: emits light and dark token colors via `--shiki-dark` CSS variables and toggles between them on `document.body`.
- **Direct theme and language imports**: loads individual modules from `@shikijs/themes` and `@shikijs/langs` so bundlers tree-shake unused grammars.
- **Line highlighting**: marks lines specified in fence attributes (such as `{2-3}`) with a `.highlight` class.
- **Optional `<pre>` styles**: sets inline background and foreground styles when `preStyles` is enabled.

## Usage

1. Install Shiki and its theme and language packages:

   ```bash
   npm install shiki @shikijs/themes @shikijs/langs
   ```

2. Import the `shiki` plugin along with the themes and languages you need:

   ```ts
   import shiki from '@comark/vue/plugins/shiki'
   import githubLight from '@shikijs/themes/github-light'
   import githubDark from '@shikijs/themes/github-dark'
   import javascript from '@shikijs/langs/javascript'
   import typescript from '@shikijs/langs/typescript'
   import python from '@shikijs/langs/python'
   ```

3. Pass the configured plugin to `<Markdown>`:

   ```vue
   <template>
     <Suspense>
       <Markdown
         :plugins="[
           shiki({
             themes: {
               light: githubLight,
               dark: githubDark,
             },
             languages: [javascript, typescript, python],
           }),
         ]"
       >
         {{ content }}
       </Markdown>
     </Suspense>
   </template>
   ```

4. Add fenced code blocks in Markdown:

   ````markdown
   ```javascript
   console.log('Hello, World!')
   ```

   ```typescript
   const greeting: string = 'Hello, TypeScript!'
   ```

   ```python
   print('Hello, Python!')
   ```
   ````

## Why import themes and languages directly

- **Smaller client bundle**: Vite bundles only the grammars and themes your app imports.
- **Build-time validation**: missing theme or language module names fail during compilation instead of at runtime.
- **TypeScript autocomplete**: imported modules carry Shiki's `ThemeRegistration` and `LanguageRegistration` types.

## Configuration options

```ts
import type { BundledLanguage, BundledTheme } from 'shiki'

interface ShikiOptions {
  // Themes imported from @shikijs/themes
  themes?: Record<string, BundledTheme>

  // Languages imported from @shikijs/langs
  languages?: BundledLanguage[]

  // Add inline background and foreground styles to <pre> elements
  preStyles?: boolean
}
```

## Learn more

- [Shiki plugin documentation](/plugins/built-in/shiki)
- [Shiki themes](https://shiki.style/themes)
- [Shiki languages](https://shiki.style/languages)
