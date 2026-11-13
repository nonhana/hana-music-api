import { Effect, Schema } from 'effect';

import { ProtocolFailed, UpstreamBusinessFailed } from '../core/errors.ts';
import {
  decodeModuleInput as decodeInput,
  NumberId,
  NumberIdList,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  op: 'add' | 'del';
  pid: NumberId;
  tracks: NumberIdList;
};

const inputSchema = Schema.Struct({
  op: Schema.Literals(['add', 'del']),
  pid: NumberId,
  tracks: NumberIdList,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  manipulate: {
    profile: 'web',
    target: '/api/v1/playlist/manipulate/tracks',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
  fallback: {
    profile: 'web',
    target: '/api/v1/playlist/manipulate/tracks',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

// 返回码收紧；歌单歌曲计数和 trackIds 宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    count: Loose(Schema.Finite),
    cloudCount: Loose(Schema.Finite),
    trackIds: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const decodeResponse = (response: Parameters<typeof toModuleResponse>[0]) => {
  const body =
    typeof response.body === 'object' &&
    response.body !== null &&
    'body' in response.body &&
    typeof response.body.body === 'object' &&
    response.body.body !== null
      ? response.body.body
      : response.body;
  const normalized = { ...response, body };
  return decodeUpstreamBody('playlist_tracks', ModuleBody, normalized).pipe(
    Effect.map((decoded) => ({
      ...toModuleResponse(normalized),
      body: decoded,
    })),
  );
};

const playlistTracks: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      op: query.op,
      pid: query.pid,
      trackIds: JSON.stringify(query.tracks.map(String)),
      imme: 'true',
    };
    return yield* request('manipulate', { data }).pipe(
      Effect.flatMap(decodeResponse),
      Effect.mapError((error) => {
        if (error instanceof ProtocolFailed && error.response) {
          const body = error.response.body;
          if (
            body !== null &&
            typeof body === 'object' &&
            !Array.isArray(body) &&
            typeof body.code === 'number' &&
            Number.isFinite(body.code)
          ) {
            return UpstreamBusinessFailed.make({
              message: error.message,
              code: body.code,
              response: error.response,
            });
          }
        }
        return error;
      }),
      Effect.catchTag('UpstreamBusinessFailed', (error) =>
        Effect.gen(function* () {
          if (error.code !== 512) {
            return yield* error;
          }
          return yield* request('fallback', {
            data: {
              ...data,
              trackIds: JSON.stringify(
                [...query.tracks, ...query.tracks].map(String),
              ),
            },
          }).pipe(Effect.flatMap(decodeResponse));
        }),
      ),
    );
  });

export default playlistTracks;
