import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  QueryNumber,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import { Artist } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { PagedQuery } from '../types/module-shared.ts';

export type ModuleInput = PagedQuery;

const inputSchema = Schema.Struct({
  limit: Schema.optional(QueryNumber),
  offset: Schema.optional(QueryNumber),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const SubscribedAlbum = UpstreamObject({
  id: Schema.Finite,
  name: Schema.String,
  picUrl: Schema.String,
  size: Schema.Finite,
  artists: Schema.Array(Artist),
});

export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(SubscribedAlbum),
    hasMore: Schema.Boolean,
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const albumSublist: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 25,
      offset: query.offset || 0,
      total: true,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/album/sublist`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'album_sublist',
      ModuleBody,
      response,
    );
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 已收藏专辑列表
 */
export default albumSublist;
