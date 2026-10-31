import { Effect, Schema } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';
// 歌手分类
/*
    type 取值
    1:男歌手
    2:女歌手
    3:乐队

    area 取值
    -1:全部
    7华语
    96欧美
    8:日本
    16韩国
    0:其他

    initial 取值 a-z/A-Z
*/
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Artist } from '../core/upstream-schemas.ts';

const ArtistListItem = UpstreamObject({
  ...Artist.schema.fields,
  fansCount: Loose(Schema.Finite),
  id: Schema.Finite,
});

// 通到歌手列表的路径 `artists` 和歌手自己的编号收紧；`more` 是分页标记，宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    artists: Schema.Array(ArtistListItem),
    more: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const artistList: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    if (
      query.initial !== undefined &&
      query.initial !== null &&
      typeof query.initial !== 'string' &&
      typeof query.initial !== 'number' &&
      typeof query.initial !== 'boolean'
    ) {
      return yield* new InvalidModuleInput({
        message: 'initial must be a primitive value',
      });
    }
    const data = {
      initial: Number.isNaN(Number(query.initial))
        ? String(query.initial || '')
            .toUpperCase()
            .charCodeAt(0) || undefined
        : query.initial,
      offset: query.offset || 0,
      limit: query.limit || 30,
      total: true,
      type: query.type || '1',
      area: query.area,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/v1/artist/list`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('artist_list', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

export default artistList;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
