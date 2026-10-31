import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// `MusicQuality` 只有本模块使用，按三模块门槛留在本地。
const MusicQuality = UpstreamObject({
  br: Loose(Schema.Finite),
  fid: Loose(Schema.Finite),
  it: Loose(Schema.String),
  size: Loose(Schema.Finite),
  sr: Loose(Schema.Finite),
  vd: Loose(Schema.Finite),
});

// 通到音质详情的路径 `data` 和歌曲自己的编号 `data.songId` 收紧；各档音质（有的整档是 null）、`sks` 和状态字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      songId: Schema.Finite,
      h: Loose(MusicQuality),
      m: Loose(MusicQuality),
      l: Loose(MusicQuality),
      sq: Loose(MusicQuality),
      vi: Loose(MusicQuality),
      sk: Loose(MusicQuality),
      sks: Loose(Schema.Array(MusicQuality)),
      jm: Loose(MusicQuality),
      je: Loose(MusicQuality),
    }),
    error: Loose(Schema.Boolean),
    message: Loose(Schema.String),
    success: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const songMusicDetail: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      songId: query.id,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/song/music/detail/get`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'song_music_detail',
      ModuleBody,
      response,
    );
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 歌曲音质详情
 */
export default songMusicDetail;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
