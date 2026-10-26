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
} from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 私人 FM 的旧版歌曲：节目记录的歌曲字段原样复用，另补录制里出现的推荐理由和旧版字段；
// 每首歌自己的 `id` 收紧，其余字段宽松。
const FmSong = UpstreamObject({
  ...ProgramMainSong.schema.fields,
  id: Schema.Finite,
  alg: Loose(Schema.String),
  alias: Loose(Schema.Array(Schema.String)),
  fmRecReason: Loose(Schema.String),
  privilege: Loose(LooseSongPrivilege),
  reason: Loose(Schema.String),
  reasonId: Loose(Schema.String),
  transName: Loose(Schema.String),
  transNames: Loose(Schema.Array(Schema.String)),
});

// 通到私人 FM 歌曲列表的 `data` 和每首歌自己的编号 `data[].id` 收紧；`extTransMap` 是附带
// 推荐理由，`tag` 只见过 null，未声明并原样保留；响应与 `personal_fm_mode` 同构。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(FmSong),
    extTransMap: Loose(UpstreamObject({})),
    popAdjust: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const personalFm: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        `/api/v1/radio/get`,
        {},
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('personal_fm', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 私人FM
 */
export default personalFm;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
