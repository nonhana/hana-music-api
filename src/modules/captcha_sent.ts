import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({ code: Schema.Literal(200), data: Schema.Boolean }),
);
export type ModuleBody = typeof ModuleBody.Type;

const captchaSent: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      ctcode: query.ctcode || '86',
      secrete: 'music_middleuser_pclogin',
      cellphone: query.phone,
    };
    const result = yield* request(
      buildApiRequestIntent(
        `/api/sms/captcha/sent`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    return {
      ...toModuleResponse(result),
      body: yield* decodeUpstreamBody('captcha_sent', ModuleBody, result),
    };
  });

/**
 * 发送验证码
 */
export default captchaSent;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
