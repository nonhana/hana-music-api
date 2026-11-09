import { Effect, Schema } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import { Song } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 返回码和接口要返回的替换推荐歌曲 `data`、`data.id` 收紧；歌曲其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Song,
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  write: {
    target: '/api/v2/discovery/recommend/dislike',
    profile: 'web',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const recommendSongsDislike: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      resId: query.id, // 日推歌曲id
      resType: 4,
      sceneType: 1,
    };
    const response = yield* request('write', { data });
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody(
        'recommend_songs_dislike',
        ModuleBody,
        response,
      ),
    };
  });

/**
 * 每日推荐歌曲-不感兴趣
 */
export default recommendSongsDislike;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
