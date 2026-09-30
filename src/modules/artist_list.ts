import { Effect } from 'effect';

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

const artistList: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    if (
      query.initial !== undefined &&
      query.initial !== null &&
      typeof query.initial !== 'string' &&
      typeof query.initial !== 'number' &&
      typeof query.initial !== 'boolean'
    ) {
      return yield* Effect.fail(
        new InvalidModuleInput({
          message: 'initial must be a primitive value',
        }),
      );
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
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/v1/artist/list`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

export default artistList;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
