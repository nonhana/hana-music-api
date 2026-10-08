import { Clock, Effect } from 'effect';

import { buildCallServices, Call, runCall } from '../../src/core/call.ts';
import { requestSemantic } from '../../src/core/endpoint-policy.ts';
import { ProtocolFailed } from '../../src/core/errors.ts';
import { decodeLegacyModuleInput } from '../../src/core/module-input.ts';
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

export const moduleResponse = (
  response: NcmApiResponse,
): {
  status: number;
  cookie: Array<string>;
  body: UnknownJson;
} => ({ ...response, body: response.body as UnknownJson });

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
                    crypto:
                      call.config.crypto ||
                      (intent.protocol === 'plain' ? '' : intent.protocol),
                    signal,
                    timeoutMs,
                    ...(intent.headers['X-antiCheatToken']
                      ? { checkToken: true }
                      : {}),
                    ...(intent.headers['x-aeapi'] ? { acceptGzip: true } : {}),
                    ...(intent.headers['User-Agent']
                      ? { ua: call.config.ua || intent.headers['User-Agent'] }
                      : {}),
                    headers: {
                      ...call.config.headers,
                      ...Object.fromEntries(
                        Object.entries(intent.headers).filter(
                          ([name]) => name !== 'X-antiCheatToken',
                        ),
                      ),
                    },
                  },
                ),
              ),
            catch: (error) =>
              new ProtocolFailed({
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
  request({
    target: uri,
    protocol: options.crypto || 'api',
    method: 'POST',
    headers: options.headers ?? {},
    body: JSON.stringify(data),
    response: 'json',
    semantic: requestSemantic(uri),
  }).pipe(
    Effect.map((response) => ({
      status: response.status,
      cookie: [...response.cookie],
      body: response.body,
    })),
  );

export const testPlainRequest = (
  request: RequestCapability,
  url: string,
  options: { method?: string } = {},
) =>
  request({
    target: url,
    protocol: 'plain',
    method: options.method ?? 'GET',
    headers: {},
    response: 'bytes',
    semantic: options.method && options.method !== 'GET' ? 'upload' : 'read',
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

export const moduleRuntime = (ttlMs: number | null = 120_000) => {
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
          route: '/' + identifier,
          decodeInput: decodeLegacyModuleInput,
          execute,
        },
      );
    },
  };
};
