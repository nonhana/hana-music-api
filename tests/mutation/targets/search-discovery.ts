export const mutations = [
  {
    id: 'discovery-protocol-swapped',
    file: 'src/modules/cloudsearch.ts',
    find: "profile: 'eapi',",
    replace: "profile: 'weapiPc',",
    expectedFailures: [
      'discovery client cloudsearch/default owns its baseline wire contract',
    ],
  },
  {
    id: 'discovery-mobile-target-lost',
    file: 'src/modules/search_suggest.ts',
    find: "query.type === 'mobile' ? 'mobile' : 'web'",
    replace: "query.type === 'mobile' ? 'web' : 'web'",
    expectedFailures: [
      'discovery client search_suggest/mobile owns its baseline wire contract',
    ],
  },
  {
    id: 'discovery-fm-submode-lost',
    file: 'src/modules/personal_fm_mode.ts',
    find: 'subMode: query.submode,',
    replace: 'subMode: query.mode,',
    expectedFailures: [
      'discovery client personal_fm_mode/SCENE_RCMD-FOCUS owns its baseline wire contract',
    ],
  },
  {
    id: 'discovery-zero-latitude-lost',
    file: 'src/modules/aidj_content_rcmd.ts',
    find: 'query.latitude !== undefined',
    replace: 'query.latitude',
    expectedFailures: [
      'discovery client aidj_content_rcmd/zero-latitude owns its baseline wire contract',
    ],
  },
  {
    id: 'discovery-write-retried',
    file: 'src/modules/fm_trash.ts',
    find: "semantic: 'write',\n    cache: 'none',\n    retry: 'never',",
    replace: "semantic: 'read',\n    cache: 'none',\n    retry: 'connect',",
    expectedFailures: [
      'discovery fm_trash preserves EAI_AGAIN retry eligibility',
    ],
  },
  {
    id: 'discovery-stateful-feed-retried',
    file: 'src/modules/personal_fm_mode.ts',
    find: "retry: 'never',",
    replace: "retry: 'connect',",
    expectedFailures: [
      'discovery personal_fm_mode preserves EAI_AGAIN retry eligibility',
    ],
  },
  {
    id: 'discovery-extra-cache-granted',
    file: 'src/modules/cloudsearch.ts',
    find: "cache: 'none',",
    replace: "cache: 'shared',",
    expectedFailures: [
      'discovery cloudsearch never shares or caches successful calls',
    ],
  },
  {
    id: 'discovery-refresh-coerced',
    file: 'src/modules/homepage_block_page.ts',
    find: 'refresh: query.refresh || false',
    replace: 'refresh: Boolean(query.refresh)',
    expectedFailures: [
      'discovery client homepage_block_page/refresh-string owns its baseline wire contract',
    ],
  },
];
