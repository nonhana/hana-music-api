import { expect, test } from 'bun:test';

import { isReadModule, retryDecision } from '../../src/core/endpoint-policy.ts';
import { createRequest } from '../../src/core/request.ts';

const writeUris = [
  '/api/playlist/track/add',
  '/api/playlist/manipulate/tracks',
  '/api/playlist/create',
  '/api/playlist/remove',
  '/api/playlist/unsubscribe',
  '/api/resource/comments/add',
  '/api/resource/comments/reply',
  '/api/v1/comment/unlike',
  '/api/resource/unlike',
  '/api/user/follow/123',
  '/api/user/delfollow/123',
  '/api/artist/sub',
  '/api/artist/unsub',
  '/api/album/sub',
  '/api/album/unsub',
  '/api/mv/sub',
  '/api/cloudvideo/video/unsub',
  '/api/djradio/sub',
  '/api/dj/difm/channel/unsubscribe',
  '/api/share/friends/resource',
  '/api/event/forward',
  '/api/song/play/lyrics/mark/del',
  '/api/song/play/lyrics/mark/add',
  '/api/social/user/status/edit',
  '/api/user/playlist/collect',
  '/api/content/interact/collect',
  '/api/yunbei/rcmd/song/submit',
  '/api/v2/discovery/recommend/dislike',
  '/api/v2/resource/comments/hug/listener',
  '/api/voice/workbench/radio/program/trans',
  '/api/ordering/web/digital',
  '/api/activate/initProfile',
  '/api/user/replaceCellphone',
  '/api/point/dailyTask',
  '/api/point/expense',
  '/api/point/receipt',
  '/api/usertool/task/point/receive',
  '/api/nmusician/workbench/mission/reward/obtain/new',
  '/api/vipnewcenter/app/level/task/reward/get',
  '/api/creator/user/access',
  '/api/feedback/weblog',
  '/api/listen/together/heartbeat',
  '/api/listen/together/end/v2',
  '/api/frontrisk/verify/qrcodestatus',
  '/api/playlist/import/task/status/v2',
];

test.each(writeUris)(
  '%s is sent once even after a connection failure with retries enabled',
  async (uri) => {
    let calls = 0;
    expect(
      createRequest(
        uri,
        {},
        {
          crypto: 'api',
          retry: {
            retryNonIdempotent: true,
            retries: 2,
            backoffMs: 0,
            jitter: false,
          },
          fetcher: async () => {
            calls += 1;
            throw new Error('EAI_AGAIN');
          },
        },
      ),
    ).rejects.toMatchObject({ status: 502 });
    expect(calls).toBe(1);
  },
);

test('unclassified reads retain connection-only retries', () => {
  for (const uri of [
    '/api/artist/follow/count/get',
    '/api/playlist/subscribers',
    '/api/unknown',
  ]) {
    expect(
      retryDecision(uri, new Error('EAI_AGAIN'), 1, { jitter: false }, 0),
    ).toBe(300);
  }
});

test('only evidenced reads are cached and known writes are never automatically replayed', () => {
  for (const identifier of [
    'search',
    'lyric',
    'song_detail',
    'playlist_detail',
  ]) {
    expect(isReadModule(identifier)).toBe(true);
  }
  for (const identifier of [
    'like',
    'login_qr_check',
    'batch',
    'voice_upload',
    'unknown',
  ]) {
    expect(isReadModule(identifier)).toBe(false);
  }
  for (const uri of [
    '/api/like',
    '/api/login/token',
    '/api/nos/token/alloc',
    '/api/batch',
    '/api/register/anonimous',
  ]) {
    expect(
      retryDecision(
        uri,
        new Error('ECONNREFUSED'),
        1,
        { retryNonIdempotent: true },
        0,
      ),
    ).toBeUndefined();
  }
});
