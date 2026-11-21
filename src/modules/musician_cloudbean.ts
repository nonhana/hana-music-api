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
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/cloudbean/get',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

export type ModuleInput = NoInput;

const inputSchema = EmptyInput;

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input).pipe(Effect.as({}));

const CloudbeanData = UpstreamObject({
  artistId: Schema.Finite,
  cloudBean: Schema.Finite,
  maxCloudBean: Loose(Schema.Finite),
  needPop: Loose(Schema.Boolean),
  signed: Loose(Schema.Boolean),
});

// 返回码、云豆对象 `data`、音乐人自己的编号 `data.artistId` 和接口要拿的云豆数 `data.cloudBean` 收紧；
// 其余声明字段宽松，未声明字段原样保留（`musicianLevel`、`flowStage`、`dynamicNews` 只见过 `null`）。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  UpstreamObject({
    code: Schema.Literal(200),
    data: CloudbeanData,
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

const musicianCloudbean: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (_query, request) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody(
      'musician_cloudbean',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 账号云豆数
 */
export default musicianCloudbean;
