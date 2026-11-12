import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  EmptyInput,
} from '../core/module-input.ts';
import type { NoInput } from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = NoInput;

const inputSchema = EmptyInput;

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input).pipe(Effect.as({}));

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/voice/broadcast/category/region/get',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const Category = UpstreamObject({
  id: Schema.Finite,
  name: Loose(Schema.String),
});

const Region = UpstreamObject({
  id: Schema.Finite,
  name: Loose(Schema.String),
});

// 通到分类和地区列表的路径 `data.categoryList`、`data.regionList` 以及每条分类/地区自己的编号收紧。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      categoryList: Schema.Array(Category),
      regionList: Schema.Array(Region),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const broadcastCategoryRegionGet: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (_query, request) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody(
      'broadcast_category_region_get',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 广播电台 - 分类/地区信息
 */
export default broadcastCategoryRegionGet;
