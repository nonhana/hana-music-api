import { describe, expect, test } from 'bun:test';

import { Effect } from 'effect';
import { TestClock } from 'effect/testing';

import { createHanaMusicApi } from '../../index.ts';
import { buildCallServices, runCall } from '../../src/core/call.ts';
import { decodeLegacyModuleInput } from '../../src/core/module-input.ts';
import { uploadWork } from '../../src/core/upload-work.ts';
import { cookieToJson } from '../../src/core/utils.ts';
import {
  createEffectModuleInvoker as createModuleInvoker,
  invokeModule,
} from '../../src/sdk/runtime.ts';
import type {
  FetchLike,
  ModuleQuery,
  RequestCapability,
} from '../../src/types/index.ts';
import { runEffect } from '../_kit/it.ts';
import {
  moduleResponse,
  testPlainRequest,
  testRequest,
} from '../fixtures/request-capability.ts';

const countingLyricFetcher = (): {
  calls: () => number;
  fetcher: FetchLike;
} => {
  let calls = 0;
  const fetcher: FetchLike = async () => {
    calls += 1;

    return new Response(JSON.stringify({ code: 200, lrc: { lyric: 'demo' } }), {
      status: 200,
    });
  };

  return {
    calls: () => calls,
    fetcher,
  };
};

describe('sdk response cache', () => {
  test('concurrent clients share only within their own client scope', async () => {
    let calls = 0;
    const config = {
      cookie: 'MUSIC_U=shared-user',
      cache: { ttlMs: 60_000 },
      fetcher: async () => {
        const attempt = ++calls;
        await Bun.sleep(10);
        return Response.json({ code: 200, lrc: { lyric: String(attempt) } });
      },
    };
    const first = createHanaMusicApi(config);
    const second = createHanaMusicApi(config);
    const [firstResult, firstCopy, secondResult, secondCopy] =
      await Promise.all([
        first.lyric({ id: '1' }),
        first.lyric({ id: '1' }),
        second.lyric({ id: '1' }),
        second.lyric({ id: '1' }),
      ]);
    expect(firstResult).toEqual(firstCopy);
    expect(secondResult).toEqual(secondCopy);
    expect(firstResult.body).not.toEqual(secondResult.body);
    expect(calls).toBe(2);
  });

  test('Call forwards its clock to the client response cache', async () => {
    await runEffect(
      Effect.scoped(
        Effect.gen(function* () {
          const clock = yield* TestClock.make();
          const services = buildCallServices(
            { cache: { ttlMs: 1_000 } },
            false,
          );
          let calls = 0;
          const implementation = () =>
            Effect.sync(() => ({
              status: 200,
              cookie: [],
              body: { code: 200, calls: ++calls },
            })).pipe(Effect.map(moduleResponse));
          const invoke = () =>
            runCall(
              { identifier: 'search', input: {}, config: { timeoutMs: 0 } },
              services,
              {
                identifier: 'test',
                route: '/test',
                decodeInput: decodeLegacyModuleInput,
                execute: implementation,
              },
              undefined,
              clock,
            );
          yield* Effect.promise(invoke);
          yield* clock.adjust(999);
          yield* Effect.promise(invoke);
          expect(calls).toBe(1);
          yield* clock.adjust(1);
          yield* Effect.promise(invoke);
          expect(calls).toBe(2);
        }),
      ),
    );
  });

  test.each([
    'like',
    'login',
    'login_qr_check',
    'batch',
    'voice_upload',
    'unknown',
  ])('Call executes %s independently without caching', async (identifier) => {
    const services = buildCallServices({ cache: { ttlMs: 60_000 } }, false);
    let calls = 0;
    const implementation = () =>
      Effect.gen(function* () {
        const attempt = ++calls;
        yield* Effect.sleep(1);
        return { status: 200, cookie: [], body: { code: 200, attempt } };
      }).pipe(Effect.map(moduleResponse));
    const invoke = () =>
      runCall({ identifier, input: {}, config: {} }, services, {
        identifier: 'test',
        route: '/test',
        decodeInput: decodeLegacyModuleInput,
        execute: implementation,
      });
    const [first, second] = await Promise.all([invoke(), invoke()]);
    expect(first.body).not.toEqual(second.body);
    await invoke();
    expect(calls).toBe(3);
  });

  test('separate clients keep independent response caches', async () => {
    const { calls, fetcher } = countingLyricFetcher();
    const config = {
      cache: { ttlMs: 60_000 },
      cookie: 'MUSIC_U=shared-user',
      fetcher,
    };
    const first = createHanaMusicApi(config);
    const second = createHanaMusicApi(config);
    await first.lyric({ id: '1' });
    await second.lyric({ id: '1' });
    await first.lyric({ id: '1' });
    expect(calls()).toBe(2);
  });
  test('should serve identical calls from cache within ttl', async () => {
    const { calls, fetcher } = countingLyricFetcher();
    const hana = createHanaMusicApi({
      cache: {
        ttlMs: 60_000,
      },
      cookie: 'MUSIC_U=cached-user',
      fetcher,
    });

    await hana.lyric({ id: '1' });
    await hana.lyric({ id: '1' });

    expect(calls()).toBe(1);
  });

  test('should not cache across different queries', async () => {
    const { calls, fetcher } = countingLyricFetcher();
    const hana = createHanaMusicApi({
      cache: {
        ttlMs: 60_000,
      },
      cookie: 'MUSIC_U=cached-user',
      fetcher,
    });

    await hana.lyric({ id: '1' });
    await hana.lyric({ id: '2' });

    expect(calls()).toBe(2);
  });

  test('should single-flight concurrent identical calls', async () => {
    const { calls, fetcher } = countingLyricFetcher();
    const hana = createHanaMusicApi({
      cache: {
        ttlMs: 60_000,
      },
      cookie: 'MUSIC_U=cached-user',
      fetcher,
    });

    await Promise.all([hana.lyric({ id: '1' }), hana.lyric({ id: '1' })]);

    expect(calls()).toBe(1);
  });
});

describe('sdk identity pool', () => {
  test('an upload deadline preserves completed stages and aborts the active stage', async () => {
    let calls = 0;
    let aborted = false;
    const upload = createModuleInvoker(
      'voice_upload',
      {
        identifier: 'voice_upload',
        route: '/test',
        decodeInput: decodeLegacyModuleInput,
        execute: (_query: ModuleQuery, request: RequestCapability) =>
          uploadWork('voice_upload', request, (stage) =>
            Effect.gen(function* () {
              yield* testRequest(
                stage,
                '/api/nos/token/alloc',
                {},
                { crypto: 'api' },
              );
              yield* testPlainRequest(
                stage,
                'https://ymusic.nos-hz.163yun.com/test',
                {
                  method: 'PUT',
                },
              );
              throw new Error('The submit stage must not start');
            }),
          ).pipe(Effect.map(moduleResponse)),
      },
      {
        cookie: 'MUSIC_U=upload-user',
        timeoutMs: 30,
        fetcher: async (_url, init) => {
          calls += 1;
          if (calls === 1) {
            return Response.json({ code: 200 });
          }
          init?.signal?.addEventListener(
            'abort',
            () => {
              aborted = true;
            },
            { once: true },
          );
          return new Promise<Response>(() => {});
        },
      },
    );
    const failure = await upload({}).catch((error: unknown) => error);

    expect(failure).toMatchObject({
      status: 504,
      body: { code: 504, partialCompletion: true, completedStages: 1 },
    });
    expect(aborted).toBe(true);
    expect(calls).toBe(2);
  });

  test('an upload deadline also bounds identity initialization', async () => {
    let invoked = false;
    const upload = createModuleInvoker(
      'voice_upload',
      {
        identifier: 'voice_upload',
        route: '/test',
        decodeInput: decodeLegacyModuleInput,
        execute: () =>
          Effect.sync(() => {
            invoked = true;
            return { status: 200, cookie: [], body: { code: 200 } };
          }).pipe(Effect.map(moduleResponse)),
      },
      {
        identityPool: { size: 1 },
        timeoutMs: 20,
        fetcher: async () => new Promise<Response>(() => {}),
      },
    );
    const failure = await upload({}).catch((error: unknown) => error);
    expect(failure).toMatchObject({ status: 504 });
    expect(invoked).toBe(false);
  });

  test('direct SDK invocation shares in-flight reads without enabling response caching', async () => {
    let calls = 0;
    const config = {
      cookie: 'MUSIC_U=direct-reader',
      fetcher: async () => {
        calls += 1;
        await Bun.sleep(10);
        return Response.json({ code: 200 });
      },
    };
    await Promise.all(
      Array.from({ length: 20 }, () =>
        invokeModule('search', { keywords: 'same' }, config),
      ),
    );
    expect(calls).toBe(1);
    await invokeModule('search', { keywords: 'same' }, config);
    expect(calls).toBe(2);
  });

  test('a pre-cancelled client write does not initialize the identity pool', async () => {
    const { calls, fetcher } = countingLyricFetcher();
    const hana = createHanaMusicApi({ fetcher, identityPool: { size: 2 } });
    const controller = new AbortController();
    controller.abort();
    expect(
      hana.like({ id: '123', like: true }, { signal: controller.signal }),
    ).rejects.toMatchObject({ status: 499 });
    await Bun.sleep(10);
    expect(calls()).toBe(0);
  });

  test('should rotate registered anonymous identities across calls', async () => {
    const registered: Array<string> = [];
    const sentTokens: Array<string> = [];
    const fetcher: FetchLike = async (input, init) => {
      const cookieHeader =
        init?.headers instanceof Headers
          ? (init.headers.get('Cookie') ?? '')
          : ((init?.headers as Record<string, string> | undefined)?.Cookie ??
            '');
      const parsed = cookieToJson(decodeURIComponent(cookieHeader));
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input.url;

      if (url.includes('register/anonimous')) {
        const token = `pool-token-${registered.length + 1}`;
        registered.push(token);

        const response = new Response(JSON.stringify({ code: 200 }), {
          status: 200,
        });
        (
          response.headers as Headers & {
            getSetCookie?: () => Array<string>;
          }
        ).getSetCookie = () => [`MUSIC_A=${token}; Path=/`];

        return response;
      }

      if (parsed.MUSIC_A) {
        sentTokens.push(String(parsed.MUSIC_A));
      }

      return new Response(
        JSON.stringify({ code: 200, lrc: { lyric: 'demo' } }),
        {
          status: 200,
        },
      );
    };

    const hana = createHanaMusicApi({
      fetcher,
      identityPool: {
        size: 2,
      },
    });

    await hana.lyric({ id: '1' });
    await hana.search({ keywords: 'second-module' });
    await hana.songDetail({ ids: '3' });

    expect(registered.length).toBe(2);
    expect(sentTokens).toEqual([
      registered[0]!,
      registered[1]!,
      registered[0]!,
    ]);
  });

  test('uses a Cookie header as an explicit SDK identity', async () => {
    let registrations = 0;
    let sentCookie = '';
    const fetcher: FetchLike = async (input, init) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      if (url.includes('register/anonimous')) {
        registrations += 1;
      }
      sentCookie = new Headers(init?.headers).get('cookie') ?? '';
      return Response.json({ code: 200 });
    };
    const hana = createHanaMusicApi({
      fetcher,
      headers: { Cookie: 'MUSIC_U=header-user' },
      identityPool: { size: 1 },
    });

    await hana.search({ keywords: 'header-identity' });

    expect(registrations).toBe(0);
    expect(sentCookie).toContain('MUSIC_U=header-user');
  });

  test('identity pool retries a registration that returns no token', async () => {
    let registrations = 0;
    let sentToken = '';
    const fetcher: FetchLike = async (input, init) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      if (url.includes('register/anonimous')) {
        registrations += 1;
        const response = Response.json({ code: 200 });
        if (registrations === 2) {
          (
            response.headers as Headers & { getSetCookie?: () => Array<string> }
          ).getSetCookie = () => ['MUSIC_A=pool-token; Path=/'];
        }
        return response;
      }
      sentToken = new Headers(init?.headers).get('cookie') ?? '';
      return Response.json({ code: 200 });
    };
    const hana = createHanaMusicApi({ fetcher, identityPool: { size: 1 } });
    expect(hana.search({ keywords: 'first' })).rejects.toMatchObject({
      status: 502,
      body: { msg: 'Anonymous registration did not return MUSIC_A' },
    });
    expect((await hana.search({ keywords: 'second' })).status).toBe(200);
    expect(registrations).toBe(2);
    expect(sentToken).toContain('pool-token');
  });

  test('identity initialization shares the module timeout', async () => {
    let registrations = 0;
    const fetcher: FetchLike = async (input) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      if (!url.includes('register/anonimous')) {
        return Response.json({ code: 200 });
      }
      registrations += 1;
      await Bun.sleep(60);
      const response = Response.json({ code: 200 });
      (
        response.headers as Headers & { getSetCookie?: () => Array<string> }
      ).getSetCookie = () => [`MUSIC_A=pool-token-${registrations}; Path=/`];
      return response;
    };
    const hana = createHanaMusicApi({
      fetcher,
      identityPool: { size: 2 },
      timeoutMs: 80,
    });
    expect(hana.search({ keywords: 'deadline' })).rejects.toMatchObject({
      status: 504,
    });
    expect(registrations).toBe(2);
  });
});
