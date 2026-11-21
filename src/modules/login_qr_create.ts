import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';

import { Call } from '../core/call-context.ts';
import { decodeModuleInput as decodeInput } from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import type { BodyType } from '../core/upstream-body.ts';
import { defineModuleBody } from '../core/upstream-body.ts';
import { generateChainId } from '../core/utils.ts';
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {} as const satisfies ModuleActions;

export type ModuleInput = {
  key: string;
  platform?: 'pc' | 'web';
};

const inputSchema = Schema.Struct({
  key: Schema.String,
  platform: Schema.optional(Schema.Literals(['pc', 'web'])),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 返回码与登录链接路径均为接口核心输出，全部声明为必填字段。
// 返回体由 SDK 构造，仅包含登录链接 `qrurl`。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  Schema.Struct({
    code: Schema.Literal(200),
    data: Schema.Struct({ qrurl: Schema.String }),
  }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

const loginQrCreate: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query) =>
  Effect.gen(function* () {
    const call = yield* Call;
    let url = `https://music.163.com/login?codekey=${query.key}`;
    if ((query.platform || 'pc') === 'web') {
      url += `&chainId=${generateChainId(call.identity.cookie)}`;
    }
    return {
      status: 200,
      body: { code: 200 as const, data: { qrurl: url } },
      cookie: [],
    };
  });

export default loginQrCreate;
