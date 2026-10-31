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

const Instrument = UpstreamObject({
  code: Loose(Schema.Finite),
  icon: Loose(Schema.String),
  name: Loose(Schema.String),
});

const Sheet = UpstreamObject({
  id: Schema.Finite,
  bpm: Loose(Schema.Finite),
  chordName: Loose(Schema.String),
  commentNum: Loose(Schema.Finite),
  coverImageUrl: Loose(Schema.String),
  difficulty: Loose(Schema.String),
  musicKey: Loose(Schema.String),
  name: Loose(Schema.String),
  playVersion: Loose(Schema.String),
  sheetPackageId: Loose(Schema.Finite),
  source: Loose(Schema.Finite),
  sourceDesc: Loose(Schema.String),
  totalPageSize: Loose(Schema.Finite),
  type: Loose(Schema.Array(Instrument)),
});

const SheetListData = UpstreamObject({
  errorCode: Loose(Schema.Finite),
  findSheet: Loose(Schema.Finite),
  musicSheetSimpleInfoVOS: Optional(Schema.Array(Sheet)),
  sheetInstrumentTypeVOList: Optional(Schema.Array(Instrument)),
  uploadSheet: Loose(Schema.Finite),
});

// 返回码、乐谱列表的路径 `data.musicSheetSimpleInfoVOS` 和每份乐谱自己的编号 `id` 收紧；
// 没有乐谱时两个列表都是 null，按可以没有处理；展示和筛选项字段全部宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: SheetListData,
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const sheetList: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
      abTest: query.ab || 'b',
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/music/sheet/list/v1`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody('sheet_list', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 乐谱列表
 */
export default sheetList;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
