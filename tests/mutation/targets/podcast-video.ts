export const mutations = [
  {
    id: 'content-video-resource-id-lost',
    file: 'src/modules/video_detail_info.ts',
    find: 'String(query.vid)',
    replace: 'String(query.id)',
    expectedFailures: [
      'content client video_detail_info/vid-string owns its baseline wire contract',
    ],
  },
  {
    id: 'content-difm-list-retry-expanded',
    file: 'src/modules/dj_difm_subscribe_channels_get.ts',
    find: "retry: 'never',",
    replace: "retry: 'connect',",
    expectedFailures: [
      'content dj_difm_subscribe_channels_get preserves EAI_AGAIN retry eligibility',
    ],
  },
  {
    id: 'content-protocol-swapped',
    file: 'src/modules/voice_detail.ts',
    find: "profile: 'eapi',",
    replace: "profile: 'weapiPc',",
    expectedFailures: [
      'content client voice_detail/default owns its baseline wire contract',
    ],
  },
  {
    id: 'content-unsubscribe-target-lost',
    file: 'src/modules/dj_sub.ts',
    find: "Number(query.t) === 1 ? 'sub' : 'unsub'",
    replace: "Number(query.t) === 1 ? 'sub' : 'sub'",
    expectedFailures: [
      'content client dj_sub/default owns its baseline wire contract',
    ],
  },
  {
    id: 'content-broadcast-cancel-inverted',
    file: 'src/modules/broadcast_sub.ts',
    find: 'cancelCollect: query.t,',
    replace: "cancelCollect: query.t === 'false' ? 'true' : 'false',",
    expectedFailures: [
      'content client broadcast_sub/default owns its baseline wire contract',
    ],
  },
  {
    id: 'content-sorting-retried',
    file: 'src/modules/voicelist_trans.ts',
    find: "semantic: 'write',\n    cache: 'none',\n    retry: 'never',",
    replace: "semantic: 'read',\n    cache: 'none',\n    retry: 'connect',",
    expectedFailures: [
      'content voicelist_trans preserves EAI_AGAIN retry eligibility',
    ],
  },
  {
    id: 'content-timeline-retried',
    file: 'src/modules/video_timeline_all.ts',
    find: "retry: 'never',",
    replace: "retry: 'connect',",
    expectedFailures: [
      'content video_timeline_all preserves EAI_AGAIN retry eligibility',
    ],
  },
  {
    id: 'content-cache-granted',
    file: 'src/modules/dj_personalize_recommend.ts',
    find: "cache: 'none',",
    replace: "cache: 'shared',",
    expectedFailures: [
      'content dj_personalize_recommend never shares or caches successful calls',
    ],
  },
  {
    id: 'content-voice-free-filter-coerced',
    file: 'src/modules/voicelist_list_search.ts',
    find: 'voiceFeeType: query.voiceFeeType || null,',
    replace: 'voiceFeeType: query.voiceFeeType ?? null,',
    expectedFailures: [
      'content client voicelist_list_search/zero owns its baseline wire contract',
    ],
  },
  {
    id: 'content-hourly-offset-added',
    file: 'src/modules/dj_program_toplist_hours.ts',
    find: '// 不支持 offset',
    replace: 'offset: query.offset || 0,',
    expectedFailures: [
      'content client dj_program_toplist_hours/explicit owns its baseline wire contract',
    ],
  },
];
