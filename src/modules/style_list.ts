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

// 曲风记录在三层嵌套里字段相同；顶层和子层共用这一组宽松字段。
const TagFields = {
  colorDeep: Loose(Schema.String),
  colorShallow: Loose(Schema.String),
  enName: Loose(Schema.String),
  level: Loose(Schema.Finite),
  link: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  showText: Loose(Schema.String),
  tabs: Loose(Schema.Array(Schema.String)),
  tagName: Loose(Schema.String),
};

// 第三层曲风的 `childrenTags` 在录制里只见过 `null`，没有声明，原样保留。
const LeafTag = UpstreamObject({
  ...TagFields,
  tagId: Loose(Schema.Finite),
});

const ChildTag = UpstreamObject({
  ...TagFields,
  tagId: Loose(Schema.Finite),
  childrenTags: Loose(Schema.Array(LeafTag)),
});

const Tag = UpstreamObject({
  ...TagFields,
  tagId: Schema.Finite,
  childrenTags: Loose(Schema.Array(ChildTag)),
});

// 通到曲风列表的路径 `data` 和每个曲风的编号 `data[].tagId` 收紧；子曲风在宽松字段里，编号也宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(Tag),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const styleList: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request(
      buildApiRequestIntent(
        `/api/tag/list/get`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('style_list', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 曲风列表
 */
export default styleList;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
