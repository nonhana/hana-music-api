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

const PlaylistExtInfo = UpstreamObject({
  coverImgId_str: Loose(Schema.String),
});

// 相似歌单记录复用 `PlaylistSummary`，另声明录制里非 null 的推荐字段；只见过 null 的字段未声明。
const SimiPlaylist = UpstreamObject({
  ...PlaylistSummary.schema.fields,
  alg: Loose(Schema.String),
  backgroundImageId: Loose(Schema.Finite),
  extProperties: Loose(PlaylistExtInfo),
  originalCoverId: Loose(Schema.Finite),
  recommendReason: Loose(Schema.String),
  tsSongCount: Loose(Schema.Finite),
  xInfo: Loose(PlaylistExtInfo),
});

// 通到相似歌单列表的路径 `playlists` 和每个歌单的编号收紧（复用 `SimiPlaylist`）；其余字段宽松。
// 缺少 `id` 时上游 HTTP 400 被归一成 `status: 200` 和空正文，空字符串作为独立分支声明。
export const ModuleBody = Schema.toStandardSchemaV1(
  Schema.Union([
    UpstreamObject({
      code: Schema.Literal(200),
      playlists: Schema.Array(SimiPlaylist),
    }),
    Schema.Literal(''),
  ]).annotate({ expected: 'object with code 200 or an empty string' }),
);
export type ModuleBody = typeof ModuleBody.Type;

const simiPlaylist: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      songid: query.id,
      limit: query.limit || 50,
      offset: query.offset || 0,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/discovery/simiPlaylist`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'simi_playlist',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 相似歌单
 */
export default simiPlaylist;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
