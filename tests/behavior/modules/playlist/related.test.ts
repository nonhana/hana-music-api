import { expect, test } from 'bun:test';

import { Effect } from 'effect';

import { ProtocolFailed } from '../../../../src/core/errors.ts';
import { normalizeFailure } from '../../../../src/core/response.ts';
import playlistTracks from '../../../../src/modules/playlist_tracks.ts';
import relatedPlaylist from '../../../../src/modules/related_playlist.ts';
import { runEffect } from '../../../_kit/it.ts';
import type { RecordedAction } from '../../../_kit/module.ts';
import { executeModule, response } from '../../../_kit/upload.ts';
import { relatedHtml } from '../../../fixtures/synthetic/upload.ts';

test('related playlists use injected transport and preserve parsing', async () => {
  const intents: Array<RecordedAction> = [];
  const result = await runEffect(
    executeModule(relatedPlaylist, { id: 1 }, (action, args) => {
      const intent = { action, args };
      return Effect.sync(() => {
        intents.push(intent);
        return response(relatedHtml);
      });
    }),
  );
  expect(result.body).toMatchObject({
    code: 200,
    playlists: [
      { id: '1', name: 'List', creator: { userId: '2', nickname: 'User' } },
    ],
  });
  expect(intents).toEqual([{ action: 'page', args: { query: 'id=1' } }]);
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
    const failure = ProtocolFailed.make({
      message: 'execution failed',
      response: { ...response({ code: status, retryAfter: 7 }), status },
    });
    const result = normalizeFailure(
      await runEffect(
        executeModule(
          playlistTracks,
          { op: 'add', pid: 1, tracks: ['2'] },
          () => Effect.fail(failure),
        ).pipe(Effect.flip),
      ),
    );

    expect(result).toMatchObject({
      status,
      body: { code: status, retryAfter: 7 },
    });
  },
);
