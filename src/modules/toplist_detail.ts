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

// 榜单摘要共用 `PlaylistSummary`，另声明录制里非 null 的 `tsSongCount`、`originalCoverId`。
const ToplistSummary = UpstreamObject({
  ...PlaylistSummary.schema.fields,
  tsSongCount: Loose(Schema.Finite),
  originalCoverId: Loose(Schema.Finite),
});

const ArtistToplist = UpstreamObject({
  coverUrl: Loose(Schema.String),
  name: Loose(Schema.String),
  position: Loose(Schema.Finite),
  upateFrequency: Loose(Schema.String),
  updateFrequency: Loose(Schema.String),
  artists: Loose(
    Schema.Array(
      UpstreamObject({
        first: Loose(Schema.String),
        second: Loose(Schema.String),
        third: Loose(Schema.Finite),
      }),
    ),
  ),
});

const RewardToplist = UpstreamObject({
  coverUrl: Loose(Schema.String),
  name: Loose(Schema.String),
  position: Loose(Schema.Finite),
  songs: Loose(Schema.Array(UpstreamObject({}))),
});

// 通到榜单摘要列表的路径 `list` 和每个榜单的编号收紧（共用 `PlaylistSummary`）；`artistToplist`/`rewardToplist` 是附加入口，整体宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    list: Schema.Array(ToplistSummary),
    artistToplist: Loose(ArtistToplist),
    rewardToplist: Loose(RewardToplist),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const toplistDetail: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        `/api/toplist/detail`,
        {},
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'toplist_detail',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 所有榜单内容摘要
 */
export default toplistDetail;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
