import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { SimpleAlbum, StylePage } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 曲风专辑列表里的专辑；`songs` 在录制里只见过空数组，元素类型猜不出，没有声明。
const StyleAlbum = UpstreamObject({
  ...SimpleAlbum.schema.fields,
  id: Schema.Finite,
});

// 通到曲风专辑列表的路径 `data.albums` 和每张专辑的编号 `data.albums[].id` 收紧；`data.page` 是分页提示，宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      albums: Schema.Array(StyleAlbum),
      page: Loose(StylePage),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const styleAlbum: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      cursor: query.cursor || 0,
      size: query.size || 20,
      tagId: query.tagId,
      sort: query.sort || 0,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/style-tag/home/album`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('style_album', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 曲风-专辑
 */
export default styleAlbum;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
