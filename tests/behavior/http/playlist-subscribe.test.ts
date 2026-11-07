import { expect, test } from 'bun:test';

import { createServer } from '../../../src/server/create-server.ts';
import { createStage, testEntropy } from '../../_kit/harness/sdk.ts';
import { readWebBody } from '../../_kit/upstream/wire.ts';

test('HTTP discovers playlistSubscribe declarations and sends the same web contract without opening a token channel', async () => {
  const sent: Array<{ url: string; headers: Headers; body: string }> = [];
  const reached = createStage('HTTP upstream');
  const app = await createServer(
    {},
    {
      execution: {
        entropy: testEntropy,
        fetcher: async (input, init) => {
          sent.push({
            url: input instanceof Request ? input.url : String(input),
            headers: new Headers(init?.headers),
            body: typeof init?.body === 'string' ? init.body : '',
          });
          reached.reach();
          return Response.json({ code: 200 });
        },
      },
    },
  );
  const pending = app.request('/playlist/subscribe?id=21&t=1', {
    headers: {
      cookie:
        'MUSIC_U=http-listener; os=iphone; appver=9; osver=16; channel=distribution',
    },
  });
  await reached.wait(pending);
  const response = await pending;
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ code: 200 });
  expect(sent).toHaveLength(1);
  expect(sent[0]!.url).toBe('https://music.163.com/weapi/playlist/subscribe');
  expect(sent[0]!.headers.get('cookie')).toContain('os=web');
  expect(sent[0]!.headers.get('cookie')).not.toContain('appver=');
  expect(sent[0]!.headers.get('cookie')).toContain('MUSIC_U=http-listener');
  expect(readWebBody(sent[0]!.body)).toEqual({
    id: '21',
    csrf_token: '',
    e_r: false,
  });
  const blocked = await app.request(
    '/playlist/subscribe?id=21&t=1&checkToken=forbidden',
  );
  expect(blocked.status).toBe(400);
  expect(sent).toHaveLength(1);
  for (const field of ['fetcher', 'headers', 'state', 'retry']) {
    expect(
      (await app.request(`/playlist/subscribe?id=21&t=1&${field}=forbidden`))
        .status,
    ).toBe(400);
  }
  expect(sent).toHaveLength(1);
});
