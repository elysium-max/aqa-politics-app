module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'prettier'
  ],
  rules: {
    // TypeScript-specific rules
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],

    // Best practices
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'eqeqeq': 'error',
    'complexity': ['warn', 15],  // Slightly increased complexity limit
    'max-depth': ['warn', 5],

    // Code style
    'indent': ['error', 2, { 'SwitchCase': 1 }],
    'semi': ['error', 'always'],
    'quotes': ['error', 'single', { 'avoidEscape': true }],
    
    // Jest-specific rules
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error'
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  env: {
    node: true,
    es2021: true,
    'jest/globals': true
  },
  settings: {
    jest: {
      version: 'detect'
    }
  }
};