import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';

import {
  decodeModuleInput as decodeInput,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { BodyType } from '../core/upstream-body.ts';
import {
  decodeUpstreamBody,
  defineModuleBody,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Song } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = { id: NumberId };

const inputSchema = Schema.Struct({ id: NumberId });

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 返回码和接口要返回的替换推荐歌曲 `data`、`data.id` 收紧；歌曲其余字段宽松。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Song,
  }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

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
      resId: String(query.id), // 日推歌曲id
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
