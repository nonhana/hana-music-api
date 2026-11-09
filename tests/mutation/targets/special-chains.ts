export const mutations = [
  {
    id: 'special-clientlog-domain-lost',
    file: 'src/modules/scrobble.ts',
    find: "start: {\n    profile: 'clientlogOsx',",
    replace: "start: {\n    profile: 'eapi',",
    expectedFailures: [
      'special client scrobble/default preserves full baseline orchestration',
    ],
  },
  {
    id: 'special-cloud-dependent-id-lost',
    file: 'src/modules/cloud_import.ts',
    find: 'songId: first.songId,',
    replace: 'songId: query.id,',
    expectedFailures: [
      'special client cloud_import/explicit preserves full baseline orchestration',
    ],
  },
  {
    id: 'special-tracks-wrong-fallback-code',
    file: 'src/modules/playlist_tracks.ts',
    find: 'if (error.code !== 512)',
    replace: 'if (error.code !== 403)',
    expectedFailures: [
      'special tracks business 512 sends exactly one fallback ending 200',
    ],
  },
  {
    id: 'special-import-read-retry-expanded',
    file: 'src/modules/cloud_import.ts',
    find: "semantic: 'read',\n    cache: 'none',\n    retry: 'never',",
    replace: "semantic: 'read',\n    cache: 'none',\n    retry: 'connect',",
    expectedFailures: [
      'special cloud_import/default stage 0 preserves EAI_AGAIN retry limit',
    ],
  },
  {
    id: 'special-plain-upload-method-lost',
    file: 'src/core/call.ts',
    find: "method: action.method ?? 'POST',",
    replace: "method: 'GET' as const,",
    expectedFailures: [
      'special client voice_upload/default preserves full baseline orchestration',
    ],
  },
  {
    id: 'special-plain-mode-lost',
    file: 'src/core/call.ts',
    find: "response: action.response ?? 'json',",
    replace: "response: 'bytes' as const,",
    expectedFailures: [
      'special client audio_match/fingerprint-0 preserves full baseline orchestration',
    ],
  },
  {
    id: 'special-plain-origin-check-lost',
    file: 'src/core/request-actions.ts',
    find: 'resolved.origin === origin.origin ||',
    replace:
      "resolved.origin === origin.origin || resolved.hostname.endsWith('music.163.com') ||",
    expectedFailures: [
      'special plain declaration rejects {"target":"https://music.163.com/api/music/audio/match"} before provider or network',
    ],
  },
  {
    id: 'special-external-token-leaked',
    file: 'src/core/endpoint-policy.ts',
    find: 'return secure && (apiHost || scrobbleHost);',
    replace: 'return secure;',
    expectedFailures: [
      'special avatar_upload/default takes tokens per approved request only',
    ],
  },
  {
    id: 'special-image-bytes-lost',
    file: 'src/plugins/upload.ts',
    find: ': input.imgFile.data,',
    replace: ': new Uint8Array(),',
    expectedFailures: [
      'special client avatar_upload/default preserves full baseline orchestration',
    ],
  },
  {
    id: 'special-local-actions-removed',
    file: 'src/modules/inner_version.ts',
    find: 'export const moduleActions = {} as const satisfies ModuleActions;',
    replace:
      "export const moduleActions = { upstream: { profile: 'eapi', target: '/api/example', semantic: 'read', cache: 'none', retry: 'never' } } as const satisfies ModuleActions;",
    expectedFailures: ['special local modules declare an empty action set'],
  },
  {
    id: 'special-audio-dynamic-retry-expanded',
    file: 'src/modules/audio_match.ts',
    find: "retry: 'never',",
    replace: "retry: 'connect',",
    expectedFailures: [
      'special audio_match preserves the old dynamic URL no-retry upper limit',
    ],
  },
  {
    id: 'special-related-dynamic-retry-expanded',
    file: 'src/modules/related_playlist.ts',
    find: "retry: 'never',",
    replace: "retry: 'connect',",
    expectedFailures: [
      'special related_playlist preserves the old dynamic URL no-retry upper limit',
    ],
  },
  {
    id: 'special-image-response-mode-lost',
    file: 'src/plugins/upload.ts',
    find: "response: 'bytes',",
    replace: "response: 'json',",
    expectedFailures: [
      'special avatar_upload accepts opaque NOS bytes before submitting',
    ],
  },
  {
    id: 'special-song-response-mode-lost',
    file: 'src/plugins/song-upload.ts',
    find: "response: 'bytes',",
    replace: "response: 'json',",
    expectedFailures: [
      'special cloud accepts opaque NOS bytes before submitting',
    ],
  },
];
