import { expect, test } from 'bun:test';

import { createServer } from '../../../../src/server/create-server.ts';
import { generatedModuleRoutes } from '../../../../src/types/generated/module-surface.generated.ts';
import type { ModuleIdentifier } from '../../../../src/types/index.ts';
import { testEntropy } from '../../../_kit/harness/sdk.ts';
import { readEapiBody, readWebBody } from '../../../_kit/upstream/wire.ts';

const postModule = async (
  identifier: ModuleIdentifier,
  input: Record<string, unknown>,
) => {
  const sent: Array<{ body: string; url: string }> = [];
  const app = await createServer(
    {},
    {
      execution: {
        entropy: testEntropy,
        fetcher: async (request, init) => {
          sent.push({
            url: request instanceof Request ? request.url : String(request),
            body: typeof init?.body === 'string' ? init.body : '',
          });
          return Response.json({
            code: 200,
            songs: [],
            privileges: [],
          });
        },
      },
    },
  );
  const response = await app.request(
    generatedModuleRoutes[identifier as keyof typeof generatedModuleRoutes],
    {
      method: 'POST',
      headers: {
        cookie: 'MUSIC_U=test',
        'content-type': 'application/json',
      },
      body: JSON.stringify(input),
    },
  );
  expect(response.status).toBe(200);
  return sent;
};

test('song_detail encodes a number id list as upstream song objects', async () => {
  const sent = await postModule('song_detail', { ids: [12, '34'] });
  expect(sent).toHaveLength(1);
  expect(sent[0]!.url).toBe('https://music.163.com/weapi/v3/song/detail');
  expect(readWebBody(sent[0]!.body)).toMatchObject({
    c: '[{"id":12},{"id":34}]',
  });
});

test('playlist_tracks encodes ordered track ids as a JSON string list', async () => {
  const sent = await postModule('playlist_tracks', {
    op: 'add',
    pid: 1,
    tracks: [2, '3'],
  });
  expect(sent).toHaveLength(1);
  expect(readWebBody(sent[0]!.body)).toMatchObject({
    imme: 'true',
    op: 'add',
    pid: 1,
    trackIds: '["2","3"]',
  });
});

test('song_order_update encodes the ordered id list as JSON', async () => {
  const sent = await postModule('song_order_update', {
    ids: [2, '3'],
    pid: 1,
  });
  expect(sent).toHaveLength(1);
  expect(readEapiBody(sent[0]!.body).data).toMatchObject({
    op: 'update',
    pid: 1,
    trackIds: '["2","3"]',
  });
});

test('playlist_order_update encodes the ordered id list as JSON', async () => {
  const sent = await postModule('playlist_order_update', { ids: [2, '3'] });
  expect(sent).toHaveLength(1);
  expect(sent[0]!.url).toBe(
    'https://music.163.com/weapi/playlist/order/update',
  );
  expect(readWebBody(sent[0]!.body)).toMatchObject({ ids: '["2","3"]' });
});

test('playlist_tags_update joins tags with semicolons and keeps an empty list', async () => {
  const sent = await postModule('playlist_tags_update', {
    id: 1,
    tags: ['rock', 'pop'],
  });
  expect(sent).toHaveLength(1);
  expect(readWebBody(sent[0]!.body)).toMatchObject({
    id: 1,
    tags: 'rock;pop',
  });
  const empty = await postModule('playlist_tags_update', {
    id: 1,
    tags: [],
  });
  expect(readWebBody(empty[0]!.body)).toMatchObject({ id: 1, tags: '' });
});

test('listentogether_sync_list_command encodes lists inside playlistParam', async () => {
  const sent = await postModule('listentogether_sync_list_command', {
    roomId: 'room_1',
    commandType: 'REPLACE',
    version: 2,
    userId: 3,
    randomList: [4, '5'],
    displayList: [],
  });
  expect(sent).toHaveLength(1);
  const data = readWebBody(sent[0]!.body) as {
    playlistParam: string;
    roomId: string;
  };
  expect(data.roomId).toBe('room_1');
  expect(JSON.parse(data.playlistParam)).toEqual({
    anchorPosition: -1,
    anchorSongId: '',
    commandType: 'REPLACE',
    displayList: [],
    randomList: ['4', '5'],
    version: [{ userId: 3, version: 2 }],
  });
});
