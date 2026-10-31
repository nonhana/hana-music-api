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

const Track = UpstreamObject({
  id: Schema.Finite,
  artist: Loose(Schema.String),
  audio: Loose(Schema.String),
  blurCover: Loose(Schema.String),
  channelId: Loose(Schema.Finite),
  cover: Loose(Schema.String),
  duration: Loose(Schema.Finite),
  name: Loose(Schema.String),
  offset: Loose(Schema.Finite),
  source: Loose(Schema.Finite),
  wave: Loose(Schema.Array(Schema.Finite)),
});

// 通到频道播放列表的路径 `data.list` 和每个曲目自己的编号 `data.list[].id` 收紧；封面、音频地址、波形和总数宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      list: Schema.Array(Track),
      total: Loose(Schema.Finite),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djDifmPlayingTracksList: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 5,
      source: query.source || 0,
      channelId: query.channelId,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/dj/difm/playing/tracks/list`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'dj_difm_playing_tracks_list',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * DIFM电台 - 播放列表
 */
export default djDifmPlayingTracksList;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
