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

// 返回码、歌手百科记录的路径 `data` 和歌手自己的编号 `data.artistId` 收紧；未知歌手的 `data` 整个缺失，写成可以没有；其余资料字段全部宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Optional(
      UpstreamObject({
        alias: Loose(Schema.String),
        area: Loose(Schema.Finite),
        artistId: Schema.Finite,
        artistName: Loose(Schema.String),
        avatarPicUrl: Loose(Schema.String),
        desc: Loose(Schema.String),
        headPicUrl: Loose(Schema.String),
        production: Loose(Schema.String),
        type: Loose(Schema.Finite),
      }),
    ),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const ugcArtistGet: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      artistId: query.id,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/rep/ugc/artist/get`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'ugc_artist_get',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 歌手简要百科信息
 */
export default ugcArtistGet;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
