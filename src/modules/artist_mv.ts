import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
  QueryNumber,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Artist } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type {
  IdentifierQuery,
  QueryNumberLike,
} from '../types/module-shared.ts';

export type ModuleInput = IdentifierQuery & {
  limit?: QueryNumberLike;
  offset?: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  id: Identifier,
  limit: Schema.optional(QueryNumber),
  offset: Schema.optional(QueryNumber),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const Mv = UpstreamObject({
  artist: Loose(Artist),
  artistName: Loose(Schema.String),
  duration: Loose(Schema.Finite),
  id: Schema.Finite,
  imgurl: Loose(Schema.String),
  imgurl16v9: Loose(Schema.String),
  name: Loose(Schema.String),
  playCount: Loose(Schema.Finite),
  publishTime: Loose(Schema.String),
  status: Loose(Schema.Finite),
  subed: Loose(Schema.Boolean),
});

// 通到歌手 MV 列表的路径 `mvs` 和 MV 自己的编号 `mvs[].id` 收紧；`time` 是下一页游标，宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    hasMore: Loose(Schema.Boolean),
    mvs: Schema.Array(Mv),
    time: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const artistMv: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      artistId: query.id,
      limit: query.limit,
      offset: query.offset,
      total: true,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/artist/mvs`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('artist_mv', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 歌手相关MV
 */
export default artistMv;
