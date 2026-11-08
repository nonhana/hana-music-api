export const mutations = [
  {
    id: 'membership-protocol-swapped',
    file: 'src/modules/listen_data_total.ts',
    find: "profile: 'eapi',",
    replace: "profile: 'weapiPc',",
    expectedFailures: [
      'membership client listen_data_total/default owns its baseline wire contract',
    ],
  },
  {
    id: 'membership-order-resource-id-lost',
    file: 'src/modules/digitalAlbum_ordering.ts',
    find: 'resourceID: query.id,',
    replace: 'resourceID: query.quantity,',
    expectedFailures: [
      'membership client digitalAlbum_ordering/default owns its baseline wire contract',
    ],
  },
  {
    id: 'membership-order-retried',
    file: 'src/modules/digitalAlbum_ordering.ts',
    find: "semantic: 'write',\n    cache: 'none',\n    retry: 'never',",
    replace: "semantic: 'read',\n    cache: 'none',\n    retry: 'connect',",
    expectedFailures: [
      'membership digitalAlbum_ordering preserves EAI_AGAIN retry eligibility',
    ],
  },
  {
    id: 'membership-batch-retried',
    file: 'src/modules/batch.ts',
    find: "semantic: 'write',\n    cache: 'none',\n    retry: 'never',",
    replace: "semantic: 'read',\n    cache: 'none',\n    retry: 'connect',",
    expectedFailures: [
      'membership batch preserves EAI_AGAIN retry eligibility',
    ],
  },
  {
    id: 'membership-reward-retried',
    file: 'src/modules/vip_growthpoint_get.ts',
    find: "semantic: 'write',\n    cache: 'none',\n    retry: 'never',",
    replace: "semantic: 'read',\n    cache: 'none',\n    retry: 'connect',",
    expectedFailures: [
      'membership vip_growthpoint_get preserves EAI_AGAIN retry eligibility',
    ],
  },
  {
    id: 'membership-report-retry-expanded',
    file: 'src/modules/listen_data_report.ts',
    find: "retry: 'never',",
    replace: "retry: 'connect',",
    expectedFailures: [
      'membership listen_data_report preserves EAI_AGAIN retry eligibility',
    ],
  },
  {
    id: 'membership-income-retry-expanded',
    file: 'src/modules/yunbei_receipt.ts',
    find: "retry: 'never',",
    replace: "retry: 'connect',",
    expectedFailures: [
      'membership yunbei_receipt preserves EAI_AGAIN retry eligibility',
    ],
  },
  {
    id: 'membership-cache-granted',
    file: 'src/modules/vip_info.ts',
    find: "cache: 'none',",
    replace: "cache: 'shared',",
    expectedFailures: [
      'membership vip_info never shares or caches successful calls',
    ],
  },
  {
    id: 'membership-timemachine-range-default-lost',
    file: 'src/modules/vip_timemachine.ts',
    find: 'data.limit = query.limit || 60;',
    replace: 'data.limit = query.limit || 30;',
    expectedFailures: [
      'membership client vip_timemachine/range-default-limit owns its baseline wire contract',
    ],
  },
  {
    id: 'membership-history-cursor-lost',
    file: 'src/modules/yunbei_rcmd_song_history.ts',
    find: "cursor: query.cursor || '',",
    replace: "cursor: '',",
    expectedFailures: [
      'membership client yunbei_rcmd_song_history/explicit owns its baseline wire contract',
    ],
  },
  {
    id: 'membership-annual-old-year-target-lost',
    file: 'src/modules/summary_annual.ts',
    find: "? 'userdata'",
    replace: "? 'data'",
    expectedFailures: [
      'membership client summary_annual/year-int-2017 owns its baseline wire contract',
    ],
  },
];
