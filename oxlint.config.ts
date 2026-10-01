import { recommended, style } from '@effect/tsgo/oxlint-presets';
import { defineConfig } from 'oxlint';

export default defineConfig({
  ignorePatterns: ['src/demo/assets/**', 'src/sdk/generated/**', '*.cjs'],
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
  extends: [recommended, style],
  rules: {
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
    'import/no-unassigned-import': ['error', { allow: ['**/*.css'] }],
    'import/no-dynamic-require': 'error',
    'import/no-empty-named-blocks': 'error',
    'import/no-mutable-exports': 'error',
    'import/no-self-import': 'error',
    'import/no-webpack-loader-syntax': 'error',

    // TypeScript
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

    // EffectTS
    'effecttsgo/missing-pipeable-signature': 'off',
    'effecttsgo/strict-boolean-expressions': 'off',
    'effecttsgo/any-unknown-in-error-context': 'off',
    'typescript/no-unsafe-type-assertion': 'off',
    'no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
  },
  overrides: [
    {
      files: ['tests/**'],
      rules: {
        'no-await-in-loop': 'off',
        'typescript/no-non-null-assertion': 'off',
        'effecttsgo/global-error-in-effect-failure': 'off',
        'effecttsgo/global-error-in-effect-catch': 'off',
        'effecttsgo/abort-controller-in-effect': 'off',
      },
    },
    {
      files: ['scripts/**'],
      rules: {
        'no-await-in-loop': 'off',
        'no-console': 'off',
        'typescript/no-unsafe-type-assertion': 'off',
        'typescript/no-non-null-assertion': 'off',
      },
    },
    {
      files: ['src/app/**, tests/fixtures/*.mjs'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: [
        'src/server/docs-routes.ts',
        'src/server/parse-body.ts',
        'src/core/transport.ts',
      ],
      rules: {
        'no-await-in-loop': 'off',
      },
    },
  ],
  options: {
    typeAware: true,
  },
});
