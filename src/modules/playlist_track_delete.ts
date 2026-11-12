import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberId,
  NumberIdList,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

// 成功返回只承诺返回码，收紧的是返回码；401/404 业务拒绝原样转交。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({ code: Schema.Literal(200) }),
);
export type ModuleBody = typeof ModuleBody.Type;

export type ModuleInput = {
  id: NumberId;
  ids: NumberIdList;
};

const inputSchema = Schema.Struct({
  id: NumberId,
  ids: NumberIdList,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  delete: {
    target: '/api/playlist/track/delete',
    profile: 'web',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const playlistTrackDelete: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
      tracks: JSON.stringify(
        query.ids.map((id) => ({ type: 3, id: String(id) })),
      ),
    };

    const response = yield* request('delete', { data });
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody(
        'playlist_track_delete',
        ModuleBody,
        response,
      ),
    };
  });

/**
 * 收藏单曲到歌单 从歌单删除歌曲
 */
export default playlistTrackDelete;
