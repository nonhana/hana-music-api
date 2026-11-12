import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberLiterals,
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

export type ModuleInput = { type?: 1 | 2 | 3 | 4 };

const inputSchema = Schema.Struct({
  type: Schema.optional(NumberLiterals([1, 2, 3, 4])),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 歌手榜里的歌手是记录本身，编号收紧；core 的 `Artist.id` 是宽松的，这里局部覆盖。
const ChartArtist = UpstreamObject({
  ...Artist.schema.fields,
  id: Schema.Finite,
  lastRank: Loose(Schema.Finite),
  score: Loose(Schema.Finite),
});

// 通到歌手榜列表的路径 `list.artists` 和每个歌手的编号收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    list: UpstreamObject({
      type: Loose(Schema.Finite),
      updateTime: Loose(Schema.Finite),
      artists: Schema.Array(ChartArtist),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/toplist/artist',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const toplistArtist: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      type: query.type || 1,
      limit: 100,
      offset: 0,
      total: true,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody(
      'toplist_artist',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 歌手榜
 */
export default toplistArtist;
