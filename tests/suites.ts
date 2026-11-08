export type TestCategory =
  | 'unit'
  | 'behavior'
  | 'replay'
  | 'transport'
  | 'package'
  | 'live';
export interface TestEntry {
  readonly file: string;
  readonly category: TestCategory;
  readonly selections: ReadonlyArray<string>;
}

// Every physical test file has one category; selections may share that file.
export const testEntries: ReadonlyArray<TestEntry> = [
  {
    file: 'tests/replay/special/special-chains.test.ts',
    category: 'replay',
    selections: ['local', 'special-chains'],
  },
  {
    file: 'tests/behavior/modules/special/special-chains.test.ts',
    category: 'behavior',
    selections: ['local', 'special-chains', 'mutation:special-chains'],
  },
  {
    file: 'tests/behavior/modules/membership/membership-business.test.ts',
    category: 'behavior',
    selections: [
      'local',
      'membership-business',
      'mutation:membership-business',
    ],
  },
  {
    file: 'tests/behavior/modules/membership/membership-business-policy.test.ts',
    category: 'behavior',
    selections: [
      'local',
      'membership-business',
      'mutation:membership-business',
    ],
  },
  {
    file: 'tests/replay/membership/membership-business.test.ts',
    category: 'replay',
    selections: ['local', 'membership-business'],
  },
  {
    file: 'tests/behavior/modules/podcast/podcast-video.test.ts',
    category: 'behavior',
    selections: ['local', 'podcast-video', 'mutation:podcast-video'],
  },
  {
    file: 'tests/behavior/modules/podcast/podcast-video-policy.test.ts',
    category: 'behavior',
    selections: ['local', 'podcast-video', 'mutation:podcast-video'],
  },
  {
    file: 'tests/replay/podcast/podcast-video.test.ts',
    category: 'replay',
    selections: ['local', 'podcast-video'],
  },
  {
    file: 'tests/behavior/modules/account/account-session.test.ts',
    category: 'behavior',
    selections: ['local', 'account-social'],
  },
  {
    file: 'tests/replay/account/account-social.test.ts',
    category: 'replay',
    selections: ['local', 'account-social'],
  },
  {
    file: 'tests/behavior/modules/account/account-social-policy.test.ts',
    category: 'behavior',
    selections: [
      'local',
      'account-social-policy',
      'account-social',
      'mutation:account-social',
    ],
  },
  {
    file: 'tests/behavior/modules/account/account-social.test.ts',
    category: 'behavior',
    selections: ['local', 'account-social', 'mutation:account-social'],
  },
  {
    file: 'tests/replay/discovery/search-discovery.test.ts',
    category: 'replay',
    selections: ['local', 'search-discovery'],
  },
  {
    file: 'tests/behavior/modules/discovery/search-discovery-policy.test.ts',
    category: 'behavior',
    selections: ['local', 'search-discovery', 'mutation:search-discovery'],
  },
  {
    file: 'tests/behavior/modules/discovery/search-discovery.test.ts',
    category: 'behavior',
    selections: ['local', 'search-discovery', 'mutation:search-discovery'],
  },
  {
    file: 'tests/behavior/modules/library/library-playback-policy.test.ts',
    category: 'behavior',
    selections: ['local', 'library-playback', 'mutation:library-playback'],
  },
  {
    file: 'tests/behavior/modules/library/library-playback.test.ts',
    category: 'behavior',
    selections: ['local', 'library-playback', 'mutation:library-playback'],
  },
  {
    file: 'tests/replay/library/collection-actions.test.ts',
    category: 'replay',
    selections: ['local', 'collection-actions'],
  },
  {
    file: 'tests/behavior/modules/library/collection-actions.test.ts',
    category: 'behavior',
    selections: ['local', 'collection-actions', 'mutation:check-token'],
  },
  {
    file: 'tests/behavior/runtime/check-token.test.ts',
    category: 'behavior',
    selections: ['local', 'check-token', 'smoke', 'mutation:check-token'],
  },
  {
    file: 'tests/behavior/tooling/browser-types.test.ts',
    category: 'behavior',
    selections: ['local', 'browser-types', 'mutation:browser-types'],
  },
  {
    file: 'tests/behavior/browser/watchman.test.ts',
    category: 'behavior',
    selections: ['local', 'watchman', 'mutation:watchman'],
  },
  {
    file: 'tests/behavior/runtime/shared-read-actions.test.ts',
    category: 'behavior',
    selections: ['local', 'smoke', 'mutation:shared-reads'],
  },
  {
    file: 'tests/behavior/runtime/call-runtime.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/unit/crypto/crypto.test.ts',
    category: 'unit',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/runtime/effect-request.test.ts',
    category: 'behavior',
    selections: ['local', 'smoke'],
  },
  {
    file: 'tests/behavior/runtime/transport-errors.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/unit/request/endpoint-policy.test.ts',
    category: 'unit',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/runtime/error-contract.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/unit/request/rate-limit-classification.test.ts',
    category: 'unit',
    selections: ['local'],
  },
  {
    file: 'tests/unit/runtime/read-store-concurrency.test.ts',
    category: 'unit',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/runtime/request.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/modules/playback/scrobble-request.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/modules/playback/scrobble.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/unit/server/admission.test.ts',
    category: 'unit',
    selections: ['local'],
  },
  {
    file: 'tests/unit/utils/utils.test.ts',
    category: 'unit',
    selections: ['local'],
  },
  {
    file: 'tests/replay/account/account-check-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/library/album-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/architecture/boundaries.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/replay/library/artist-read-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/social/comment-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/social/comment-extension-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/commerce/digital-album-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/podcast/dj-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/podcast/dj-program-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/podcast/dj-subscription-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/modules/library/read-modules.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/replay/social/event-topic-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/discovery/home-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/modules/upload/image-direct-upload.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/replay/writes/irreversible-write-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/modules/request-shapes.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/replay/library/library-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/library/library-collection-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/activity/listen-broadcast-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/activity/listen-stats-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/activity/listen-together-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/account/login-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/playback/lyric-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/discovery/misc-read-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/sdk/module-api.test.ts',
    category: 'behavior',
    selections: ['local', 'sdk'],
  },
  {
    file: 'tests/behavior/sdk/module-decoders.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/architecture/module-discovery.test.ts',
    category: 'behavior',
    selections: ['local', 'sdk', 'mutation:special-chains'],
  },
  {
    file: 'tests/behavior/architecture/module-effects.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/modules/special-actions.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/sdk/module-input.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/http/module-loader.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/runtime/shared-reads.test.ts',
    category: 'behavior',
    selections: ['local', 'smoke', 'mutation:shared-reads'],
  },
  {
    file: 'tests/replay/social/msg-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/creators/musician-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/video/mv-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/compat/narrowed-legacy-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/unit/schema/nested-record-ids.test.ts',
    category: 'unit',
    selections: ['local'],
  },
  {
    file: 'tests/replay/playback/personal-fm-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/playback/playability-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/playback/playback-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/playlist/playlist-edit-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/playlist/playlist-list-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/playlist/playlist-read-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/modules/playlist/subscribe.test.ts',
    category: 'behavior',
    selections: ['local', 'mutation:playlist-subscribe'],
  },
  {
    file: 'tests/replay/playlist/playlist-summary-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/playlist/playlist-write-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/podcast/podcast-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/discovery/recommend-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/activity/record-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/writes/reversible-write-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/package/release.test.ts',
    category: 'package',
    selections: ['local', 'sdk'],
  },
  {
    file: 'tests/behavior/sdk/traffic.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/replay/search/search-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/search/search-optional-results.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/search/search-read-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/activity/sheet-annual-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/discovery/simi-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/playback/song-url-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/discovery/style-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/discovery/toplist-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/creators/ugc-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/unit/schema/upstream-shape-policy.test.ts',
    category: 'unit',
    selections: ['local'],
  },
  {
    file: 'tests/replay/account/user-account-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/social/user-social-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/video/video-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/commerce/vip-status-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/video/voice-mlog-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/replay/writes/write-actions-bodies.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/runtime/anonymous.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/modules/audio/audio-match.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/cli/cli.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/modules/upload/effect-upload-plugins.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/transport/proxy/node-proxy.test.ts',
    category: 'transport',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/tooling/record-fixtures.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/modules/playlist/related.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/tooling/schema-audit.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/sdk/config-forwarding.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/sdk/enhance.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/http/traffic.test.ts',
    category: 'behavior',
    selections: ['local', 'smoke'],
  },
  {
    file: 'tests/behavior/http/server.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/modules/upload/traffic.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/modules/upload/voice-upload.test.ts',
    category: 'behavior',
    selections: ['local', 'mutation:upload'],
  },

  {
    file: 'tests/unit/testing/load-acceptance.test.ts',
    category: 'unit',
    selections: ['local', 'smoke'],
  },
  {
    file: 'tests/transport/load/scenarios.test.ts',
    category: 'transport',
    selections: ['local', 'smoke'],
  },
  {
    file: 'tests/unit/testing/runner.test.ts',
    category: 'unit',
    selections: ['local'],
  },
  {
    file: 'tests/unit/testing/upstream.test.ts',
    category: 'unit',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/http/playlist-subscribe.test.ts',
    category: 'behavior',
    selections: ['local', 'mutation:playlist-subscribe'],
  },
  {
    file: 'tests/replay/playlist/subscribe.test.ts',
    category: 'replay',
    selections: ['local'],
  },
  {
    file: 'tests/transport/http/server-traffic.test.ts',
    category: 'transport',
    selections: ['local', 'smoke'],
  },
  {
    file: 'tests/behavior/http/upload.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
  {
    file: 'tests/transport/http/lifecycle.test.ts',
    category: 'transport',
    selections: ['local', 'smoke'],
  },
  {
    file: 'tests/unit/testing/mutation.test.ts',
    category: 'unit',
    selections: ['local'],
  },
  {
    file: 'tests/live/anonymous/search-to-detail.test.ts',
    category: 'live',
    selections: ['live:anonymous'],
  },
  {
    file: 'tests/live/anonymous/catalog.test.ts',
    category: 'live',
    selections: ['live:anonymous'],
  },
  {
    file: 'tests/live/authenticated/account.test.ts',
    category: 'live',
    selections: ['live:authenticated'],
  },
  {
    file: 'tests/live/writes/playlist-subscribe-cycle.test.ts',
    category: 'live',
    selections: ['live:writes'],
  },
  {
    file: 'tests/unit/testing/live-runner.test.ts',
    category: 'unit',
    selections: ['local'],
  },
  {
    file: 'tests/behavior/tooling/release-preflight.test.ts',
    category: 'behavior',
    selections: ['local'],
  },
];

export const typecheckFiles = [
  'tests/package/types/watchman-browser.typecheck.ts',
  'tests/package/types/module-api.typecheck.ts',
  'tests/package/types/playlist-summary.typecheck.ts',
  'tests/package/types/public-entry.typecheck.ts',
];
