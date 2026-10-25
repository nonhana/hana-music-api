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
import { Artist, PlaylistSummary } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 建议歌手是记录本身，编号收紧；core 的 `Artist.id` 是宽松的，这里局部覆盖。
const SuggestedArtist = UpstreamObject({
  ...Artist.schema.fields,
  id: Schema.Finite,
  alg: Loose(Schema.String),
  fansSize: Loose(Schema.Finite),
  occupation: Loose(Schema.String),
  videoSize: Loose(Schema.Finite),
});

const SuggestedPlaylist = UpstreamObject({
  ...PlaylistSummary.schema.fields,
  alg: Loose(Schema.String),
  backgroundImageId: Loose(Schema.Finite),
  originalCoverId: Loose(Schema.Finite),
  tsSongCount: Loose(Schema.Finite),
});

const MlogSongArtist = UpstreamObject({
  artistId: Loose(Schema.Finite),
  artistName: Loose(Schema.String),
});

const MlogSong = UpstreamObject({
  id: Loose(Schema.Finite),
  name: Loose(Schema.String),
  albumName: Loose(Schema.String),
  coverUrl: Loose(Schema.String),
  duration: Loose(Schema.Finite),
  artists: Loose(Schema.Array(MlogSongArtist)),
});

const MlogArtist = UpstreamObject({
  id: Loose(Schema.Finite),
  name: Loose(Schema.String),
  img1v1Url: Loose(Schema.String),
});

const MlogExt = UpstreamObject({
  artistName: Loose(Schema.String),
  artists: Loose(Schema.Array(MlogArtist)),
  canCollect: Loose(Schema.Boolean),
  commentCount: Loose(Schema.Finite),
  likedCount: Loose(Schema.Finite),
  playCount: Loose(Schema.Finite),
  song: Loose(MlogSong),
});

const MlogBaseData = UpstreamObject({
  id: Loose(Schema.String),
  type: Loose(Schema.Finite),
  text: Loose(Schema.String),
  coverColor: Loose(Schema.Finite),
  coverHeight: Loose(Schema.Finite),
  coverWidth: Loose(Schema.Finite),
  coverPicKey: Loose(Schema.String),
  coverUrl: Loose(Schema.String),
  duration: Loose(Schema.Finite),
  pubTime: Loose(Schema.Finite),
  threadId: Loose(Schema.String),
});

const MlogResource = UpstreamObject({
  mlogBaseData: Loose(MlogBaseData),
  mlogExtVO: Loose(MlogExt),
  shareUrl: Loose(Schema.String),
  status: Loose(Schema.Finite),
});

const MlogBaseInfo = UpstreamObject({
  id: Loose(Schema.String),
  type: Loose(Schema.Finite),
  mlogBaseDataType: Loose(Schema.Finite),
  matchField: Loose(Schema.Finite),
  sameCity: Loose(Schema.Boolean),
  resource: Loose(MlogResource),
});

const SuggestedMlog = UpstreamObject({
  resourceId: Schema.String,
  resourceType: Loose(Schema.String),
  resourceName: Loose(Schema.String),
  alg: Loose(Schema.String),
  baseInfo: Loose(MlogBaseInfo),
});

// 通到多类型搜索建议的路径 `result`；`orders` 是宽松的类别顺序，每个类别里记录的 `id`/`resourceId` 收紧。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    result: UpstreamObject({
      artist: Optional(Schema.Array(SuggestedArtist)),
      new_mlog: Optional(Schema.Array(SuggestedMlog)),
      playlist: Optional(Schema.Array(SuggestedPlaylist)),
      orders: Loose(Schema.Array(Schema.String)),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const searchMultimatch: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      type: query.type || 1,
      s: query.keywords || '',
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/search/suggest/multimatch`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'search_multimatch',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 多类型搜索
 */
export default searchMultimatch;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
