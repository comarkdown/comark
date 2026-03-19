// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'
import svelte from 'eslint-plugin-svelte'
import stylistic from '@stylistic/eslint-plugin'
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
      // Apply stylistic rules to Svelte files (nuxt config only targets js/ts/vue)
      files: ['**/*.svelte'],
      plugins: {
        '@stylistic': stylistic,
      },
      rules: {
        ...stylistic.configs.recommended.rules,
        '@stylistic/brace-style': ['error', 'stroustrup', { allowSingleLine: true }],
        '@stylistic/comma-dangle': ['error', 'always-multiline'],
        '@stylistic/indent': ['error', 2],
        '@stylistic/quotes': ['error', 'single'],
        '@stylistic/semi': ['error', 'never'],
      },
    },
  )
  .append(
    {
      rules: {
        'vue/no-v-html': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'vue/multi-word-component-names': 'off',
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/unified-signatures': 'off',
        '@typescript-eslint/triple-slash-reference': 'off',
      },
    },
  )
