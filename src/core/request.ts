import { Clock, Effect, Result } from 'effect';

import type {
  CreateRequestOptions,
  NcmApiResponse,
  RequestDebugEvent,
  RequestIntent,
} from '../types/index.ts';
import type { UpstreamResponse } from '../types/upstream.ts';
import { Call } from './call-context.ts';
import type { CallShape } from './call-context.ts';
import { APP_CONF } from './config.ts';
import { createWeapiSecretKey } from './crypto.ts';
import {
  requestSemantic,
  retryDecision,
  validateRequestTarget,
} from './endpoint-policy.ts';
import type { RequestError } from './errors.ts';
import {
  DeadlineExceeded,
  InvalidRequest,
  ProtocolFailed,
  TargetRejected,
  UpstreamRateLimited,
} from './errors.ts';
import { resolveIdentitySnapshot } from './identity.ts';
import type { RequestPlan } from './request-plan.ts';
import { prepareRequest } from './request-plan.ts';
import { interpretResponse, isNcmApiResponse } from './response.ts';
import { getRuntimeState, runPublicEffect } from './runtime.ts';
import { transportEffect } from './transport.ts';
import { createRandomHex, isRecord } from './utils.ts';

export type RequestServices = Call;

export const requestEffect = (
  intent: RequestIntent,
): Effect.Effect<UpstreamResponse, RequestError, RequestServices> =>
  withRequestDeadline(
    Effect.gen(function* () {
      const call = yield* Call;
      const now = yield* Clock.currentTimeMillis;
      const options = call.config;
      const plan = yield* Effect.try({
        try: (): RequestPlan => {
          let prepared: RequestPlan;
          if (intent.protocol === 'plain') {
            prepared = {
              url: intent.target,
              headers: intent.headers,
              body: intent.body,
              method: intent.method,
              protocol: 'plain',
              identity: call.identity.fingerprint,
              encryptResponse: false,
            };
          } else {
            const data: unknown =
              intent.body === undefined
                ? {}
                : JSON.parse(
                    typeof intent.body === 'string'
                      ? intent.body
                      : new TextDecoder().decode(intent.body),
                  );
            if (!isRecord(data)) {
              throw new InvalidRequest({
                message: 'API request body must be an object',
              });
            }
            const headers = { ...options.headers };
            for (const [name, value] of Object.entries(intent.headers)) {
              for (const existing of Object.keys(headers)) {
                if (existing.toLowerCase() === name.toLowerCase()) {
                  delete headers[existing];
                }
              }
              headers[name] = value;
            }
            prepared = prepareRequest(
              intent.target,
              data,
              {
                ...options,
                crypto: options.crypto || intent.protocol,
                ...(intent.headers['x-aeapi'] === 'true'
                  ? { acceptGzip: true }
                  : {}),
                ...(intent.headers['User-Agent']
                  ? { ua: options.ua || intent.headers['User-Agent'] }
                  : {}),
                headers,
              },
              call.identity,
              {
                now,
                nuid: createRandomHex(32),
                nmtid: createRandomHex(16),
                wnmcid: `${createRandomHex(6)}.${now}.01.0`,
                requestId: `${now}_${Math.floor(Math.random() * 1_000)
                  .toString()
                  .padStart(4, '0')}`,
                weapiSecret: createWeapiSecretKey(),
              },
            );
          }
          validateRequestTarget(intent, prepared.url, call.identity);
          return prepared;
        },
        catch: (error) =>
          error instanceof InvalidRequest || error instanceof TargetRejected
            ? error
            : new InvalidRequest({
                message: error instanceof Error ? error.message : String(error),
              }),
      });
      const work = Effect.gen(function* () {
        const safeUrl = new URL(plan.url);
        safeUrl.search = '';
        const maxAttempts = options.retry?.retryNonIdempotent
          ? Math.min(options.retry.retries ?? 2, 5) + 1
          : 3;
        for (let attempt = 1; ; attempt += 1) {
          const startedAt = yield* Clock.currentTimeMillis;
          const connectionStrategy =
            options.connectionStrategy === 'close' || attempt > 1
              ? 'close'
              : 'default';
          const event = {
            attempt,
            connectionStrategy,
            crypto: plan.protocol === 'plain' ? '' : plan.protocol,
            maxAttempts,
            url: safeUrl.toString(),
          } as const;
          options.onRequestEvent?.({ ...event, type: 'attempt' });
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
                proxy: options.proxy,
                fetcher: options.fetcher,
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
                    intent.response === 'bytes'
                      ? Array.from(response.body)
                      : intent.response === 'text'
                        ? text
                        : JSON.parse(text),
                };
              },
            ).pipe(
              Effect.filterOrFail(
                (response) => response.status >= 200 && response.status < 300,
                (response) =>
                  new ProtocolFailed({
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
            intent.semantic === 'read'
              ? retryDecision(
                  intent.target,
                  error,
                  attempt,
                  options.retry,
                  Math.random(),
                )
              : undefined;
          const status =
            error instanceof UpstreamRateLimited
              ? 429
              : error instanceof ProtocolFailed
                ? error.response?.status
                : undefined;
          options.onRequestEvent?.({
            ...event,
            durationMs,
            status,
            error: error.message,
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
    const call = yield* Call;
    const now = yield* Clock.currentTimeMillis;
    const remaining =
      call.deadlineAt === undefined ? undefined : call.deadlineAt - now;
    const timeout =
      call.policy.stageTimeoutMs === undefined
        ? remaining
        : Math.min(remaining ?? Infinity, call.policy.stageTimeoutMs);
    if (timeout !== undefined && timeout <= 0) {
      return yield* new DeadlineExceeded({ message: 'Request timed out' });
    }
    return yield* timeout === undefined
      ? work
      : work.pipe(
          Effect.timeoutOrElse({
            duration: timeout,
            orElse: () =>
              Effect.fail(
                new DeadlineExceeded({ message: 'Request timed out' }),
              ),
          }),
        );
  });

export const runRequestAtEdge = async (
  intent: RequestIntent,
  options: CreateRequestOptions,
): Promise<UpstreamResponse> => {
  const signal = options.signal;
  const identity = resolveIdentitySnapshot(
    options,
    getRuntimeState(options.state),
  );
  const startedAt = Effect.runSync(Clock.currentTimeMillis);
  const timeoutMs = options.timeoutMs ?? 8_000;
  let lastEvent: RequestDebugEvent | undefined;
  const call: CallShape = {
    identifier: intent.target,
    input: {},
    identity,
    startedAt,
    deadlineAt:
      timeoutMs !== undefined && timeoutMs > 0
        ? startedAt + timeoutMs
        : undefined,
    config: {
      ...options,
      onRequestEvent: (event) => {
        lastEvent = event;
        options.onRequestEvent?.(event);
      },
    },
    policy: {
      read: intent.semantic === 'read',
      upload: intent.semantic === 'upload',
    },
  };
  try {
    return await runPublicEffect(
      requestEffect(intent).pipe(Effect.provideService(Call, call)),
      signal,
    );
  } catch (error) {
    if (!isNcmApiResponse(error)) {
      throw error;
    }
    const failure = error;
    if (lastEvent && lastEvent.type !== 'failure') {
      options.onRequestEvent?.({
        ...lastEvent,
        type: 'failure',
        status: failure.status,
        durationMs: Effect.runSync(Clock.currentTimeMillis) - startedAt,
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
  const response = await runRequestAtEdge(
    {
      target: uri,
      protocol: options.crypto || (APP_CONF.encrypt ? 'eapi' : 'api'),
      body: JSON.stringify(data),
      method: 'POST',
      headers: {},
      response: 'json',
      semantic: requestSemantic(uri),
    },
    options,
  );
  return {
    body: response.body,
    cookie: [...response.cookie],
    status: response.status,
  };
};
