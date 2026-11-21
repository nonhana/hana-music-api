import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';

import {
  decodeModuleInput as decodeInput,
  EmptyInput,
} from '../core/module-input.ts';
import type { NoInput } from '../core/module-input.ts';
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

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/pc/recent/listen/list',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const RecentResource = UpstreamObject({
  resourceId: Schema.Finite,
  resourceType: Loose(Schema.String),
  subResourceId: Loose(Schema.String),
  title: Loose(Schema.String),
  tag: Loose(Schema.String),
  coverUrlList: Schema.String.pipe(Schema.Array, Loose),
  landingUrl: Loose(Schema.String),
  update: Loose(Schema.Boolean),
  playOrUpdateTime: Loose(Schema.Finite),
  star: Loose(Schema.Boolean),
  coverCenter: Loose(Schema.Boolean),
});

// 通到最近常听列表的 `data.resources` 和各条记录自己的 `resourceId` 收紧；
// 匿名调用 `data.resources` 是 `null`，按可以没有处理；标题、封面和展示字段宽松。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      title: Loose(Schema.String),
      resources: RecentResource.pipe(Schema.Array, Optional),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

export type ModuleInput = NoInput;

const inputSchema = EmptyInput;

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input).pipe(Effect.as({}));

const recentListenList: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (_query, request) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody(
      'recent_listen_list',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 最近听歌列表
 */
export default recentListenList;
