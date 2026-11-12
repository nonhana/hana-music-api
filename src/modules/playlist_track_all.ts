import { Effect, Schema } from 'effect';

import { UnexpectedUpstreamShape } from '../core/errors.ts';
import {
  decodeModuleInput as decodeInput,
  NaturalValue,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { LooseSongPrivilege, Song } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  id: NumberId;
  s?: number;
  limit?: number;
  offset?: number;
};

const inputSchema = Schema.Struct({
  id: NumberId,
  s: Schema.optional(NaturalValue),
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 通到歌曲列表的路径、每首歌的编号收紧；其余字段宽松（共用 `Song`），`privileges` 里的编号也宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    songs: Schema.Array(Song),
    privileges: Loose(Schema.Array(LooseSongPrivilege)),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  playlist: {
    profile: 'eapi',
    target: '/api/v6/playlist/detail',
    semantic: 'read',
    cache: 'none',
    retry: 'read',
  },
  songs: {
    profile: 'eapi',
    target: '/api/v3/song/detail',
    semantic: 'read',
    cache: 'none',
    retry: 'read',
  },
} as const satisfies ModuleActions;

const playlistTrackAll: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const limit = parseInt(String(query.limit ?? 1000), 10) || 1000;
    const offset = parseInt(String(query.offset ?? 0), 10) || 0;
    const response = yield* request('playlist', {
      data: {
        id: query.id,
        n: 100000,
        s: query.s || 8,
      },
    });
    const body = response.body;
    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      return yield* UnexpectedUpstreamShape.make({
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
      return yield* UnexpectedUpstreamShape.make({
        module: 'playlist_track_all',
        path: 'body.playlist',
        expected: 'object',
        actual: typeof playlist,
      });
    }
    const trackIds = playlist?.trackIds ?? [];
    if (!Array.isArray(trackIds)) {
      return yield* UnexpectedUpstreamShape.make({
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
        return yield* UnexpectedUpstreamShape.make({
          module: 'playlist_track_all',
          path: 'body.playlist.trackIds[].id',
          expected: 'number or string',
          actual: typeof track,
        });
      }
      ids.push(track.id);
    }
    const songDetail = yield* request('songs', {
      data: {
        c: '[' + ids.map((id) => '{"id":' + id + '}').join(',') + ']',
      },
    });
    const songs = yield* decodeUpstreamBody(
      'playlist_track_all',
      ModuleBody,
      songDetail,
    );
    return { ...toModuleResponse(songDetail), body: songs };
  });

export default playlistTrackAll;
