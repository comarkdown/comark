import antfu from '@antfu/eslint-config'

export default antfu(
  {
    ignores: [
      // Ignore markdown content files (they contain code examples that trigger false positives)
      'docs/content/**/*.md',
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
  // Playground overrides
  {
    files: ['playground/**/*.vue', 'playground/**/*.ts', 'playground/**/*.js'],
    rules: {
      // Allow multiple components per file in playground
      'vue/one-component-per-file': 'off',
      // Allow console in playground
      'no-console': 'off',
      // Allow unused vars with _ prefix
      'unused-imports/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Allow reserved component names in playground
      'vue/no-reserved-component-names': 'off',
    },
  },
  // Documentation markdown files overrides
  {
    files: ['docs/**/*.md'],
    rules: {
      // Allow duplicate imports in markdown code examples
      'import/no-duplicates': 'off',
      // Allow non-camelCase prop names in documentation examples
      'vue/prop-name-casing': 'off',
    },
  },
)
