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

// 新歌记录共用 `Song`，另声明旧式歌曲字段；它们都是附带信息，全部宽松。
const NewSong = UpstreamObject({
  ...Song.schema.fields,
  popularity: Loose(Schema.Finite),
  starred: Loose(Schema.Boolean),
  score: Loose(Schema.Finite),
  position: Loose(Schema.Finite),
  exclusive: Loose(Schema.Boolean),
  playedNum: Loose(Schema.Finite),
  dayPlays: Loose(Schema.Finite),
  hearTime: Loose(Schema.Finite),
  starredNum: Loose(Schema.Finite),
});

// 通到新歌列表的路径 `data` 和每首歌的编号收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(NewSong),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const topSong: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      areaId: query.type || 0, // 全部:0 华语:7 欧美:96 日本:8 韩国:16
      // limit: query.limit || 100,
      // offset: query.offset || 0,
      total: true,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/v1/discovery/new/songs`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('top_song', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 新歌速递
 */
export default topSong;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
