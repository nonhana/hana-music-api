import { createHash } from 'node:crypto';

import { Effect, Schema } from 'effect';

import { Call } from '../core/call.ts';
import { UnexpectedUpstreamShape } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import { decodeModuleInput as decodeInput } from './_input.ts';

export type ModuleInput = {};

const inputSchema = Schema.Struct({});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input).pipe(Effect.as({}));

const ID_XOR_KEY_1 = '3go8&$8*3*3h0k(2)2';

const encodeDeviceId = (deviceId: string) => {
  let xoredString = '';
  for (let index = 0; index < deviceId.length; index += 1) {
    xoredString += String.fromCharCode(
      deviceId.charCodeAt(index) ^
        ID_XOR_KEY_1.charCodeAt(index % ID_XOR_KEY_1.length),
    );
  }
  return createHash('md5').update(xoredString, 'utf8').digest('base64');
};

const registerAnonymous: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const deviceId = (yield* Call).identity.state.deviceId;
    const username = Buffer.from(
      `${deviceId} ${encodeDeviceId(deviceId)}`,
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
      return yield* Effect.fail(
        new UnexpectedUpstreamShape({
          module: 'register_anonimous',
          path: 'body.code',
          expected: 'number',
          actual: typeof body,
        }),
      );
    }
    if (body.code !== 200) {
      return toModuleResponse(result);
    }
    if (!result.cookie.some((cookie) => /^MUSIC_A=[^;]+/.test(cookie))) {
      return yield* Effect.fail(
        new UnexpectedUpstreamShape({
          module: 'register_anonimous',
          path: 'cookie.MUSIC_A',
          expected: 'nonempty credential',
          actual: 'missing',
        }),
      );
    }
    return toModuleResponse({
      ...result,
      status: 200,
      body: { ...body, cookie: result.cookie.join(';') },
    });
  });

export default registerAnonymous;
