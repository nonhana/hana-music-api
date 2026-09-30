import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { PagedQuery, QueryNumberLike } from '../types/module-shared.ts';
import { decodeModuleInput as decodeInput, QueryNumber } from './_input.ts';
import type { AlbumArea } from './album_list.ts';

export type ModuleInput = PagedQuery & {
  area?: AlbumArea;
  type?: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  limit: Schema.optional(QueryNumber),
  offset: Schema.optional(QueryNumber),
  area: Schema.optional(
    Schema.Union([
      Schema.Literal('ALL'),
      Schema.Literal('ZH'),
      Schema.Literal('EA'),
      Schema.Literal('KR'),
      Schema.Literal('JP'),
      Schema.String,
    ]),
  ),
  type: Schema.optional(QueryNumber),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const albumNew: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 30,
      offset: query.offset || 0,
      total: true,
      area: query.area || 'ALL', //ALL:全部,ZH:华语,EA:欧美,KR:韩国,JP:日本
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/album/new`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 全部新碟
 */
export default albumNew;
