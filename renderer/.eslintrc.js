/* eslint-disable @typescript-eslint/naming-convention */
// eslint-disable-next-line no-undef
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'prettier'],
  root: true,
  rules: {
    'prettier/prettier': [
      'error',
      {
        semi: true,
        trailingComma: 'none',
        singleQuote: true,
        printWidth: 80,
        tabWidth: 2,
        bracketSpacing: true
      }
    ],
    '@typescript-eslint/explicit-member-accessibility': 'error',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        format: ['camelCase'],
        leadingUnderscore: 'forbid',
        selector: 'default'
      },
      {
        format: ['camelCase', 'UPPER_CASE'],
        leadingUnderscore: 'forbid',
        selector: 'variable'
      },
      {
        format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        leadingUnderscore: 'forbid',
        selector: 'variable',
        modifiers: ['const']
      },
      {
        format: ['PascalCase'],
        leadingUnderscore: 'forbid',
        selector: 'typeLike'
      },
      {
        format: ['PascalCase'],
        leadingUnderscore: 'forbid',
        selector: 'enumMember'
      },
      {
        format: null,
        leadingUnderscore: 'forbid',
        modifiers: [
          'protected',
          'public',
          'static',
          'readonly',
          'abstract',
          'private'
        ],
        selector: 'memberLike'
      }
    ],
    '@typescript-eslint/prefer-function-type': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    quotes: ['error', 'single'],
    'react/display-name': 'off',
    'react/prop-types': 'off'
  },
  settings: {
    react: {
      version: 'detect' // Tells eslint-plugin-react to automatically detect the version of React to use
    }
  }
};
