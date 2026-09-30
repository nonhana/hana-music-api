import { recommended, style } from '@effect/tsgo/oxlint-presets';
import { defineConfig } from 'oxlint';

export default defineConfig({
  ignorePatterns: ['src/demo/assets/**'],
  plugins: ['import', 'node', 'typescript', 'unicorn'],
  env: {
    builtin: true,
    node: true,
    es2026: true,
  },
  categories: {
    correctness: 'error',
    suspicious: 'error',
    perf: 'error',
    pedantic: 'off',
    style: 'off',
    nursery: 'off',
  },
  rules: {
    curly: 'error',
    eqeqeq: 'error',
    'no-console': 'error',
    'no-underscore-dangle': 'off',
    'no-var': 'error',
    'prefer-const': 'error',
    'object-shorthand': 'error',
    'prefer-object-spread': 'error',
    'require-yield': 'off',
    // Oxfmt owns declaration ordering; Oxlint sorts named members only.
    'sort-imports': [
      'error',
      {
        allowSeparatedGroups: true,
        ignoreCase: true,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
      },
    ],
    'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-absolute-path': 'error',
    'import/no-amd': 'error',
    'import/no-commonjs': 'error',
    'import/no-cycle': [
      'error',
      {
        ignoreExternal: true,
        ignoreTypes: true,
      },
    ],
    'import/no-duplicates': ['error', { preferInline: false }],
    'import/no-dynamic-require': 'error',
    'import/no-empty-named-blocks': 'error',
    'import/no-mutable-exports': 'error',
    'import/no-self-import': 'error',
    'import/no-webpack-loader-syntax': 'error',
    'typescript/array-type': [
      'error',
      {
        default: 'generic',
        readonly: 'generic',
      },
    ],
    'typescript/ban-ts-comment': ['error', { minimumDescriptionLength: 10 }],
    'typescript/consistent-type-exports': 'error',
    'typescript/consistent-type-imports': [
      'error',
      {
        fixStyle: 'inline-type-imports',
        prefer: 'type-imports',
      },
    ],
    'typescript/no-deprecated': 'warn',
    'typescript/no-explicit-any': 'warn',
    'typescript/no-import-type-side-effects': 'error',
    'typescript/no-misused-promises': 'error',
    'typescript/no-non-null-assertion': 'warn',
    'typescript/no-unnecessary-type-assertion': 'error',
    'typescript/no-unnecessary-type-constraint': 'error',
    'typescript/only-throw-error': 'error',
    'typescript/switch-exhaustiveness-check': 'error',
    'unicorn/no-abusive-eslint-disable': 'error',
    'unicorn/no-accessor-recursion': 'error',
    'unicorn/prefer-array-flat-map': 'error',
    'unicorn/prefer-module': 'error',
    'unicorn/prefer-node-protocol': 'error',
    'unicorn/prefer-top-level-await': 'error',
    'no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
  },
  options: {
    typeAware: true,
  },
  extends: [recommended, style],
});
