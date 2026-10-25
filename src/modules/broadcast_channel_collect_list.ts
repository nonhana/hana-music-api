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

// 只收紧返回码。`data` 在登录和匿名录制里都是空数组，元素类型没有证据，未声明并原样保留；
// 账号没有收藏频道是正常结果。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const broadcastChannelCollectList: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      contentType: 'BROADCAST',
      limit: query.limit || '99999',
      timeReverseOrder: 'true',
      startDate: '4762584922000',
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/content/channel/collect/list`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'broadcast_channel_collect_list',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 广播电台 - 我的收藏
 */
export default broadcastChannelCollectList;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
