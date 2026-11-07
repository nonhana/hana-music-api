export const mutations = [
  {
    id: 'library-weapi-pc-cookie-lost',
    file: 'src/core/request-profiles.ts',
    find: "weapiPc: {\n    protocol: 'weapi',\n    domain: 'https://music.163.com',\n    userAgent: USER_AGENT_MAP.weapi.pc,\n    cookie: OS_PROFILES.pc,",
    replace:
      "weapiPc: {\n    protocol: 'weapi',\n    domain: 'https://music.163.com',\n    userAgent: USER_AGENT_MAP.weapi.pc,\n    cookie: { os: 'web' },",
    expectedFailures: [
      'library client album/default owns its baseline wire contract',
    ],
  },
  {
    id: 'library-playback-protocol-swapped',
    file: 'src/modules/song_url.ts',
    find: "profile: 'eapi',",
    replace: "profile: 'weapiPc',",
    expectedFailures: [
      'library client song_url/default owns its baseline wire contract',
    ],
  },
  {
    id: 'library-dynamic-boundary-widened',
    file: 'src/modules/album.ts',
    find: "target: { prefix: '/api/v1/album/' },",
    replace: "target: { prefix: '/api/' },",
    expectedFailures: [
      'library album rejects a normalized dynamic path escape before sending',
    ],
  },
  {
    id: 'library-sky-encoding-lost',
    file: 'src/modules/song_url_v1.ts',
    find: "if (data.level === 'sky')",
    replace: "if (data.level === 'lossless')",
    expectedFailures: [
      'library client song_url_v1/sky owns its baseline wire contract',
    ],
  },
  {
    id: 'library-import-link-precedence-lost',
    file: 'src/modules/playlist_import_name_task_create.ts',
    find: 'if (query.link)',
    replace: 'if (query.link && !query.text)',
    expectedFailures: [
      'library client playlist_import_name_task_create/link owns its baseline wire contract',
    ],
  },
  {
    id: 'library-write-retry-granted',
    file: 'src/modules/like.ts',
    find: "  like: {\n    target: '/api/radio/like',\n    profile: 'weapiPc',\n    semantic: 'write',\n    cache: 'none',\n    retry: 'never',",
    replace:
      "  like: {\n    target: '/api/radio/like',\n    profile: 'weapiPc',\n    semantic: 'read',\n    cache: 'none',\n    retry: 'connect',",
    expectedFailures: ['library like preserves EAI_AGAIN retry eligibility'],
  },
  {
    id: 'library-conservative-read-retried',
    file: 'src/modules/user_cloud.ts',
    find: "retry: 'never',",
    replace: "retry: 'connect',",
    expectedFailures: [
      'library user_cloud preserves EAI_AGAIN retry eligibility',
    ],
  },
  {
    id: 'library-extra-read-cache-granted',
    file: 'src/modules/album.ts',
    find: "cache: 'none',",
    replace: "cache: 'shared',",
    expectedFailures: ['library album never shares or caches successful calls'],
  },
];
