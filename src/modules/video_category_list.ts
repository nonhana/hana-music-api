import { Effect, Schema } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { buildActionRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

export const moduleActions = {
  request: {
    profile: 'weapiPc',
    target: '/api/cloudvideo/category/list',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const VideoCategory = UpstreamObject({
  id: Schema.Finite,
  name: Loose(Schema.String),
  relatedVideoType: Loose(Schema.String),
  selectTab: Loose(Schema.Boolean),
  url: Loose(Schema.String),
});

// 通到视频分类列表的路径 `data` 和分类自己的编号 `data[].id` 收紧；`abExtInfo` 只见过 null，未声明。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    message: Loose(Schema.String),
    data: Schema.Array(VideoCategory),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const videoCategoryList: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      offset: query.offset || 0,
      total: 'true',
      limit: query.limit || 99,
    };
    const response = yield* request(
      buildActionRequestIntent('request', moduleActions['request'], data),
    );
    const body = yield* decodeUpstreamBody(
      'video_category_list',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 视频分类列表
 */
export default videoCategoryList;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
