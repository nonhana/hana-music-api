import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  QueryNumber,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
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
  name: Schema.String,
  picUrl: Schema.String,
  albumSize: Schema.Finite,
});

export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(SubscribedArtist),
    hasMore: Schema.Boolean,
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
