import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const captchaSent: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      ctcode: query.ctcode || '86',
      secrete: 'music_middleuser_pclogin',
      cellphone: query.phone,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/sms/captcha/sent`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 发送验证码
 */
export default captchaSent;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
