import { Effect, Schema } from 'effect';
import * as QRCode from 'qrcode';

import { Call } from '../core/call.ts';
import { ModuleInvariantFailed } from '../core/errors.ts';
import { generateChainId } from '../core/utils.ts';
import type { ModuleEffect } from '../types/index.ts';
import { decodeModuleInput as decodeInput } from './_input.ts';

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
    Schema.Union([Schema.Boolean, Schema.Number, Schema.String]),
  ),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const loginQrCreate: ModuleEffect<ModuleInput> = (query) =>
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
      body: { code: 200, data: { qrurl: url, qrimg } },
      cookie: [],
    };
  });

export default loginQrCreate;
