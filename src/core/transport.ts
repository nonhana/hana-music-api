import { Clock, Effect, Result } from 'effect';
import { ProxyAgent, fetch as undiciFetch } from 'undici';

import type { FetchLike } from '../types/index.ts';
import type { UpstreamResponse } from '../types/upstream.ts';
import type { RequestError } from './errors.ts';
import {
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

export interface TransportOptions {
  readonly body?: RequestInit['body'];
  readonly fetcher?: FetchLike;
  readonly headers?: RequestInit['headers'];
  readonly identity?: string;
  readonly method?: string;
  readonly proxy?: string;
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
}

/** Bun.fetch 支持非标 `proxy` 选项；自定义 fetcher 也按此约定读取。 */
type ProxyRequestInit = RequestInit & { readonly proxy?: string };

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
      const proxyUrl =
        options.proxy && typeof Bun === 'undefined' ? options.proxy : undefined;
      const agent = proxyUrl
        ? yield* Effect.acquireRelease(
            Effect.sync(() => new ProxyAgent(proxyUrl)),
            (resource) => Effect.promise(() => resource.destroy()),
          )
        : undefined;
      const response = yield* Effect.tryPromise({
        try: (signal) => {
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
          if (agent) {
            // undici 与 DOM 的 RequestInit/Response 类型互不兼容（HeadersInit tuple、
            // Response 类不同），但运行时字段同型、消费端只读 status/headers/text。
            // 类型鸿沟边界，断言为唯一手段。
            // oxlint-disable-next-line typescript/no-unsafe-type-assertion
            const undiciInit = {
              ...init,
              dispatcher: agent,
            } as Parameters<typeof undiciFetch>[1];
            return undiciFetch(url, undiciInit) as unknown as Promise<Response>;
          }
          return (options.fetcher ?? fetch)(
            url,
            options.proxy
              ? ({ ...init, proxy: options.proxy } as ProxyRequestInit)
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
      const responseBody = response.body;
      const reader = responseBody
        ? yield* Effect.acquireRelease(
            Effect.sync(() => responseBody.getReader()),
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
              if (chunk.done) {
                break;
              }
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
        return yield* new UpstreamRateLimited({
          host,
          identity,
          retryAfterMs: headerDecision.retryAfterMs,
          status: 429,
          message: 'Upstream rate limited',
          response:
            Result.isSuccess(interpreted) && 'cookie' in interpreted.success
              ? interpreted.success
              : undefined,
        });
      }
      if (Result.isFailure(interpreted)) {
        return yield* interpreted.failure;
      }
      const value = interpreted.success;
      const decision = classifyConsumedRateLimit(consumed, value, now);
      if (decision) {
        return yield* new UpstreamRateLimited({
          host,
          identity,
          retryAfterMs: decision.retryAfterMs,
          status: 429,
          message: 'Upstream rate limited',
          response: 'cookie' in value ? value : undefined,
        });
      }
      if (response.status >= 300 && response.status < 400) {
        return yield* new ProtocolFailed({
          message: 'Upstream redirects are not allowed',
        });
      }
      return value;
    }),
  );
  return attempt.pipe(
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
