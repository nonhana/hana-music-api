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

const VideoUrl = UpstreamObject({
  id: Schema.String,
  url: Schema.String,
  needPay: Loose(Schema.Boolean),
  r: Loose(Schema.Finite),
  size: Loose(Schema.Finite),
  validityTime: Loose(Schema.Finite),
});

// 通到视频播放地址的路径 `urls`、视频编号 `urls[].id` 和地址 `urls[].url` 收紧；拿不到地址时上游返回空数组，本批未探测到 `url` 为 null。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    urls: Schema.Array(VideoUrl),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const videoUrl: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      ids: '["' + query.id + '"]',
      resolution: query.res || 1080,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/cloudvideo/playurl`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('video_url', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 视频链接
 */
export default videoUrl;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
