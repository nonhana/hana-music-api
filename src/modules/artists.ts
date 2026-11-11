import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Artist, Song } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = { id: NumberId };

const inputSchema = Schema.Struct({
  id: NumberId,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const ArtistSummary = UpstreamObject({
  ...Artist.schema.fields,
  publishTime: Loose(Schema.Finite),
});

// 通到热门歌曲列表的路径和每首歌的编号收紧；歌手是附带信息，其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    artist: Loose(ArtistSummary),
    hotSongs: Schema.Array(Song),
    more: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: { prefix: '/api/v1/artist/' },
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const artists: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const response = yield* request('read', {
      data: {},
      path: `/api/v1/artist/${query.id}`,
    });
    const body = yield* decodeUpstreamBody('artists', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 歌手单曲
 */
export default artists;
