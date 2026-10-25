import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Artist, StylePage } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 曲风歌手列表里的歌迷数只是附带信息；`awardTags` 在录制里只见过 `null`，没有声明。
const StyleArtist = UpstreamObject({
  ...Artist.schema.fields,
  id: Schema.Finite,
  fansCount: Loose(Schema.Finite),
});

// 通到曲风歌手列表的路径 `data.artists` 和每个歌手的编号 `data.artists[].id` 收紧；`data.page` 是分页提示，宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      artists: Schema.Array(StyleArtist),
      page: Loose(StylePage),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const styleArtist: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      cursor: query.cursor || 0,
      size: query.size || 20,
      tagId: query.tagId,
      sort: 0,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/style-tag/home/artist`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'style_artist',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 曲风-歌手
 */
export default styleArtist;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
