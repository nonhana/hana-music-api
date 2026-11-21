import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';

import {
  decodeModuleInput as decodeInput,
  NumberIdList,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { BodyType } from '../core/upstream-body.ts';
import {
  decodeUpstreamBody,
  defineModuleBody,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = { ids: NumberIdList };

const inputSchema = Schema.Struct({ ids: NumberIdList });

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 接口只返回返回码，收紧的是返回码。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  UpstreamObject({ code: Schema.Literal(200) }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

export const moduleActions = {
  update: {
    target: '/api/playlist/order/update',
    profile: 'web',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const playlistOrderUpdate: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      ids: JSON.stringify(query.ids.map(String)),
    };
    const response = yield* request('update', { data });
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody(
        'playlist_order_update',
        ModuleBody,
        response,
      ),
    };
  });

/**
 * 编辑歌单顺序
 */
export default playlistOrderUpdate;
