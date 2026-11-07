export const mutations = [
  {
    id: 'playlist-wrong-address',
    file: 'src/modules/playlist_subscribe.ts',
    find: "target: '/api/playlist/subscribe',",
    replace: "target: '/api/playlist/unsubscribe',",
    expectedFailures: [
      'playlistSubscribe sends a complete web identity and the same token in its encrypted body and HTTP header',
    ],
  },
  {
    id: 'playlist-missing-body-token',
    file: 'src/core/request-plan.ts',
    find: 'payload.checkToken = checkToken;',
    replace: 'void checkToken;',
    expectedFailures: [
      'playlistSubscribe sends a complete web identity and the same token in its encrypted body and HTTP header',
    ],
  },
  {
    id: 'playlist-os-contamination',
    file: 'src/core/request-profiles.ts',
    find: "cookie: { os: 'web' },",
    replace: "cookie: { os: 'pc' },",
    expectedFailures: [
      'playlistSubscribe sends a complete web identity and the same token in its encrypted body and HTTP header',
    ],
  },
];
