import { Clock, Effect, Result } from 'effect';
import { ProxyAgent, fetch as undiciFetch } from 'undici';

import type { FetchLike } from '../types/index.ts';
import type { UpstreamResponse } from '../types/upstream.ts';
import type { RequestError } from './errors.ts';
import {
  AdmissionRejected,
  InvalidRequest,
  ProtocolFailed,
  ResponseDecodeFailed,
  TransportFailed,
  UpstreamRateLimited,
} from './errors.ts';
import type { ConsumedResponse } from './response.ts';
import {
  classifyConsumedRateLimit,
  classifyHeaderRateLimit,
} from './response.ts';
import type { RequestRuntime } from './runtime.ts';
import { TrafficRejectedError } from './traffic.ts';

export interface TransportOptions {
  readonly body?: RequestInit['body'];
  readonly fetcher?: FetchLike;
  readonly headers?: RequestInit['headers'];
  readonly identity?: string;
  readonly method?: string;
  readonly proxy?: string;
  readonly runtime: RequestRuntime;
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
  readonly waitForRate?: boolean;
}

export const transportEffect = <
  A extends ConsumedResponse | UpstreamResponse = ConsumedResponse,
>(
  url: string,
  options: TransportOptions,
  interpret?: (response: ConsumedResponse, now: number) => A,
): Effect.Effect<A, RequestError> => {
  if (options.proxy && options.fetcher) {
    return Effect.fail(
      new InvalidRequest({
        message: 'proxy cannot be combined with a custom fetcher',
      }),
    );
  }
  const host = new URL(url).host;
  const runtime = options.runtime;
  const identity = options.identity ?? 'anonymous';
  const attempt = Effect.scoped(
    Effect.gen(function* () {
      let bodyConsumed = false;
      const controller = yield* Effect.acquireRelease(
        Effect.sync(() => new AbortController()),
        (resource) =>
          Effect.sync(() => {
            if (!bodyConsumed) {
              resource.abort();
            }
          }),
      );
      const agent =
        options.proxy && typeof Bun === 'undefined'
          ? yield* Effect.acquireRelease(
              Effect.sync(() => new ProxyAgent(options.proxy!)),
              (resource) => Effect.promise(() => resource.destroy()),
            )
          : undefined;
      const response = yield* Effect.tryPromise({
        try: (signal) => {
          runtime.onTrafficEvent?.({
            phase: 'send',
            host,
            ...runtime.governor.snapshot,
          });
          const init: RequestInit = {
            body: options.body,
            headers: options.headers,
            method: options.method ?? 'GET',
            signal: AbortSignal.any([
              signal,
              controller.signal,
              ...(options.signal ? [options.signal] : []),
            ]),
            redirect: 'manual',
          };
          return agent
            ? (undiciFetch(url, { ...init, dispatcher: agent } as Parameters<
                typeof undiciFetch
              >[1]) as unknown as Promise<Response>)
            : (options.fetcher ?? fetch)(
                url,
                options.proxy
                  ? ({ ...init, proxy: options.proxy } as RequestInit)
                  : init,
              );
        },
        catch: (error) =>
          new TransportFailed({
            message: error instanceof Error ? error.message : String(error),
            cause: error,
          }),
      });
      const headerNow = yield* Clock.currentTimeMillis;
      const headerDecision = classifyHeaderRateLimit(
        response.status,
        response.headers,
        headerNow,
      );
      if (headerDecision) {
        yield* runtime.governor.cool(
          host,
          identity,
          headerDecision.retryAfterMs,
        );
        runtime.onTrafficEvent?.({
          phase: 'cooldown',
          host,
          ...runtime.governor.snapshot,
          status: 429,
        });
      }
      const reader = response.body
        ? yield* Effect.acquireRelease(
            Effect.sync(() => response.body!.getReader()),
            (resource) =>
              Effect.promise(async () => {
                await resource.cancel().catch(() => {});
                resource.releaseLock();
              }),
          )
        : undefined;
      const body = yield* Effect.tryPromise({
        try: async () => {
          const chunks: Array<Uint8Array> = [];
          let size = 0;
          if (reader) {
            while (true) {
              const chunk = await reader.read();
              if (chunk.done) {break;}
              chunks.push(chunk.value);
              size += chunk.value.length;
            }
          }
          const bytes = new Uint8Array(size);
          let offset = 0;
          for (const chunk of chunks) {
            bytes.set(chunk, offset);
            offset += chunk.length;
          }
          return bytes;
        },
        catch: (error) =>
          new TransportFailed({
            message: error instanceof Error ? error.message : String(error),
          }),
      });
      const consumed: ConsumedResponse = {
        body,
        headers: response.headers,
        setCookies: getSetCookies(response.headers),
        status: response.status,
      };
      bodyConsumed = true;
      const now = yield* Clock.currentTimeMillis;
      const interpreted = yield* Effect.result(
        Effect.try({
          try: () => (interpret ? interpret(consumed, now) : (consumed as A)),
          catch: (error) =>
            new ResponseDecodeFailed({
              message: error instanceof Error ? error.message : String(error),
            }),
        }),
      );
      if (headerDecision) {
        return yield* Effect.fail(
          new UpstreamRateLimited({
            host,
            identity,
            retryAfterMs: headerDecision.retryAfterMs,
            status: 429,
            message: 'Upstream rate limited',
            response:
              Result.isSuccess(interpreted) && 'cookie' in interpreted.success
                ? interpreted.success
                : undefined,
          }),
        );
      }
      if (Result.isFailure(interpreted)) {
        return yield* Effect.fail(interpreted.failure);
      }
      const value = interpreted.success;
      const decision = classifyConsumedRateLimit(consumed, value, now);
      if (decision) {
        yield* runtime.governor.cool(host, identity, decision.retryAfterMs);
        runtime.onTrafficEvent?.({
          phase: 'cooldown',
          host,
          ...runtime.governor.snapshot,
          status: 429,
        });
        return yield* Effect.fail(
          new UpstreamRateLimited({
            host,
            identity,
            retryAfterMs: decision.retryAfterMs,
            status: 429,
            message: 'Upstream rate limited',
            response: 'cookie' in value ? value : undefined,
          }),
        );
      }
      if (response.status >= 300 && response.status < 400) {
        return yield* Effect.fail(
          new ProtocolFailed({ message: 'Upstream redirects are not allowed' }),
        );
      }
      runtime.onTrafficEvent?.({
        phase: 'complete',
        host,
        ...runtime.governor.snapshot,
        status: response.status,
      });
      return value;
    }),
  );
  return runtime.governor
    .withPermit(host, identity, attempt, options.waitForRate)
    .pipe(
      Effect.mapError((error) =>
        error instanceof TrafficRejectedError
          ? error.status === 429
            ? new UpstreamRateLimited({
                host,
                identity,
                retryAfterMs: error.retryAfterMs,
                status: 429,
                message: error.message,
              })
            : new AdmissionRejected({
                message: error.message,
                retryAfterMs: error.retryAfterMs,
              })
          : error,
      ),
      Effect.withSpan('upstream.send', { attributes: { host } }),
    );
};

const getSetCookies = (headers: Headers): Array<string> => {
  const candidate = headers as Headers & { getSetCookie?: () => Array<string> };
  if (typeof candidate.getSetCookie === 'function') {
    return candidate.getSetCookie();
  }
  const value = headers.get('set-cookie');
  return value ? [value] : [];
};
