import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Song } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const BlockTitle = UpstreamObject({
  artistId: Loose(Schema.Finite),
  artistName: Loose(Schema.String),
  artistUserId: Loose(Schema.Finite),
  artisAlias: Loose(Schema.String),
  artisTransName: Loose(Schema.String),
  imgUrl: Loose(Schema.String),
  publishDate: Loose(Schema.String),
  publishTime: Loose(Schema.Finite),
  resourceId: Loose(Schema.Finite),
  resourceName: Loose(Schema.String),
  resourcePicUrl: Loose(Schema.String),
});

const NewSongBlock = UpstreamObject({
  accompanimentIds: Loose(Schema.Array(Schema.Finite)),
  albumId: Loose(Schema.Finite),
  albumSongCount: Loose(Schema.Finite),
  blockTitle: Loose(BlockTitle),
  blockType: Loose(Schema.String),
  publishTime: Loose(Schema.Finite),
  songLists: Schema.Array(Song),
});

// 通到新单曲作品的路径 `data.newWorks` 和每首歌的编号 `songLists[].id` 收紧；匿名时返回空数组，空数组是正常结果。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    message: Loose(Schema.String),
    data: UpstreamObject({
      hasMore: Loose(Schema.Boolean),
      newSongCount: Loose(Schema.Finite),
      newWorks: Schema.Array(NewSongBlock),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const artistNewSong: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 20,
      startTimestamp: query.before || Date.now(),
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/sub/artist/new/works/song/list`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'artist_new_song',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

export default artistNewSong;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
