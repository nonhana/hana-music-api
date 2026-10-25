import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const PlaylistTag = UpstreamObject({
  id: Loose(Schema.Finite),
  name: Loose(Schema.String),
  category: Loose(Schema.Finite),
  usedCount: Loose(Schema.Finite),
  type: Loose(Schema.Finite),
  position: Loose(Schema.Finite),
  createTime: Loose(Schema.Finite),
  highQuality: Loose(Schema.Finite),
  highQualityPos: Loose(Schema.Finite),
  officialPos: Loose(Schema.Finite),
});

const HotTag = UpstreamObject({
  id: Schema.Finite,
  name: Loose(Schema.String),
  category: Loose(Schema.Finite),
  type: Loose(Schema.Finite),
  position: Loose(Schema.Finite),
  createTime: Loose(Schema.Finite),
  usedCount: Loose(Schema.Finite),
  hot: Loose(Schema.Boolean),
  activity: Loose(Schema.Boolean),
  playlistTag: Loose(PlaylistTag),
});

// 通到热门歌单分类列表的路径 `tags` 和每个标签的编号收紧；嵌套的 `playlistTag` 和其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    tags: Schema.Array(HotTag),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const playlistHot: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        `/api/playlist/hottags`,
        {},
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'playlist_hot',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 热门歌单分类
 */
export default playlistHot;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
