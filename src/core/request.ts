import { types as valueTypes } from 'node:util';

import { Clock, Effect, Ref, Result } from 'effect';

import type {
  CookieRecord,
  CreateRequestOptions,
  NcmApiResponse,
  RequestDebugEvent,
} from '../types/index.ts';
import type { UpstreamResponse } from '../types/upstream.ts';
import { ExecutionScope, resolveExecutionScope } from './call-context.ts';
import type { InternalExecution } from './call-context.ts';
import { OS_PROFILES, USER_AGENT_MAP } from './config.ts';
import { createWeapiSecretKey } from './crypto.ts';
import { retryDecision, validateRequestTarget } from './endpoint-policy.ts';
import type { RequestError } from './errors.ts';
import {
  DeadlineExceeded,
  InvalidRequest,
  ProtocolFailed,
  ResponseDecodeFailed,
  TargetRejected,
  TransportFailed,
  UpstreamRateLimited,
} from './errors.ts';
import { resolveIdentitySnapshot } from './identity.ts';
import type {
  RequestEntropy,
  RequestPlan,
  ResolvedRequest,
} from './request-plan.ts';
import { prepareRequest } from './request-plan.ts';
import { requestProfiles } from './request-profiles.ts';
import type { RequestProfile } from './request-profiles.ts';
import { interpretResponse, isNcmApiResponse } from './response.ts';
import { getRuntimeState, runPublicEffect } from './runtime.ts';
import { transportEffect } from './transport.ts';
import { createRandomHex, isRecord } from './utils.ts';

// 目标运行时的 raw JSON 原生接口尚未进入当前 TypeScript 标准库声明。
// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const nativeJSON = JSON as JSON & {
  isRawJSON(value: unknown): value is { readonly rawJSON: string };
};

// JSON 接收规则先形成自有值树，异步取 token 后的编码不会再读取调用者对象。
export const snapshotRequestData = (input: unknown): unknown => {
  const ancestors = new Set<object>();
  const capture = (source: unknown, key: string): unknown => {
    let value = source;
    if (
      (typeof value === 'object' && value !== null) ||
      typeof value === 'function' ||
      typeof value === 'bigint'
    ) {
      const object: object = Object(value);
      const toJSON: unknown = Reflect.get(object, 'toJSON', value);
      if (typeof toJSON === 'function') {
        value = Reflect.apply(toJSON, value, [key]);
      }
    }
    const numberObject = valueTypes.isNumberObject(value);
    const stringObject = valueTypes.isStringObject(value);
    if (numberObject || stringObject) {
      const object: object = Object(value);
      const toPrimitive: unknown = Reflect.get(object, Symbol.toPrimitive);
      let primitive: unknown = object;
      if (toPrimitive !== undefined && toPrimitive !== null) {
        if (typeof toPrimitive !== 'function') {
          throw new TypeError('Cannot convert object to primitive value');
        }
        primitive = Reflect.apply(toPrimitive, value, [
          numberObject ? 'number' : 'string',
        ]);
      } else {
        const conversionMethods = numberObject
          ? ['valueOf', 'toString']
          : ['toString', 'valueOf'];
        for (const name of conversionMethods) {
          const method: unknown = Reflect.get(object, name);
          if (typeof method !== 'function') continue;
          const result: unknown = Reflect.apply(method, value, []);
          if (
            (typeof result !== 'object' || result === null) &&
            typeof result !== 'function'
          ) {
            primitive = result;
            break;
          }
        }
      }
      if (
        (typeof primitive === 'object' && primitive !== null) ||
        typeof primitive === 'function' ||
        typeof primitive === 'symbol' ||
        (numberObject && typeof primitive === 'bigint')
      ) {
        throw new TypeError('Cannot convert object to primitive value');
      }
      value = numberObject ? Number(primitive) : String(primitive);
    } else if (valueTypes.isBooleanObject(value)) {
      value = Boolean.prototype.valueOf.call(value);
    } else if (valueTypes.isBigIntObject(value)) {
      value = BigInt.prototype.valueOf.call(value);
    }
    // 原始字面量单独解析，保留普通数值归一化会抹掉的负零和溢出值。
    if (nativeJSON.isRawJSON(value)) {
      const primitive: unknown = JSON.parse(value.rawJSON);
      return primitive;
    }
    if (typeof value === 'bigint') {
      throw new TypeError('Do not know how to serialize a BigInt');
    }
    if (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'boolean'
    ) {
      return value;
    }
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) return null;
      return value === 0 ? 0 : value;
    }
    if (typeof value !== 'object') return undefined;
    if (ancestors.has(value)) {
      throw new TypeError('Converting circular structure to JSON');
    }
    ancestors.add(value);
    try {
      if (Array.isArray(value)) {
        // Proxy 可以返回非数值的 length，原生 JSON 会在这里执行 ToLength。
        // oxlint-disable-next-line typescript/no-unnecessary-type-conversion
        const numericLength = +value.length;
        const length =
          Number.isNaN(numericLength) || numericLength <= 0
            ? 0
            : Math.min(Math.floor(numericLength), Number.MAX_SAFE_INTEGER);
        const result: Array<unknown> = [];
        for (let index = 0; index < length; index += 1) {
          const item = capture(
            Reflect.get(value, String(index)),
            String(index),
          );
          Object.defineProperty(result, String(index), {
            value: item === undefined ? null : item,
            enumerable: true,
            configurable: true,
            writable: true,
          });
        }
        Object.freeze(result);
        return result;
      }
      const result: Record<string, unknown> = {};
      for (const name of Object.keys(value)) {
        const item = capture(Reflect.get(value, name), name);
        if (item !== undefined)
          Object.defineProperty(result, name, {
            value: item,
            enumerable: true,
            configurable: true,
            writable: true,
          });
      }
      Object.freeze(result);
      return result;
    } finally {
      ancestors.delete(value);
    }
  };
  return capture(input, '');
};

export type RequestServices = ExecutionScope;

export const requestEffect = (
  request: ResolvedRequest,
): Effect.Effect<UpstreamResponse, RequestError, RequestServices> =>
  withRequestDeadline(
    Effect.gen(function* () {
      const scope = yield* ExecutionScope;
      const now = yield* Clock.currentTimeMillis;
      let checkToken: string | undefined;
      const configured = request.token.source;
      const tokenTarget =
        request.protocol === 'plain'
          ? yield* Effect.try({
              try: () =>
                validateRequestTarget(
                  request,
                  request.target,
                  request.identity,
                ),
              catch: (error) =>
                error instanceof InvalidRequest ||
                error instanceof TargetRejected
                  ? error
                  : TargetRejected.make({
                      message: 'Request target is not allowed',
                    }),
            })
          : true;
      if (configured !== undefined && tokenTarget) {
        const value =
          typeof configured === 'function'
            ? yield* Effect.tryPromise({
                try: configured,
                catch: () =>
                  InvalidRequest.make({
                    message: 'checkToken provider failed',
                  }),
              })
            : configured;
        if (typeof value !== 'string' || value.trim() === '') {
          return yield* InvalidRequest.make({
            message: 'checkToken must not be empty',
          });
        }
        yield* Effect.try({
          try: () => {
            if (
              new Headers({ 'X-antiCheatToken': value }).get(
                'X-antiCheatToken',
              ) !== value
            ) {
              throw new TypeError('Token header value would change');
            }
          },
          catch: () =>
            InvalidRequest.make({
              message:
                'checkToken must be a valid HTTP header value without surrounding whitespace',
            }),
        });
        if (typeof configured === 'string' && request.token.uses) {
          const used = yield* Ref.getAndUpdate(
            request.token.uses,
            (count) => count + 1,
          );
          if (used > 0) {
            return yield* InvalidRequest.make({
              message:
                'A checkToken string can only be sent once per module call; use a provider for multiple API requests',
            });
          }
        }
        checkToken = value;
      }
      const plan = yield* Effect.try({
        try: (): RequestPlan => {
          let resolved = request;
          if (request.protocol !== 'plain') {
            const { data: captured, headers, ...api } = request;
            const data = captured === undefined ? {} : captured;
            if (!isRecord(data))
              throw InvalidRequest.make({
                message: 'API request body must be an object',
              });
            resolved = {
              ...api,
              data,
              headers: Object.fromEntries(Object.entries(headers)),
            };
          }
          let entropy: RequestEntropy;
          if (request.protocol === 'plain') {
            entropy = {
              now,
              nuid: '',
              nmtid: '',
              wnmcid: '',
              requestId: '',
              weapiSecret: '',
            };
          } else {
            entropy = scope.entropy?.(now) ?? {
              now,
              nuid: createRandomHex(32),
              nmtid: createRandomHex(16),
              wnmcid: `${createRandomHex(6)}.${now}.01.0`,
              requestId: `${now}_${Math.floor(Math.random() * 1_000)
                .toString()
                .padStart(4, '0')}`,
              weapiSecret: createWeapiSecretKey(),
            };
          }
          const prepared = prepareRequest(resolved, entropy, checkToken);
          if (
            request.expectedUrl !== null &&
            new URL(prepared.url).href !== request.expectedUrl
          ) {
            throw InvalidRequest.make({
              message:
                'Prepared request does not match its declared profile and target',
            });
          }
          const credentialsAllowed = validateRequestTarget(
            request,
            prepared.url,
            request.identity,
          );
          if (checkToken !== undefined && !credentialsAllowed) {
            throw TargetRejected.make({
              message: 'Token-bearing API target is not allowed',
            });
          }
          return request.expectedUrl !== null
            ? { ...prepared, url: new URL(prepared.url).href }
            : prepared;
        },
        catch: (error) =>
          error instanceof InvalidRequest || error instanceof TargetRejected
            ? error
            : InvalidRequest.make({
                message: error instanceof Error ? error.message : String(error),
              }),
      });
      const work = Effect.gen(function* () {
        const safeUrl = new URL(plan.url);
        safeUrl.search = '';
        const maxAttempts = request.retry?.retryNonIdempotent
          ? Math.min(request.retry.retries ?? 2, 5) + 1
          : 3;
        for (let attempt = 1; ; attempt += 1) {
          const startedAt = yield* Clock.currentTimeMillis;
          const connectionStrategy =
            scope.connectionStrategy === 'close' || attempt > 1
              ? 'close'
              : 'default';
          const event = {
            attempt,
            connectionStrategy,
            crypto: plan.protocol === 'plain' ? '' : plan.protocol,
            maxAttempts,
            url: safeUrl.toString(),
          } as const;
          scope.onRequestEvent?.({ ...event, type: 'attempt' });
          const result = yield* Effect.result(
            transportEffect(
              plan.url,
              {
                body: plan.body,
                headers: {
                  ...plan.headers,
                  ...(connectionStrategy === 'close'
                    ? { Connection: 'close' }
                    : {}),
                },
                identity: plan.identity,
                method: plan.method,
                proxy: scope.proxy,
                fetcher: scope.fetcher,
              },
              (response): UpstreamResponse => {
                if (plan.protocol !== 'plain') {
                  return interpretResponse(
                    response,
                    plan.protocol,
                    plan.encryptResponse,
                    plan.headers['x-aeapi'] === 'true',
                  );
                }
                const text = new TextDecoder().decode(response.body);
                return {
                  status: response.status,
                  headers: response.headers,
                  cookie: [...response.setCookies],
                  body:
                    request.response === 'bytes'
                      ? Array.from(response.body)
                      : request.response === 'text'
                        ? text
                        : JSON.parse(text),
                };
              },
            ).pipe(
              Effect.mapError((error) => {
                if (checkToken === undefined) return error;
                if (error instanceof TransportFailed) {
                  return TransportFailed.make({
                    message: error.message.replaceAll(checkToken, '[redacted]'),
                  });
                }
                if (error instanceof ResponseDecodeFailed) {
                  return ResponseDecodeFailed.make({
                    message: error.message.replaceAll(checkToken, '[redacted]'),
                  });
                }
                return error;
              }),
              Effect.filterOrFail(
                (response) => response.status >= 200 && response.status < 300,
                (response) =>
                  ProtocolFailed.make({
                    message: 'Upstream request failed',
                    response,
                  }),
              ),
            ),
          );
          if (Result.isSuccess(result)) {
            return result.success;
          }
          const error = result.failure;
          const durationMs = (yield* Clock.currentTimeMillis) - startedAt;
          const delayMs =
            checkToken === undefined &&
            request.policy.semantic === 'read' &&
            request.policy.retry !== 'never'
              ? retryDecision(
                  error,
                  attempt,
                  request.retry,
                  Math.random(),
                  request.policy,
                )
              : undefined;
          const status =
            error instanceof UpstreamRateLimited
              ? error.status
              : error instanceof ProtocolFailed
                ? error.response?.status
                : undefined;
          scope.onRequestEvent?.({
            ...event,
            durationMs,
            status,
            error:
              checkToken === undefined
                ? error.message
                : error.message?.replaceAll(checkToken, '[redacted]'),
            ...(delayMs === undefined
              ? { type: 'failure' as const }
              : { type: 'retry' as const, delayMs }),
          });
          if (delayMs === undefined) {
            return yield* error;
          }
          yield* Effect.sleep(delayMs);
        }
      });
      return yield* work;
    }),
  );

export const withRequestDeadline = <Value, Failure, Requirements>(
  work: Effect.Effect<Value, Failure, Requirements>,
) =>
  Effect.gen(function* () {
    const scope = yield* ExecutionScope;
    const now = yield* Clock.currentTimeMillis;
    const remaining =
      scope.deadlineAt === undefined ? undefined : scope.deadlineAt - now;
    const timeout =
      scope.stageTimeoutMs === undefined
        ? remaining
        : Math.min(remaining ?? Infinity, scope.stageTimeoutMs);
    if (timeout !== undefined && timeout <= 0) {
      return yield* DeadlineExceeded.make({ message: 'Request timed out' });
    }
    return yield* timeout === undefined
      ? work
      : work.pipe(
          Effect.timeoutOrElse({
            duration: timeout,
            orElse: () =>
              Effect.fail(
                DeadlineExceeded.make({ message: 'Request timed out' }),
              ),
          }),
        );
  });

export type RawRequestInput =
  | {
      readonly protocol: 'plain';
      readonly target: string;
      readonly method: string;
      readonly headers: Readonly<Record<string, string>>;
      readonly body?: Uint8Array | string;
      readonly response: 'json' | 'text' | 'bytes';
    }
  | {
      readonly protocol: 'api' | 'weapi' | 'eapi' | 'linuxapi';
      readonly target: string;
      readonly data: unknown;
      readonly headers: Readonly<Record<string, string>>;
      readonly method: string;
      readonly response: 'json';
    };

export const resolveRawRequest = (
  input: RawRequestInput,
  options: CreateRequestOptions,
  identity = resolveIdentitySnapshot(options, getRuntimeState()),
): ResolvedRequest => {
  const headers = { ...options.headers };
  for (const [name, value] of Object.entries(input.headers)) {
    for (const existing of Object.keys(headers)) {
      if (existing.toLowerCase() === name.toLowerCase())
        delete headers[existing];
    }
    headers[name] = value;
  }
  const common = {
    target: input.target,
    method: input.method,
    response: input.response,
    headers,
    identity,
    ip: options.realIP ?? options.ip ?? identity.state.cnIp,
    expectedUrl: null,
    retry: options.retry,
    policy: { semantic: 'write', retry: 'never' } as const,
    token: { source: undefined, uses: undefined, managed: false },
  };
  if (input.protocol === 'plain')
    return {
      ...common,
      protocol: 'plain',
      body: input.body,
      headers: input.headers,
    };
  const crypto = options.crypto || input.protocol;
  const rawCookie: CookieRecord = identity.cookie;
  const rawOs = rawCookie.os;
  let defaults: Pick<RequestProfile, 'cookie' | 'userAgent'>;
  switch (rawOs) {
    case 'pc':
      defaults = {
        cookie: OS_PROFILES.pc,
        userAgent: USER_AGENT_MAP.weapi.pc.replace(
          'Macintosh; Intel Mac OS X 10_15_7',
          'Windows NT 10.0; Win64; x64',
        ),
      };
      break;
    case 'android':
      defaults = {
        cookie: OS_PROFILES.android,
        userAgent: USER_AGENT_MAP.weapi.pc
          .replace('Macintosh; Intel Mac OS X 10_15_7', 'Linux; Android 14')
          .replace('Safari/537.36 Edg/124.0.0.0', 'Mobile Safari/537.36'),
      };
      break;
    case 'linux':
      defaults = requestProfiles.linuxapi;
      break;
    case 'osx':
      defaults = requestProfiles.clientlogOsx;
      break;
    case 'web':
      defaults = requestProfiles.web;
      break;
    case 'iphone':
    case 'iPhone OS':
      defaults = crypto === 'api' ? requestProfiles.api : requestProfiles.eapi;
      break;
    case undefined:
      if (crypto === 'linuxapi') {
        defaults = requestProfiles.linuxapi;
      } else if (crypto === 'weapi') {
        defaults = requestProfiles.web;
      } else {
        defaults =
          crypto === 'api' ? requestProfiles.api : requestProfiles.eapi;
      }
      break;
    case false:
    case true:
    default:
      defaults = { cookie: {}, userAgent: '' };
  }
  return {
    ...common,
    protocol: crypto,
    data: input.data,
    client: {
      domain:
        options.domain ||
        (crypto === 'weapi' || crypto === 'linuxapi'
          ? requestProfiles.web.domain
          : requestProfiles.eapi.domain),
      userAgent:
        options.ua || input.headers['User-Agent'] || defaults.userAgent,
      cookie: defaults.cookie,
      controlledCookies: [],
      controlledHeaders: [],
      encryptResponse: options.e_r,
      acceptGzip: input.headers['x-aeapi'] === 'true' || options.acceptGzip,
    },
  };
};

export const runRequestAtEdge = async (
  input: RawRequestInput,
  options: CreateRequestOptions,
  execution?: InternalExecution,
): Promise<UpstreamResponse> => {
  const signal = options.signal;
  const identity = resolveIdentitySnapshot(options, getRuntimeState());
  const now = execution?.clock
    ? Clock.currentTimeMillis.pipe(
        Effect.provideService(Clock.Clock, execution.clock),
      )
    : Clock.currentTimeMillis;
  const startedAt = Effect.runSync(now);
  const timeoutMs = options.timeoutMs ?? 8_000;
  let lastEvent: RequestDebugEvent | undefined;
  const scope = resolveExecutionScope(options, execution, startedAt, timeoutMs);
  try {
    const work = Effect.try({
      try: () => resolveRawRequest(input, options, identity),
      catch: (error) =>
        error instanceof InvalidRequest || error instanceof TargetRejected
          ? error
          : InvalidRequest.make({
              message: error instanceof Error ? error.message : String(error),
            }),
    }).pipe(
      Effect.flatMap(requestEffect),
      withRequestDeadline,
      Effect.provideService(ExecutionScope, {
        ...scope,
        onRequestEvent: (event) => {
          lastEvent = event;
          scope.onRequestEvent?.(event);
        },
      }),
    );
    return await runPublicEffect(
      execution?.clock
        ? work.pipe(Effect.provideService(Clock.Clock, execution.clock))
        : work,
      signal,
    );
  } catch (error) {
    if (!isNcmApiResponse(error)) {
      throw error;
    }
    const failure = error;
    if (lastEvent && lastEvent.type !== 'failure') {
      scope.onRequestEvent?.({
        ...lastEvent,
        type: 'failure',
        status: failure.status,
        durationMs: Effect.runSync(now) - startedAt,
      });
    }
    // SDK Promise 边界契约：失败以 NcmApiResponse 对象抛出，调用方以 isNcmApiResponse 守卫消费。
    // oxlint-disable-next-line typescript/only-throw-error
    throw failure;
  }
};

export const createRequest = async (
  uri: string,
  data: Record<string, unknown>,
  options: CreateRequestOptions = {},
): Promise<NcmApiResponse> => {
  if (Object.hasOwn(options, 'checkToken')) {
    return runPublicEffect(
      Effect.fail(
        InvalidRequest.make({
          message:
            'checkToken is a module option; raw requests use explicit data/headers',
        }),
      ),
    );
  }
  const response = await runRequestAtEdge(
    {
      target: uri,
      protocol: options.crypto || requestProfiles.eapi.protocol,
      data: snapshotRequestData(data),
      method: 'POST',
      headers: {},
      response: 'json',
    },
    options,
  );
  return {
    body: response.body,
    cookie: [...response.cookie],
    status: response.status,
  };
};
