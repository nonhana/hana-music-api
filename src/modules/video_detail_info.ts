import { Effect, Schema } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
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

// 通到视频评论线程计数的路径 `commentCount`/`shareCount`/`likedCount` 收紧；`liked` 是当前账号状态，宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    commentCount: Schema.Finite,
    liked: Loose(Schema.Boolean),
    likedCount: Schema.Finite,
    shareCount: Schema.Finite,
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const videoDetailInfo: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    if (
      query.vid !== undefined &&
      query.vid !== null &&
      typeof query.vid !== 'string' &&
      typeof query.vid !== 'number' &&
      typeof query.vid !== 'boolean'
    ) {
      return yield* new InvalidModuleInput({
        message: 'vid must be a primitive value',
      });
    }
    const data = {
      threadid: `R_VI_62_${String(query.vid)}`,
      composeliked: true,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/comment/commentthread/info`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'video_detail_info',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 视频点赞转发评论数数据
 */
export default videoDetailInfo;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
