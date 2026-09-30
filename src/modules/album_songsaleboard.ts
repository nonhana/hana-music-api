import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { QueryNumberLike } from '../types/module-shared.ts';
import { decodeModuleInput as decodeInput, QueryNumber } from './_input.ts';

export type AlbumSalesBoardType =
  | 'daily'
  | 'week'
  | 'year'
  | 'total'
  | (string & {});

export type ModuleInput = {
  albumType?: QueryNumberLike;
  type?: AlbumSalesBoardType;
  year?: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  albumType: Schema.optional(QueryNumber),
  type: Schema.optional(
    Schema.Union([
      Schema.Literal('daily'),
      Schema.Literal('week'),
      Schema.Literal('year'),
      Schema.Literal('total'),
      Schema.String,
    ]),
  ),
  year: Schema.optional(QueryNumber),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const albumSongsaleboard: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    let data: Record<string, unknown> = {
      albumType: query.albumType || 0, //0为数字专辑,1为数字单曲
    };
    const type = query.type || 'daily'; // daily,week,year,total
    if (type === 'year') {
      data = {
        ...data,
        year: query.year,
      };
    }
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/feealbum/songsaleboard/${type}/type`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 数字专辑&数字单曲-榜单
 */
export default albumSongsaleboard;
