module.exports = {
  env: {
    node: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    'prettier'
  ],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': 'off', // Allow console.log for bot logging
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    '*.min.js',
    'db/*.db'
  ]
};
