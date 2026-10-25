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

const NoticeRecord = UpstreamObject({
  id: Schema.Finite,
  notice: Loose(Schema.String),
  queued: Loose(Schema.Boolean),
  time: Loose(Schema.Finite),
  type: Loose(Schema.Finite),
  userId: Loose(Schema.Finite),
});

// 通到通知列表的路径 `notices` 和每条通知自己的编号 `notices[].id` 收紧；通知正文和游标宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    notices: Schema.Array(NoticeRecord),
    lastTime: Loose(Schema.Finite),
    more: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const msgNotices: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 30,
      time: query.lasttime || -1,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/msg/notices`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('msg_notices', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 通知
 */
export default msgNotices;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
