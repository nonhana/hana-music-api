import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const Playlist = UpstreamObject({
  id: Schema.Finite,
  name: Schema.String,
});

export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    id: Schema.Finite,
    playlist: Playlist,
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const playlistCreate: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      name: query.name,
      privacy: query.privacy || '0', // 0 普通歌单, 10 隐私歌单
      type: query.type || 'NORMAL', // 默认 NORMAL, VIDEO 视频歌单, SHARED 共享歌单
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/playlist/create`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody('playlist_create', ModuleBody, response),
    };
  });

/**
 * 创建歌单
 */
export default playlistCreate;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
