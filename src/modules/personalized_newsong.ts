import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import {
  LooseSongPrivilege,
  ProgramMainSong,
  ProgramQuality,
  SimpleAlbum,
} from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 推荐新歌的专辑比 `SimpleAlbum` 多一个单数 `transName`；`songs` 只见过空数组，未声明。
const NewsongAlbum = UpstreamObject({
  ...SimpleAlbum.schema.fields,
  transName: Loose(Schema.String),
});

const NewsongSong = UpstreamObject({
  ...ProgramMainSong.schema.fields,
  album: Loose(NewsongAlbum),
  alias: Loose(Schema.Array(Schema.String)),
  exclusive: Loose(Schema.Boolean),
  hrMusic: Loose(ProgramQuality),
  privilege: Loose(LooseSongPrivilege),
  sqMusic: Loose(ProgramQuality),
  transName: Loose(Schema.String),
  transNames: Loose(Schema.Array(Schema.String)),
});

// 推荐新歌条目：条目自己的 `id` 收紧，`song` 是附带记录，整体宽松。
const NewsongItem = UpstreamObject({
  id: Schema.Finite,
  alg: Loose(Schema.String),
  canDislike: Loose(Schema.Boolean),
  name: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  song: Loose(NewsongSong),
  type: Loose(Schema.Finite),
});

// 通到推荐新歌的路径 `result` 和每条记录自己的编号 `result[].id` 收紧；歌曲记录、`trp` 和其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    result: Schema.Array(NewsongItem),
    category: Loose(Schema.Finite),
    trp: Loose(UpstreamObject({ rules: Loose(Schema.Array(Schema.String)) })),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const personalizedNewsong: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      type: 'recommend',
      limit: query.limit || 10,
      areaId: query.areaId || 0,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/personalized/newsong`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'personalized_newsong',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 推荐新歌
 */
export default personalizedNewsong;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
