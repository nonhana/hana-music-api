import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';

import {
  decodeModuleInput as decodeInput,
  NumberId,
} from '../core/module-input.ts';
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
import type { ModuleEffect } from '../types/index.ts';

// `ab` 是上游 A/B 分流值，省略时仍用 `b`；`id` 是要查乐谱的歌曲编号。
export type ModuleInput = {
  ab?: string;
  id: NumberId;
};

const inputSchema = Schema.Struct({
  ab: Schema.optional(Schema.String),
  id: NumberId,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/music/sheet/list/v1',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

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
  type: Instrument.pipe(Schema.Array, Loose),
});

const SheetListData = UpstreamObject({
  errorCode: Loose(Schema.Finite),
  findSheet: Loose(Schema.Finite),
  musicSheetSimpleInfoVOS: Sheet.pipe(Schema.Array, Optional),
  sheetInstrumentTypeVOList: Instrument.pipe(Schema.Array, Optional),
  uploadSheet: Loose(Schema.Finite),
});

// 返回码、乐谱列表的路径 `data.musicSheetSimpleInfoVOS` 和每份乐谱自己的编号 `id` 收紧；
// 没有乐谱时两个列表都是 null，按可以没有处理；展示和筛选项字段全部宽松。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  UpstreamObject({
    code: Schema.Literal(200),
    data: SheetListData,
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

const sheetList: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      id: String(query.id),
      abTest: query.ab || 'b',
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody('sheet_list', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 乐谱列表
 */
export default sheetList;
