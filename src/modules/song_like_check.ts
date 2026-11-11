import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberIdList,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = { ids: NumberIdList };

const inputSchema = Schema.Struct({ ids: NumberIdList });

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 返回码和喜欢列表 `ids` 收紧；`ids` 里是这个账号已喜爱的歌曲编号，没喜欢过任何一首时是空数组。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    ids: Schema.Array(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/song/like/check',
    profile: 'eapi',
    semantic: 'read',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const songLikeCheck: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      trackIds: JSON.stringify(query.ids.map(String)),
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody(
      'song_like_check',
      ModuleBody,
      response,
    );
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 歌曲是否喜爱
 */
export default songLikeCheck;
