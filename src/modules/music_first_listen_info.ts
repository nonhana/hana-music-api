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

const FirstListenSongInfo = UpstreamObject({
  songId: Schema.Finite,
  songName: Loose(Schema.String),
  singer: Loose(Schema.String),
  pubTime: Loose(Schema.Finite),
  coverUrl: Loose(Schema.String),
  type: Loose(Schema.Finite),
});

const FirstListenInfo = UpstreamObject({
  date: Schema.String,
  season: Loose(Schema.String),
  period: Loose(Schema.String),
  time: Loose(Schema.String),
  meetDuration: Loose(Schema.String),
  meetDurationDesc: Loose(Schema.String),
  listenTime: Loose(Schema.Finite),
});

const TotalPlayInfo = UpstreamObject({
  playCount: Loose(Schema.Finite),
  duration: Loose(Schema.Finite),
  text: Loose(Schema.String),
});

const LikeSongInfo = UpstreamObject({
  text: Loose(Schema.String),
  like: Loose(Schema.Boolean),
  collect: Loose(Schema.Boolean),
  redTime: Loose(Schema.String),
  redDesc: Loose(Schema.String),
  redTimeStamp: Loose(Schema.Finite),
});

// 通到回忆坐标的 `data`、歌曲编号 `data.songInfoDto.songId` 和首次收听时间 `data.musicFirstListenDto.date` 收紧；
// 匿名调用 `data` 是空对象，各信息块按可以没有处理；缺少 `id` 时上游 HTTP 400 空正文被归一成 `status: 200`，
// 空字符串作为独立分支保留。
export const ModuleBody = Schema.toStandardSchemaV1(
  Schema.Union([
    UpstreamObject({
      code: Schema.Literal(200),
      data: UpstreamObject({
        songInfoDto: Optional(FirstListenSongInfo),
        musicFirstListenDto: Optional(FirstListenInfo),
        musicTotalPlayDto: Optional(TotalPlayInfo),
        musicLikeSongDto: Optional(LikeSongInfo),
      }),
      message: Loose(Schema.String),
    }),
    Schema.Literal(''),
  ]).annotate({ expected: 'object with code 200 or an empty string' }),
);
export type ModuleBody = typeof ModuleBody.Type;

const musicFirstListenInfo: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      songId: query.id,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/content/activity/music/first/listen/info`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'music_first_listen_info',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 回忆坐标
 */
export default musicFirstListenInfo;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
