import { Clock, Effect } from 'effect';

import { buildCallServices, Call, runCall } from '../../src/core/call.ts';
import { ProtocolFailed } from '../../src/core/errors.ts';
import { decodeLegacyModuleInput } from '../../src/core/module-input.ts';
import type { ModuleActions } from '../../src/core/request-actions.ts';
import {
  buildActionRequestIntent,
  buildPlainActionRequestIntent,
} from '../../src/core/request-intent.ts';
import { requestEffect, runRequestAtEdge } from '../../src/core/request.ts';
import type {
  CreateRequestOptions,
  ModuleCallConfig,
  ModuleEffect,
  ModuleQuery,
  NcmApiResponse,
  RequestCapability,
  UnknownJson,
} from '../../src/types/index.ts';

export type MockRequestHandler = (
  uri: string,
  data: Record<string, unknown>,
  options?: CreateRequestOptions,
) => Promise<NcmApiResponse> | NcmApiResponse;

// 模块返回体的类型由调用点决定：mock 本体是 legacy 响应，测试里要断言成具体 Body。
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters
export const moduleResponse = <Body = UnknownJson>(
  response: NcmApiResponse,
): {
  status: number;
  cookie: Array<string>;
  body: Body;
} => ({ ...response, body: response.body as Body });

export const mockRequest =
  (handler: MockRequestHandler): RequestCapability =>
  (intent) =>
    intent.protocol === 'plain'
      ? requestEffect(intent)
      : Effect.gen(function* () {
          const call = yield* Call;
          const now = yield* Clock.currentTimeMillis;
          const remaining =
            call.deadlineAt === undefined ? undefined : call.deadlineAt - now;
          const timeoutMs =
            call.policy.stageTimeoutMs === undefined
              ? remaining
              : Math.min(remaining ?? Infinity, call.policy.stageTimeoutMs);
          const response = yield* Effect.tryPromise({
            try: (signal) =>
              Promise.resolve(
                handler(
                  intent.target,
                  JSON.parse(String(intent.body ?? '{}')),
                  {
                    ...call.config,
                    crypto: intent.protocol === 'plain' ? '' : intent.protocol,
                    signal,
                    timeoutMs,
                    ...(intent.headers['x-aeapi'] ? { acceptGzip: true } : {}),
                    ...(intent.headers['User-Agent']
                      ? { ua: intent.headers['User-Agent'] }
                      : {}),
                    headers: {
                      ...intent.headers,
                    },
                  },
                ),
              ),
            catch: (error) =>
              ProtocolFailed.make({
                message: 'Custom request failed',
                response: {
                  ...(error as NcmApiResponse),
                  headers: new Headers(),
                  body: (error as NcmApiResponse).body as UnknownJson,
                  cookie: (error as NcmApiResponse).cookie ?? [],
                },
              }),
          });
          return {
            ...response,
            headers: new Headers(),
            body: response.body as UnknownJson,
          };
        });

export const testRequest = (
  request: RequestCapability,
  uri: string,
  data: Record<string, unknown> = {},
  options: CreateRequestOptions = {},
) =>
  Effect.gen(function* () {
    const call = yield* Call;
    const selected = Object.entries(call.actions).find(
      ([, action]) => action.target === uri,
    );
    if (!selected)
      throw new Error(`Test must declare its request action: ${uri}`);
    const [name, action] = selected;
    const response = yield* request(
      buildActionRequestIntent(name, action, data, uri, options.headers),
    );
    return {
      status: response.status,
      cookie: [...response.cookie],
      body: response.body,
    };
  });

export const testPlainRequest = (
  request: RequestCapability,
  url: string,
  options: { method?: string } = {},
) =>
  Effect.gen(function* () {
    const call = yield* Call;
    const selected = Object.entries(call.actions).find(
      ([, action]) => action.method === (options.method ?? 'GET'),
    );
    if (!selected)
      throw new Error(`Test must declare its plain action: ${url}`);
    const [name, action] = selected;
    return yield* request(
      buildPlainActionRequestIntent(
        name,
        action as Parameters<typeof buildPlainActionRequestIntent>[1],
        url,
      ),
    );
  });

export const plainRequest = (options: ModuleCallConfig) => (url: string) =>
  runRequestAtEdge(
    {
      target: url,
      protocol: 'plain',
      method: 'GET',
      headers: {},
      response: 'bytes',
      semantic: 'read',
    },
    options,
  );

export const moduleRuntime = (
  ttlMs: number | null = 120_000,
  actions: ModuleActions = {
    request: {
      profile: 'api',
      target: '/api/search/get',
      semantic: 'read',
      cache: 'shared',
      retry: 'read',
    },
  },
) => {
  // shape 值直接持有（服务集无 scope 资源），供 runCall 与快照读取共用。
  const scoped = buildCallServices(
    { cache: ttlMs === null ? { enabled: false } : { ttlMs } },
    false,
  );
  const services = scoped;
  return {
    get snapshot() {
      return scoped.reads.snapshot;
    },
    invoke: (
      identifier: string,
      execute: ModuleEffect<ModuleQuery>,
      input: ModuleQuery,
      config: ModuleCallConfig = {},
    ) => {
      const { signal, ...callConfig } = config;
      return runCall(
        { identifier, input, config: callConfig, signal },
        services,
        {
          identifier,
          actions,
          route: '/' + identifier,
          decodeInput: decodeLegacyModuleInput,
          execute,
        },
      );
    },
  };
};

// 显式测试合同只服务探针，不借真实业务模块的配置覆盖协议或策略。
export const probeReadActions = {
  example: {
    profile: 'api',
    target: '/api/example',
    semantic: 'read',
    cache: 'shared',
    retry: 'read',
  },
  read: {
    profile: 'api',
    target: '/api/search/get',
    semantic: 'read',
    cache: 'shared',
    retry: 'read',
  },
  test: {
    profile: 'api',
    target: '/api/test',
    semantic: 'read',
    cache: 'shared',
    retry: 'read',
  },
} as const satisfies ModuleActions;
export const probeWriteActions = {
  like: {
    profile: 'api',
    target: '/api/like',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
  radio: {
    profile: 'web',
    target: '/api/radio/like',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;
export const probeUploadActions = {
  token: {
    profile: 'api',
    target: '/api/nos/token/alloc',
    semantic: 'upload',
    cache: 'none',
    retry: 'never',
  },
  part: {
    profile: 'plainVoice',
    target: '/test',
    semantic: 'upload',
    cache: 'none',
    retry: 'never',
    method: 'PUT',
    response: 'bytes',
  },
} as const satisfies ModuleActions;
