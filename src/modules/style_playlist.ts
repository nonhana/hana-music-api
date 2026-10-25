import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { StylePage } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 曲风歌单列表里的歌单摘要；`userId` 是创建者编号，不是歌单自己的编号，按宽松处理。
const StylePlaylist = UpstreamObject({
  id: Schema.Finite,
  cover: Loose(Schema.String),
  name: Loose(Schema.String),
  playCount: Loose(Schema.Finite),
  songCount: Loose(Schema.Finite),
  userId: Loose(Schema.Finite),
  userName: Loose(Schema.String),
});

// 通到曲风歌单列表的路径 `data.playlist` 和每个歌单的编号 `data.playlist[].id` 收紧；`data.page` 是分页提示，宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      page: Loose(StylePage),
      playlist: Schema.Array(StylePlaylist),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const stylePlaylist: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      cursor: query.cursor || 0,
      size: query.size || 20,
      tagId: query.tagId,
      sort: 0,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/style-tag/home/playlist`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'style_playlist',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 曲风-歌单
 */
export default stylePlaylist;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
