import { Effect, Schema } from 'effect';

import { Call } from '../core/call.ts';
import { UnexpectedUpstreamShape } from '../core/errors.ts';
import { decodeModuleInput as decodeInput } from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { encodeAnonymousDeviceId } from '../core/utils.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {};

const inputSchema = Schema.Struct({});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input).pipe(Effect.as({}));

const registerAnonymous: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const deviceId = (yield* Call).identity.state.deviceId;
    const username = Buffer.from(
      `${deviceId} ${encodeAnonymousDeviceId(deviceId)}`,
      'utf8',
    ).toString('base64');
    const result = yield* request(
      buildApiRequestIntent(
        '/api/register/anonimous',
        { username },
        createOption(query, 'weapi'),
      ),
    );
    const body = result.body;
    if (
      body === null ||
      typeof body !== 'object' ||
      Array.isArray(body) ||
      typeof body.code !== 'number'
    ) {
      return yield* new UnexpectedUpstreamShape({
        module: 'register_anonimous',
        path: 'body.code',
        expected: 'number',
        actual: typeof body,
      });
    }
    if (body.code !== 200) {
      return toModuleResponse(result);
    }
    if (!result.cookie.some((cookie) => /^MUSIC_A=[^;]+/.test(cookie))) {
      return yield* new UnexpectedUpstreamShape({
        module: 'register_anonimous',
        path: 'cookie.MUSIC_A',
        expected: 'nonempty credential',
        actual: 'missing',
      });
    }
    return toModuleResponse({
      ...result,
      status: 200,
      body: { ...body, cookie: result.cookie.join(';') },
    });
  });

export default registerAnonymous;
