export const mutations = [
  {
    id: 'shared-action-key-omitted',
    file: 'src/core/call.ts',
    find: 'actions: call.actions,\n          input: call.input,\n          config: keyConfig,',
    replace:
      'actions: undefined,\n          input: call.input,\n          config: keyConfig,',
    expectedFailures: [
      'effective action profiles and targets isolate the same account in one ReadStore',
    ],
  },
  {
    id: 'shared-read-cache-granted-by-semantic',
    file: 'src/core/call.ts',
    find: "action.cache === 'shared',",
    replace: "action.semantic === 'read',",
    expectedFailures: [
      'read semantic alone grants neither shared cache nor wider retries',
    ],
  },
  {
    id: 'shared-search-retries-disabled',
    file: 'src/modules/search.ts',
    find: "target: '/api/search/get',\n    profile: 'eapi',\n    semantic: 'read',\n    cache: 'shared',\n    retry: 'read',",
    replace:
      "target: '/api/search/get',\n    profile: 'eapi',\n    semantic: 'read',\n    cache: 'shared',\n    retry: 'never',",
    expectedFailures: [
      'declared reads retain EAI_AGAIN retry boundary with 3 attempts',
    ],
  },
  {
    id: 'shared-last-waiter-not-aborted',
    file: 'src/core/read-store.ts',
    find: 'yield* Fiber.interrupt(joined.fiber);',
    replace: 'yield* Effect.void;',
    expectedFailures: [
      'controlled shared waiters keep independent deadlines and cancel the last upstream',
    ],
  },
];
