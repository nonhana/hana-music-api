import { Effect, Schema } from 'effect';

import { Call } from '../core/call.ts';
import { USER_AGENT_MAP } from '../core/config.ts';
import { InvalidRequest } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleCallConfig, ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({ code: Schema.Literal(200) }),
);
export type ModuleBody = typeof ModuleBody.Type;

const webUserAgent = USER_AGENT_MAP.weapi.pc;

const resolveCheckToken = (
  value: NonNullable<ModuleCallConfig['checkToken']>,
) =>
  typeof value === 'function'
    ? Effect.tryPromise({
        try: value,
        catch: () =>
          new InvalidRequest({ message: 'checkToken provider failed' }),
      })
    : Effect.succeed(value);

const playlistSubscribe: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const call = yield* Call;
    const subscribe = Number(query.t) === 1;
    const path = subscribe ? 'subscribe' : 'unsubscribe';
    const configuredToken = call.config.checkToken;
    const tokenSubscribe = subscribe && configuredToken !== undefined;
    const checkToken = tokenSubscribe
      ? yield* resolveCheckToken(configuredToken)
      : undefined;

    if (tokenSubscribe && !checkToken) {
      return yield* new InvalidRequest({
        message: 'checkToken must not be empty',
      });
    }

    const response = yield* request(
      buildApiRequestIntent(
        `/api/playlist/${path}`,
        subscribe && checkToken
          ? { id: query.id, checkToken }
          : { id: query.id },
        tokenSubscribe
          ? {
              crypto: 'weapi',
              headers: checkToken ? { 'X-antiCheatToken': checkToken } : {},
            }
          : createOption(query, 'weapi'),
      ),
    ).pipe(
      Effect.updateService(Call, (current) => ({
        ...current,
        config: {
          ...current.config,
          crypto: 'weapi' as const,
          ua: webUserAgent,
        },
        identity: {
          ...current.identity,
          cookie: { ...current.identity.cookie, os: 'web' },
        },
      })),
    );

    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody(
        'playlist_subscribe',
        ModuleBody,
        response,
      ),
    };
  });

export default playlistSubscribe;
export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
