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

// 话题记录的编号是 `actId`；标题、正文、参与人数和封面都是宽松字段。
const HotTopicRecord = UpstreamObject({
  actId: Schema.Finite,
  alg: Loose(Schema.String),
  isDefaultImg: Loose(Schema.Boolean),
  participateCount: Loose(Schema.Finite),
  reason: Loose(Schema.String),
  sharePicUrl: Loose(Schema.String),
  text: Loose(Schema.Array(Schema.String)),
  title: Loose(Schema.String),
});

// 获取热门话题：通到列表的路径 `hot` 和每条话题自己的编号 `hot[].actId` 收紧；空推荐位未见录制，`hot: []` 由契约测试覆盖。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    hot: Schema.Array(HotTopicRecord),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const hotTopic: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 20,
      offset: query.offset || 0,
    };
    const response = yield* request(
      buildApiRequestIntent(`/api/act/hot`, data, createOption(query, 'weapi')),
    );
    const body = yield* decodeUpstreamBody('hot_topic', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 热门话题
 */
export default hotTopic;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
