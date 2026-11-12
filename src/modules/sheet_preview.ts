import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

// `id` 是乐谱编号（不是歌曲编号）。
export type ModuleInput = { id: NumberId };

const inputSchema = Schema.Struct({ id: NumberId });

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/music/sheet/preview/info',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

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

const sheetPreview: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: String(query.id),
    };
    const response = yield* request('request', { data });
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
