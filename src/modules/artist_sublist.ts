import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
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
import type { ModuleEffect } from '../types/index.ts';
import type { PagedQuery } from '../types/module-shared.ts';

export type ModuleInput = PagedQuery;

const inputSchema = Schema.Struct({
  limit: Schema.optional(QueryNumber),
  offset: Schema.optional(QueryNumber),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const SubscribedArtist = UpstreamObject({
  id: Schema.Finite,
  name: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  albumSize: Loose(Schema.Finite),
  alias: Loose(Schema.Array(Schema.String)),
  img1v1Url: Loose(Schema.String),
  info: Loose(Schema.String),
  mvSize: Loose(Schema.Finite),
  picId: Loose(Schema.Finite),
  trans: Loose(Schema.String),
});

// 通到关注列表的路径、每个歌手的编号收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(SubscribedArtist),
    hasMore: Loose(Schema.Boolean),
    count: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const artistSublist: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 25,
      offset: query.offset || 0,
      total: true,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/artist/sublist`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'artist_sublist',
      ModuleBody,
      response,
    );
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 关注歌手列表
 */
export default artistSublist;
