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
import { AlbumSummary, Artist, SimpleAlbum } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const SuggestedSong = UpstreamObject({
  id: Schema.Finite,
  name: Loose(Schema.String),
  album: Loose(SimpleAlbum),
  alias: Loose(Schema.Array(Schema.String)),
  artists: Loose(Schema.Array(Artist)),
  copyrightId: Loose(Schema.Finite),
  duration: Loose(Schema.Finite),
  fee: Loose(Schema.Finite),
  ftype: Loose(Schema.Finite),
  mark: Loose(Schema.Finite),
  mvid: Loose(Schema.Finite),
  rtype: Loose(Schema.Finite),
  status: Loose(Schema.Finite),
  transNames: Loose(Schema.Array(Schema.String)),
});

const SuggestedArtist = UpstreamObject({
  ...Artist.schema.fields,
  id: Schema.Finite,
});

const SuggestedPlaylist = UpstreamObject({
  id: Schema.Finite,
  name: Loose(Schema.String),
  coverImgUrl: Loose(Schema.String),
  creator: Loose(
    UpstreamObject({
      userId: Loose(Schema.Finite),
      nickname: Loose(Schema.String),
    }),
  ),
  bookCount: Loose(Schema.Finite),
  description: Loose(Schema.String),
  highQuality: Loose(Schema.Boolean),
  officialPlaylistTitle: Loose(Schema.String),
  playCount: Loose(Schema.Finite),
  playlistType: Loose(Schema.String),
  specialType: Loose(Schema.Finite),
  subscribed: Loose(Schema.Boolean),
  trackCount: Loose(Schema.Finite),
  userId: Loose(Schema.Finite),
});

const AllMatch = UpstreamObject({
  keyword: Schema.String,
  alg: Loose(Schema.String),
  feature: Loose(Schema.String),
  lastKeyword: Loose(Schema.String),
  type: Loose(Schema.Finite),
});

// 默认按类别给 songs/artists/albums/playlists（type 为 mobile 时只给 allMatch；没有建议时 result 是空对象），这些列表可以没有，出现了就按编号或关键词收紧校验，其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    result: UpstreamObject({
      songs: Optional(Schema.Array(SuggestedSong)),
      artists: Optional(Schema.Array(SuggestedArtist)),
      albums: Optional(Schema.Array(AlbumSummary)),
      playlists: Optional(Schema.Array(SuggestedPlaylist)),
      allMatch: Optional(Schema.Array(AllMatch)),
      order: Loose(Schema.Array(Schema.String)),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const searchSuggest: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      s: query.keywords || '',
    };
    const type = query.type === 'mobile' ? 'keyword' : 'web';
    const response = yield* request(
      buildApiRequestIntent(
        `/api/search/suggest/` + type,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'search_suggest',
      ModuleBody,
      response,
    );
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 搜索建议
 */
export default searchSuggest;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
