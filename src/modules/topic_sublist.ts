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

// 收藏的专栏记录：只收紧专栏自己的编号 `id`；作者、封面和阅读数是宽松字段。
const SubscribedTopic = UpstreamObject({
  id: Schema.Finite,
  author: Loose(Schema.String),
  picId: Loose(Schema.Finite),
  readCount: Loose(Schema.Finite),
  rectanglePicUrl: Loose(Schema.String),
  resUrl: Loose(Schema.String),
  subTime: Loose(Schema.Finite),
  title: Loose(Schema.String),
  userId: Loose(Schema.Finite),
});

// 获取收藏的专栏：通到列表的路径 `data` 和每条专栏自己的编号 `data[].id` 收紧；没有收藏时 `data` 为空数组。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(SubscribedTopic),
    count: Loose(Schema.Finite),
    hasMore: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const topicSublist: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 50,
      offset: query.offset || 0,
      total: true,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/topic/sublist`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'topic_sublist',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 收藏的专栏
 */
export default topicSublist;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
