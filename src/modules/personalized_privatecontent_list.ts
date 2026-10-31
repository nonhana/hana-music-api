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

// 独家放送列表条目比 `personalized_privatecontent` 多 `time`、少 `alg`，留在本模块里。
const PrivatecontentListItem = UpstreamObject({
  id: Schema.Finite,
  copywriter: Loose(Schema.String),
  name: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  sPicUrl: Loose(Schema.String),
  time: Loose(Schema.Finite),
  type: Loose(Schema.Finite),
  url: Loose(Schema.String),
});

// 通到独家放送列表的路径 `result` 和每条内容自己的编号 `result[].id` 收紧；分页的 `more`、`offset` 和条目其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    result: Schema.Array(PrivatecontentListItem),
    more: Loose(Schema.Boolean),
    offset: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const personalizedPrivatecontentList: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      offset: query.offset || 0,
      total: 'true',
      limit: query.limit || 60,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/v2/privatecontent/list`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'personalized_privatecontent_list',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 独家放送列表
 */
export default personalizedPrivatecontentList;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
