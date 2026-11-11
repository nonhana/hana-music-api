export const mutations = [
  {
    id: 'token-header-normalization-unchecked',
    file: 'src/core/request.ts',
    find: '!== value',
    replace: '=== null',
    expectedFailures: [
      'a string token must have an unchanged valid HTTP header value: " padded-token"',
    ],
  },
  {
    id: 'plain-api-token-dropped',
    file: 'src/core/request.ts',
    find: 'configured !== undefined && tokenTarget',
    replace:
      "configured !== undefined && tokenTarget && request.protocol !== 'plain'",
    expectedFailures: [
      'approved plain audioMatch requests forward an explicit token only in the header',
    ],
  },
  {
    id: 'token-target-guard-omitted',
    file: 'src/core/request.ts',
    find: 'checkToken !== undefined && !credentialsAllowed',
    replace: 'false && !credentialsAllowed',
    expectedFailures: [
      'a configured token cannot leave through https://external.example even without account cookies',
    ],
  },
  {
    id: 'explicit-read-token-dropped',
    file: 'src/core/request.ts',
    find: 'configured !== undefined && tokenTarget',
    replace:
      "configured !== undefined && tokenTarget && request.policy.semantic !== 'read'",
    expectedFailures: [
      'explicit tokens on reads bypass existing cache and never merge concurrent calls',
    ],
  },
  {
    id: 'token-body-header-disagree',
    file: 'src/core/request-plan.ts',
    find: 'payload.checkToken = checkToken;',
    replace: "payload.checkToken = 'mutated-token';",
    expectedFailures: [
      'optional checkToken uses the final eapi protocol envelope',
    ],
  },
  {
    id: 'album-sub-target-swapped',
    file: 'src/modules/album_sub.ts',
    find: "target: '/api/album/sub',",
    replace: "target: '/api/album/unsub',",
    expectedFailures: [
      'collection album/sub sends its declared web contract with none',
    ],
  },
  {
    id: 'collection-pc-cookie-contamination',
    file: 'src/core/config.ts',
    find: "cookie: { os: 'web' },",
    replace: "cookie: { os: 'pc' },",
    expectedFailures: [
      'collection artist/sub sends its declared web contract with none',
    ],
  },
  {
    id: 'token-provider-late-send',
    file: 'src/core/call.ts',
    find: '    signal,\n    () =>',
    replace: '    signal && undefined,\n    () =>',
    expectedFailures: [
      'provider cancellation ignores a late value before any API send',
    ],
  },
  {
    id: 'token-read-cache-reused',
    file: 'src/core/call.ts',
    find: 'effective.checkToken === undefined &&',
    replace: 'true &&',
    expectedFailures: [
      'explicit tokens on reads bypass existing cache and never merge concurrent calls',
    ],
  },
  {
    id: 'token-string-replayed-in-module',
    file: 'src/core/request.ts',
    find: 'if (used > 0)',
    replace: 'if (used > 1)',
    expectedFailures: [
      'multi-request modules use a string token without replaying a resolved value',
    ],
  },
  {
    id: 'token-read-retried',
    file: 'src/core/request.ts',
    find: "checkToken === undefined &&\n            request.policy.semantic === 'read'",
    replace: "request.policy.semantic === 'read'",
    expectedFailures: [
      'a token-bearing read never automatically retries a failed send',
    ],
  },
];
