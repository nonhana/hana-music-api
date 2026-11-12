export const mutations = [
  {
    id: 'failure-guard-cookie-type-unchecked',
    file: 'src/core/response.ts',
    find: "cookie.every((item) => typeof item === 'string') &&",
    replace: 'true &&',
    expectedFailures: [
      'rejects values that are not a finite response envelope',
    ],
  },
  {
    id: 'legacy-envelope-guessed-as-transport',
    file: 'src/core/response.ts',
    find: "?? { kind: 'unknown' }",
    replace: "?? { kind: 'transport' }",
    expectedFailures: [
      'labels legacy response envelopes as unknown and keeps their fields',
    ],
  },
  {
    id: 'business-protocol-rejection-marked-transport',
    file: 'src/core/response.ts',
    find: "error.reason === 'business'",
    replace: 'error.response.status === 502',
    expectedFailures: [
      'named, client, invokeModule and createRequest share business metadata',
      'business 405 and confirmed rate limiting stay distinguishable',
    ],
  },
  {
    id: 'legacy-reader-invents-unknown',
    file: 'src/core/response.ts',
    find: 'return isFailureInfo(failure) ? failure : undefined;',
    replace: "return isFailureInfo(failure) ? failure : { kind: 'unknown' };",
    expectedFailures: [
      'returns undefined for ordinary errors, successes and legacy envelopes',
    ],
  },
  {
    id: 'business-metadata-drops-known-code',
    file: 'src/core/response.ts',
    find: '      ? knownCode',
    replace: '      ? null',
    expectedFailures: [
      'business 502 and transport 502 stay distinguishable',
      'classifies business rejections with public code and message',
    ],
  },
];
