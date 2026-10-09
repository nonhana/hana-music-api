import { Effect, Schema } from 'effect';
import * as QRCode from 'qrcode';

import { Call } from '../core/call.ts';
import { ModuleInvariantFailed } from '../core/errors.ts';
import { decodeModuleInput as decodeInput } from '../core/module-input.ts';
import { generateChainId } from '../core/utils.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  key: string;
  platform?: 'pc' | 'web' | (string & {});
  qrimg?: boolean | number | string;
};

const inputSchema = Schema.Struct({
  key: Schema.String,
  platform: Schema.optional(
    Schema.Union([Schema.Literal('pc'), Schema.Literal('web'), Schema.String]),
  ),
  qrimg: Schema.optional(
    Schema.Union([Schema.Boolean, Schema.Finite, Schema.String]),
  ),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 返回体由 SDK 自己拼出，`qrimg` 只在请求了图片时才有内容，否则是空串。
export const ModuleBody = Schema.toStandardSchemaV1(
  Schema.Struct({
    code: Schema.Literal(200),
    data: Schema.Struct({ qrurl: Schema.String, qrimg: Schema.String }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const loginQrCreate: ModuleEffect<ModuleInput, ModuleBody> = (query) =>
  Effect.gen(function* () {
    const call = yield* Call;
    let url = `https://music.163.com/login?codekey=${query.key}`;
    if ((query.platform || 'pc') === 'web') {
      url += `&chainId=${generateChainId(call.identity.cookie)}`;
    }
    const qrimg = query.qrimg
      ? yield* Effect.tryPromise({
          try: () => QRCode.toDataURL(url),
          catch: (error) =>
            new ModuleInvariantFailed({ message: String(error) }),
        })
      : '';
    return {
      status: 200,
      body: { code: 200 as const, data: { qrurl: url, qrimg } },
      cookie: [],
    };
  });

export default loginQrCreate;
