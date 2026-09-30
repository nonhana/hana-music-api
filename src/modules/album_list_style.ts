import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { PagedQuery } from '../types/module-shared.ts';
import { decodeModuleInput as decodeInput, QueryNumber } from './_input.ts';

export type AlbumStyleArea = 'Z_H' | 'E_A' | 'KR' | 'JP' | (string & {});

export type ModuleInput = PagedQuery & {
  area?: AlbumStyleArea;
};

const inputSchema = Schema.Struct({
  limit: Schema.optional(QueryNumber),
  offset: Schema.optional(QueryNumber),
  area: Schema.optional(
    Schema.Union([
      Schema.Literal('Z_H'),
      Schema.Literal('E_A'),
      Schema.Literal('KR'),
      Schema.Literal('JP'),
      Schema.String,
    ]),
  ),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const albumListStyle: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 10,
      offset: query.offset || 0,
      total: true,
      area: query.area || 'Z_H', //Z_H:华语,E_A:欧美,KR:韩国,JP:日本
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/vipmall/appalbum/album/style`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 数字专辑-语种风格馆
 */
export default albumListStyle;
