import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  Optional,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const RecommendedPlaylist = UpstreamObject({
  id: Schema.Finite,
  name: Loose(Schema.String),
  coverImgId: Loose(Schema.Finite),
  coverImgUrl: Loose(Schema.String),
  playCount: Loose(Schema.Finite),
  specialType: Loose(Schema.Finite),
  action: Loose(Schema.String),
});

const RecPlaylist = UpstreamObject({
  playlist: RecommendedPlaylist,
  alg: Loose(Schema.String),
});

const RcmdData = UpstreamObject({
  rcmdTitle: Loose(Schema.String),
  jumpUrl: Loose(Schema.String),
  recPlaylist: Schema.Array(RecPlaylist),
});

// 通到相关歌单推荐的路径 `data` 可以没有（没有推荐时是 `null`），出现时 `data.recPlaylist` 和每个推荐歌单的编号 `playlist.id` 收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    message: Loose(Schema.String),
    doesNotCache: Loose(Schema.Boolean),
    data: Optional(RcmdData),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const playlistDetailRcmdGet: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      scene: 'playlist_head',
      playlistId: query.id,
      newStyle: 'true',
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/playlist/detail/rcmd/get`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'playlist_detail_rcmd_get',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 相关歌单推荐
 */
export default playlistDetailRcmdGet;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
