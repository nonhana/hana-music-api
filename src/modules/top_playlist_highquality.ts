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

const HighQualityPlaylist = UpstreamObject({
  ...PlaylistSummary.schema.fields,
  copywriter: Loose(Schema.String),
  tag: Loose(Schema.String),
});

// 通到精品歌单列表的路径 `playlists` 和每个歌单的编号收紧；`total`、`lasttime`、`more` 是分页提示，`msg` 是状态信息，都宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    playlists: Schema.Array(HighQualityPlaylist),
    total: Loose(Schema.Finite),
    lasttime: Loose(Schema.Finite),
    more: Loose(Schema.Boolean),
    msg: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const topPlaylistHighquality: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      cat: query.cat || '全部', // 全部,华语,欧美,韩语,日语,粤语,小语种,运动,ACG,影视原声,流行,摇滚,后摇,古风,民谣,轻音乐,电子,器乐,说唱,古典,爵士
      limit: query.limit || 50,
      lasttime: query.before || 0, // 歌单updateTime
      total: true,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/playlist/highquality/list`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'top_playlist_highquality',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 精品歌单
 */
export default topPlaylistHighquality;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
