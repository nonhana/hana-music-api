import { Effect, Schema } from 'effect';

import { SERVICE_VERSION } from '../core/service-metadata.ts';
import { UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 返回码和版本号路径 data.version 收紧；接口就是为了拿构建内联的 package.json 版本号。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      version: Schema.String,
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const innerVersion: ModuleEffect<ModuleInput, ModuleBody> = () =>
  Effect.succeed({
    status: 200,
    cookie: [],
    body: { code: 200, data: { version: SERVICE_VERSION } },
  });

export default innerVersion;
export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
