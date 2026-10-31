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
} from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 相似歌曲记录是旧版歌曲结构，复用 `ProgramMainSong`，另声明录制里非 null 的字段；只见过 null 或空数组的字段未声明。
const SimiSong = UpstreamObject({
  ...ProgramMainSong.schema.fields,
  id: Schema.Finite,
  alg: Loose(Schema.String),
  alias: Loose(Schema.Array(Schema.String)),
  mp3Url: Loose(Schema.String),
  privilege: Loose(LooseSongPrivilege),
  recommendReason: Loose(Schema.String),
  sqMusic: Loose(ProgramQuality),
  transNames: Loose(Schema.Array(Schema.String)),
});

// 通到相似歌曲列表的路径 `songs` 和每首歌的编号收紧（复用 `SimiSong`）；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    songs: Schema.Array(SimiSong),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const simiSong: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      songid: query.id,
      limit: query.limit || 50,
      offset: query.offset || 0,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/v1/discovery/simiSong`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('simi_song', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 相似歌曲
 */
export default simiSong;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
