import { Effect, Schema } from 'effect';

import { UnexpectedUpstreamShape } from '../core/errors.ts';
import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
  QueryNumber,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type {
  IdentifierQuery,
  QueryNumberLike,
} from '../types/module-shared.ts';

export type ModuleInput = IdentifierQuery & {
  s?: QueryNumberLike;

  limit?: QueryNumberLike;
  offset?: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  id: Identifier,
  s: Schema.optional(QueryNumber),
  limit: Schema.optional(QueryNumber),
  offset: Schema.optional(QueryNumber),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const playlistTrackAll: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const limit = parseInt(String(query.limit ?? 1000), 10) || 1000;
    const offset = parseInt(String(query.offset ?? 0), 10) || 0;
    const response = yield* request(
      buildApiRequestIntent(
        '/api/v6/playlist/detail',
        { id: query.id, n: 100000, s: query.s || 8 },
        createOption(query),
      ),
    );
    const body = response.body;
    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      return yield* new UnexpectedUpstreamShape({
        module: 'playlist_track_all',
        path: 'body',
        expected: 'object',
        actual: typeof body,
      });
    }
    const playlist = body.playlist;
    if (
      playlist !== undefined &&
      (playlist === null ||
        typeof playlist !== 'object' ||
        Array.isArray(playlist))
    ) {
      return yield* new UnexpectedUpstreamShape({
        module: 'playlist_track_all',
        path: 'body.playlist',
        expected: 'object',
        actual: typeof playlist,
      });
    }
    const trackIds = playlist?.trackIds ?? [];
    if (!Array.isArray(trackIds)) {
      return yield* new UnexpectedUpstreamShape({
        module: 'playlist_track_all',
        path: 'body.playlist.trackIds',
        expected: 'array',
        actual: typeof trackIds,
      });
    }
    const ids: Array<number | string> = [];
    for (const track of trackIds.slice(offset, offset + limit)) {
      if (
        track === null ||
        typeof track !== 'object' ||
        Array.isArray(track) ||
        (typeof track.id !== 'number' && typeof track.id !== 'string')
      ) {
        return yield* new UnexpectedUpstreamShape({
          module: 'playlist_track_all',
          path: 'body.playlist.trackIds[].id',
          expected: 'number or string',
          actual: typeof track,
        });
      }
      ids.push(track.id);
    }
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          '/api/v3/song/detail',
          { c: '[' + ids.map((id) => '{"id":' + id + '}').join(',') + ']' },
          createOption(query),
        ),
      ),
    );
  });

export default playlistTrackAll;
