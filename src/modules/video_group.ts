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
    profile: 'web',
    target: '/api/videotimeline/videogroup/otherclient/get',
    semantic: 'read',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

// 分组视频列表 `datas` 在本批录制和全部标签探测里始终是 null，元素类型无法确定，未声明并原样保留；`msg` 只见过 null，也未声明；`hasmore`、`rcmdLimit` 宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    hasmore: Loose(Schema.Boolean),
    rcmdLimit: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const videoGroup: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      groupId: query.id,
      offset: query.offset || 0,
      need_preview_url: 'true',
      total: true,
    };
    const response = yield* request(
      buildActionRequestIntent('request', moduleActions['request'], data),
    );
    const body = yield* decodeUpstreamBody('video_group', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 视频标签/分类下的视频
 */
export default videoGroup;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
