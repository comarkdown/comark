// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'
import svelte from 'eslint-plugin-svelte'
import svelteConfig from './packages/comark-svelte/svelte.config.js'

// Run `npx @eslint/config-inspector` to inspect the resolved config interactively
export default createConfigForNuxt({
  features: {
    // Rules for module authors
    tooling: true,
    // Rules for formatting
    stylistic: true,
  },
})
  .append(
    ...svelte.configs.recommended,
  )
  .append(
    {
      files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
      languageOptions: {
        parserOptions: {
          svelteConfig,
        },
      },
    },
  )
  .append(
    {
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'vue/multi-word-component-names': 'off',
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/unified-signatures': 'off',
        '@typescript-eslint/triple-slash-reference': 'off',
      },
    },
  )
