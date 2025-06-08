/* eslint-env node */
module.exports = {
  root: true,
  extends: ['eslint:recommended'],
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'warn',
    'prefer-const': 'warn',
    'no-unused-vars': 'warn',
  },
  ignorePatterns: [
    'dist',
    'node_modules',
    '.turbo',
    'coverage',
    '*.config.js',
    '*.config.ts',
    'storybook-static',
  ],
};
