import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { PlaylistUser } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const Subscriber = UpstreamObject({
  ...PlaylistUser.schema.fields,
  userId: Schema.Finite,
  subscribeTime: Loose(Schema.Finite),
});

// 通到订阅者列表的路径 `subscribers` 和每个订阅者自己的编号 `subscribers[].userId` 收紧；昵称、头像、认证、
// 关注状态、`subscribeTime`、`time` 和 `hasMore` 宽松。记录展开 `PlaylistUser`，其中 `expertTags`、`experts`
// 在本批录制里只见过 null，随共享结构保留。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    subscribers: Schema.Array(Subscriber),
    time: Loose(Schema.Finite),
    hasMore: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djSubscriber: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      time: query.time || '-1',
      id: query.id,
      limit: query.limit || '20',
      total: 'true',
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/djradio/subscriber`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'dj_subscriber',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 电台详情
 */
export default djSubscriber;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
