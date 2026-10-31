import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { PlaylistSummary } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 返回码、收藏歌单列表的路径 `data.playlist` 和每个歌单自己的编号 `id` 收紧（复用 `PlaylistSummary`）；分页 `count`/`more` 和其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      count: Loose(Schema.Finite),
      more: Loose(Schema.Boolean),
      playlist: Schema.Array(PlaylistSummary),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userPlaylistCollect: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || '100',
      offset: query.offset || '0',
      userId: query.uid,
      isWebview: 'true',
      includeRedHeart: 'true',
      includeTop: 'true',
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/user/playlist/collect`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'user_playlist_collect',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 获取用户的收藏歌单列表
 */
export default userPlaylistCollect;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
