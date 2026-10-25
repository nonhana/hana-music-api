import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Song, StylePage } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 通到曲风歌曲列表的路径 `data.songs` 和每首歌的编号 `data.songs[].id` 收紧；`data.page` 是分页提示，宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      page: Loose(StylePage),
      songs: Schema.Array(Song),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const styleSong: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      cursor: query.cursor || 0,
      size: query.size || 20,
      tagId: query.tagId,
      sort: query.sort || 0,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/style-tag/home/song`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('style_song', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 曲风-歌曲
 */
export default styleSong;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
