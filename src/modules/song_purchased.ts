import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 返回码和已购单曲列表的路径 `data` 收紧；`data.list` 只有空数组证据、元素类型未知，未声明并由 `UpstreamObject` 原样保留，`count`、`hasMore` 和 `message` 宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      count: Loose(Schema.Finite),
      hasMore: Loose(Schema.Boolean),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const songPurchased: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 20,
      offset: query.offset || 0,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/single/mybought/song/list`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'song_purchased',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 已购单曲
 */
export default songPurchased;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
