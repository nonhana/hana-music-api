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

// 接口就是为了确认房间已结束：正文顶层的返回码 `code` 收紧；`data.success`、房间类型和
// `message` 是附带信息，宽松（其余 `data` 字段只见过 `null`，不声明）。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Loose(
      UpstreamObject({
        roomType: Loose(Schema.String),
        success: Loose(Schema.Boolean),
      }),
    ),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const listentogetherEnd: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      roomId: query.roomId,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/listen/together/end/v2`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'listentogether_end',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 一起听 结束房间
 */
export default listentogetherEnd;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
