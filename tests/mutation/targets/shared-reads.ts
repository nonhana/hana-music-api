export const mutations = [
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
