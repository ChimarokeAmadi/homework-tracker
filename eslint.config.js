// ESLint checks the code for mistakes and keeps the style the same everywhere.
import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: { ecmaVersion: 2024, sourceType: 'module', globals: globals.node },
    rules: {
      // Errors that cause real bugs
      eqeqeq: 'error', // === instead of == ("1" == 1 is true!)
      'no-unused-vars': 'error',
      // Modern, consistent style
      'no-var': 'error', // let/const instead of var
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      curly: ['error', 'multi-line'],
      'prefer-template': 'error', // `Hello ${name}` instead of 'Hello ' + name
    },
  },
];
