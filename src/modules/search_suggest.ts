import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';

import { decodeModuleInput as decodeInput } from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { BodyType } from '../core/upstream-body.ts';
import {
  decodeUpstreamBody,
  defineModuleBody,
  Loose,
  Optional,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { AlbumSummary, Artist, SimpleAlbum } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

// 文档只约定 `type=mobile` 走移动端，其他值继续按 web 建议处理；`keywords` 省略时仍按空文本查询。
export type ModuleInput = {
  keywords?: string;
  type?: string;
};

const inputSchema = Schema.Struct({
  keywords: Schema.optional(Schema.String),
  type: Schema.optional(Schema.String),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const SuggestedSong = UpstreamObject({
  id: Schema.Finite,
  name: Loose(Schema.String),
  album: Loose(SimpleAlbum),
  alias: Schema.String.pipe(Schema.Array, Loose),
  artists: Artist.pipe(Schema.Array, Loose),
  copyrightId: Loose(Schema.Finite),
  duration: Loose(Schema.Finite),
  fee: Loose(Schema.Finite),
  ftype: Loose(Schema.Finite),
  mark: Loose(Schema.Finite),
  mvid: Loose(Schema.Finite),
  rtype: Loose(Schema.Finite),
  status: Loose(Schema.Finite),
  transNames: Schema.String.pipe(Schema.Array, Loose),
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
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  UpstreamObject({
    code: Schema.Literal(200),
    result: UpstreamObject({
      songs: SuggestedSong.pipe(Schema.Array, Optional),
      artists: SuggestedArtist.pipe(Schema.Array, Optional),
      albums: AlbumSummary.pipe(Schema.Array, Optional),
      playlists: SuggestedPlaylist.pipe(Schema.Array, Optional),
      allMatch: AllMatch.pipe(Schema.Array, Optional),
      order: Schema.String.pipe(Schema.Array, Loose),
    }),
  }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

export const moduleActions = {
  mobile: {
    target: '/api/search/suggest/keyword',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'read',
  },
  web: {
    target: '/api/search/suggest/web',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'read',
  },
} as const satisfies ModuleActions;

const searchSuggest: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      s: query.keywords || '',
    };
    const action = query.type === 'mobile' ? 'mobile' : 'web';
    const response = yield* request(action, { data });
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
