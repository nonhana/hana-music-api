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

const TodaySong = UpstreamObject({
  aliasName: Loose(Schema.String),
  artists: Loose(
    Schema.Array(
      UpstreamObject({
        artistId: Loose(Schema.Finite),
        artistName: Loose(Schema.String),
      }),
    ),
  ),
  lastPlayTime: Loose(Schema.Finite),
  picId: Loose(Schema.Finite),
  picUrl: Loose(Schema.String),
  redStar: Loose(Schema.Boolean),
  songId: Schema.Finite,
  songName: Loose(Schema.String),
});

// 通到今日收听列表的路径 `data.songDTOs` 和每首歌自己的 `songId` 收紧；其余字段宽松，空列表是空数组。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      songDTOs: Schema.Array(TodaySong),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const listenDataTodaySong: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        `/api/content/activity/listen/data/today/song/play/rank`,
        {},
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'listen_data_today_song',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 听歌足迹 - 今日收听
 */
export default listenDataTodaySong;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
