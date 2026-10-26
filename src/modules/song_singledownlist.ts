import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 只收紧返回码；已购买单曲列表 `info` 在录制里只有空数组、元素类型未知，未声明并由 `UpstreamObject` 原样保留。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const songSingledownlist: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || '20',
      offset: query.offset || '0',
      total: 'true',
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/member/song/singledownlist`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'song_singledownlist',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 已购买单曲
 */
export default songSingledownlist;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
