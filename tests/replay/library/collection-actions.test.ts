import { expect, test } from 'bun:test';

import { settle } from '../../_kit/assertions.ts';
import { replay } from '../../_kit/replay.ts';
import albumAgain from '../../fixtures/netease/like-collect/album_sub.subscribe-again.json';
import albumSub from '../../fixtures/netease/like-collect/album_sub.subscribe.json';
import albumUnsubAgain from '../../fixtures/netease/like-collect/album_sub.unsubscribe-again.json';
import albumUnsub from '../../fixtures/netease/like-collect/album_sub.unsubscribe.json';
import artistAgain from '../../fixtures/netease/like-collect/artist_sub.subscribe-again.json';
import artistSub from '../../fixtures/netease/like-collect/artist_sub.subscribe.json';
import artistUnsubAgain from '../../fixtures/netease/like-collect/artist_sub.unsubscribe-again.json';
import artistUnsub from '../../fixtures/netease/like-collect/artist_sub.unsubscribe.json';

test.each([
  { method: 'albumSub', label: 'subscribe', recording: albumSub },
  { method: 'albumSub', label: 'subscribe again', recording: albumAgain },
  { method: 'albumSub', label: 'unsubscribe', recording: albumUnsub },
  {
    method: 'albumSub',
    label: 'unsubscribe again',
    recording: albumUnsubAgain,
  },
  { method: 'artistSub', label: 'subscribe', recording: artistSub },
  { method: 'artistSub', label: 'subscribe again', recording: artistAgain },
  { method: 'artistSub', label: 'unsubscribe', recording: artistUnsub },
  {
    method: 'artistSub',
    label: 'unsubscribe again',
    recording: artistUnsubAgain,
  },
] as const)(
  'historical $method $label preserves its recorded response',
  async ({ method, recording }) => {
    const client = replay(recording.response.body, recording.response.status);
    const settled = await settle(
      client[method]({
        id: recording.query.id,
        t: recording.query.t === 1 ? 1 : 0,
      }),
    );
    expect(settled).toHaveProperty(
      recording.response.status >= 400 ? 'rejected' : 'resolved',
    );
    const result = 'resolved' in settled ? settled.resolved : settled.rejected;
    expect(result.status).toBe(recording.response.status);
    expect(result.body).toMatchObject(recording.response.body);
  },
);
