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

const SheetPage = UpstreamObject({
  id: Schema.Finite,
  md5: Loose(Schema.String),
  pageNumber: Loose(Schema.Finite),
  sheetId: Loose(Schema.Finite),
  size: Loose(Schema.Finite),
  url: Schema.String,
});

// 返回码、乐谱页列表 `data`、每页自己的编号 `id` 和取图地址 `url` 收紧；
// 不存在的乐谱返回空数组。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(SheetPage),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const sheetPreview: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/music/sheet/preview/info`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'sheet_preview',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 乐谱预览
 */
export default sheetPreview;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
