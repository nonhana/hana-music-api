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

// 通到播客列表的路径 `data` 收紧；`data.list` 的元素只在空结果里出现过，类型没有证据，未声明并原样保留，
// `data.total`、`data.hasMore` 是宽松的分页提示，`message` 只见过 `null`，也不声明。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      hasMore: Loose(Schema.Boolean),
      total: Loose(Schema.Finite),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const voicelistSearch: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      fee: '-1',
      limit: query.limit || '200',
      offset: query.offset || '0',
      podcastName: query.podcastName || '',
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/voice/workbench/voicelist/search`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'voicelist_search',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 播客列表
 */
export default voicelistSearch;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
