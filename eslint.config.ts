import antfu from '@antfu/eslint-config'

export default antfu(
  {
    typescript: true,
    vue: true,
    ignores: [
      // Ignore markdown files (they contain code examples that trigger false positives)
      '**/*.md',
      // Ignore app config files (Nuxt/Docus specific)
      '**/app.config.ts',
      // Ignore Nuxt config files
      '**/nuxt.config.ts',
      // Ignore docs and playground directories (they have their own linting)
      'docs/**',
      'playground/**',
    ],
  },
  // Benchmark test - allow console.log for performance measurements
  {
    files: ['tests/benchmark.test.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  // Test files overrides
  {
    files: ['tests/**/*.ts', 'tests/**/*.js'],
    rules: {
      // Allow identical test titles (useful for testing same functionality with different implementations)
      'test/no-identical-title': 'off',
      // Allow unused variables with _ prefix in tests
      'unused-imports/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Allow global in benchmark tests
      'no-restricted-globals': 'off',
      // Allow isFinite/isNaN in benchmark tests for performance comparison
      'unicorn/prefer-number-properties': 'off',
    },
  },
)
