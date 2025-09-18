/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */

module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:prettier/recommended',
    'prettier',
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:import/typescript'
  ],
  plugins: ['@typescript-eslint', 'import'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: 'tsconfig.json',
  },
  env: {
    es6: true,
    node: true,
  },
  rules: {
    'no-var': 'error',
    semi: 'error',
    // indent: ['error', 2, { SwitchCase: 1 }],
    indent: "off",
    'no-multi-spaces': 'error',
    'space-in-parens': 'error',
    'no-multiple-empty-lines': 'error',
    'prefer-const': 'error',
    'import/order': [
      'error',
      {
        'groups': [
          ['builtin', 'external'],
          'internal',
          ['parent', 'sibling', 'index']
        ],
        'pathGroups': [
          {
            'pattern': 'express',
            'group': 'builtin',
            'position': 'before'
          }
        ],
        // 'newlines-between': 'always',
        'alphabetize': { 'order': 'asc', 'caseInsensitive': true }
      }
    ]
  },
};
