import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Artist } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  limit?: NaturalValue;
  offset?: NaturalValue;
};

const inputSchema = Schema.Struct({
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 榜单里的歌手是记录本身，编号收紧；core 的 `Artist.id` 是宽松的，这里局部覆盖。
const ChartArtist = UpstreamObject({
  ...Artist.schema.fields,
  id: Schema.Finite,
  fansCount: Loose(Schema.Finite),
});

// 通到热门歌手列表的路径 `artists` 和每个歌手的编号收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    artists: Schema.Array(ChartArtist),
    more: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/artist/top',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const topArtists: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 50,
      offset: query.offset || 0,
      total: true,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody('top_artists', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 热门歌手
 */
export default topArtists;
