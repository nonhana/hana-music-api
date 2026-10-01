import { expect, test } from 'bun:test';

import { Effect } from 'effect';

import { ProtocolFailed } from '../../src/core/errors.ts';
import { normalizeFailure } from '../../src/core/response.ts';
import playlistTracks from '../../src/modules/playlist_tracks.ts';
import relatedPlaylist from '../../src/modules/related_playlist.ts';
import type { RequestIntent } from '../../src/types/index.ts';
import { runEffect } from '../_kit/it.ts';
import {
  executeModule,
  relatedHtml,
  response,
} from '../fixtures/upload-effect.ts';

test('related playlists use injected transport and preserve parsing', async () => {
  const intents: Array<RequestIntent> = [];
  const result = await runEffect(
    executeModule(relatedPlaylist, { id: 1 }, (intent) =>
      Effect.sync(() => {
        intents.push(intent);
        return response(relatedHtml);
      }),
    ),
  );
  expect(result.body).toMatchObject({
    code: 200,
    playlists: [
      { id: '1', name: 'List', creator: { userId: '2', nickname: 'User' } },
    ],
  });
  expect(intents).toEqual([
    {
      target: 'https://music.163.com/playlist?id=1',
      protocol: 'plain',
      method: 'GET',
      headers: {},
      response: 'text',
      semantic: 'read',
    },
  ]);
});

test('related playlists reject a non-text HTML body with a typed error', async () => {
  const error = await runEffect(
    Effect.flip(
      executeModule(relatedPlaylist, { id: 1 }, () =>
        Effect.succeed(response({ html: 'bad' })),
      ),
    ),
  );
  expect(error).toMatchObject({
    _tag: 'UnexpectedUpstreamShape',
    module: 'related_playlist',
  });
});

test.each([429, 503, 499, 504])(
  'playlist tracks propagates execution failure %d',
  async (status) => {
    const failure = new ProtocolFailed({
      message: 'execution failed',
      response: { ...response({ code: status, retryAfter: 7 }), status },
    });
    const result = normalizeFailure(
      await runEffect(
        executeModule(playlistTracks, { op: 'add', pid: 1, tracks: '2' }, () =>
          Effect.fail(failure),
        ).pipe(Effect.flip),
      ),
    );

    expect(result).toMatchObject({
      status,
      body: { code: status, retryAfter: 7 },
    });
  },
);
