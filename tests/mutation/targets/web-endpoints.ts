export const mutations = [
  {
    id: 'web-tracks-fallback-old-target',
    file: 'src/modules/playlist_tracks.ts',
    find: "fallback: {\n    profile: 'web',\n    target: '/api/v1/playlist/manipulate/tracks',",
    replace:
      "fallback: {\n    profile: 'web',\n    target: '/api/playlist/manipulate/tracks',",
    expectedFailures: [
      'web tracks 512 fallback preserves sequential provider tokens',
    ],
  },
  {
    id: 'web-like-old-target',
    file: 'src/modules/like.ts',
    find: "  like: {\n    target: '/api/song/like',",
    replace: "  like: {\n    target: '/api/radio/like',",
    expectedFailures: [
      'web endpoint like/{"id":7} via client uses the modern target',
    ],
  },
  {
    id: 'web-reply-old-target',
    file: 'src/modules/comment.ts',
    find: "target: '/api/v1/resource/comments/reply',",
    replace: "target: '/api/resource/comments/reply',",
    expectedFailures: [
      'web endpoint comment/{"t":2,"type":0,"id":7,"commentId":8,"content":"reply"} via named uses the modern target',
    ],
  },
  {
    id: 'web-lyric-eapi-restored',
    file: 'src/modules/lyric.ts',
    find: "profile: 'web',",
    replace: "profile: 'eapi',",
    expectedFailures: [
      'web migrated lyric uses WEAPI without introducing an account request',
    ],
  },
  {
    id: 'web-banner-pc-branch-lost',
    file: 'src/modules/banner.ts',
    find: "(query.type ?? 0) === 0 ? 'readPc' : 'read'",
    replace: "(query.type ?? 0) === 1 ? 'readPc' : 'read'",
    expectedFailures: [
      'web banner type 0 preserves the business client selection',
    ],
  },
  {
    id: 'web-batch-string-child-restored',
    file: 'src/modules/playlist_update.ts',
    find: "'/api/playlist/desc/update': { id, desc },",
    replace: "'/api/playlist/desc/update': JSON.stringify({ id, desc }),",
    expectedFailures: [
      'web batch keeps object children and partial child failures in one request',
    ],
  },
  {
    id: 'protocol-boundary-download-url-web',
    file: 'src/modules/song_download_url_v1.ts',
    find: "  read: {\n    target: '/api/song/enhance/download/url/v1',\n    profile: 'eapi',",
    replace:
      "  read: {\n    target: '/api/song/enhance/download/url/v1',\n    profile: 'web',",
    expectedFailures: ['protocol boundary keeps songDownloadUrlV1 on eapi'],
  },
  {
    id: 'protocol-boundary-song-url-v1-read-web',
    file: 'src/modules/song_url_v1.ts',
    find: "  read: {\n    target: '/api/song/enhance/player/url/v1',\n    profile: 'eapi',",
    replace:
      "  read: {\n    target: '/api/song/enhance/player/url/v1',\n    profile: 'web',",
    expectedFailures: ['protocol boundary keeps songUrlV1 exhigh on eapi'],
  },
  {
    id: 'protocol-boundary-login-refresh-web',
    file: 'src/modules/login_refresh.ts',
    find: "  request: {\n    profile: 'eapi',\n    target: '/api/login/token/refresh',",
    replace:
      "  request: {\n    profile: 'web',\n    target: '/api/login/token/refresh',",
    expectedFailures: ['protocol boundary keeps loginRefresh on eapi'],
  },
];
