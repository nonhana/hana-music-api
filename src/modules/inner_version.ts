import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';

import {
  decodeModuleInput as decodeInput,
  EmptyInput,
} from '../core/module-input.ts';
import type { NoInput } from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { SERVICE_VERSION } from '../core/service-metadata.ts';
import type { BodyType } from '../core/upstream-body.ts';
import { defineModuleBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {} as const satisfies ModuleActions;

export type ModuleInput = NoInput;

const inputSchema = EmptyInput;

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input).pipe(Effect.as({}));

// 返回码和版本号路径 data.version 收紧；接口就是为了拿构建内联的 package.json 版本号。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      version: Schema.String,
    }),
  }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

const innerVersion: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = () =>
  Effect.succeed({
    status: 200,
    cookie: [],
    body: { code: 200, data: { version: SERVICE_VERSION } },
  });

export default innerVersion;
