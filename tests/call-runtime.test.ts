import { beforeEach, describe, expect, test } from 'bun:test';

import { Cause, Clock, Effect, Exit, Layer } from 'effect';
import { TestClock } from 'effect/testing';

import { createHanaMusicApi } from '../index.ts';
import {
  createClientLayer,
  createProcessLayer,
  runCall,
} from '../src/core/call.ts';
import { getRuntimeState, setRuntimeState } from '../src/core/runtime.ts';
import { resetDefaultTrafficGovernor } from '../src/core/traffic.ts';
import { decodeLegacyModuleInput } from '../src/modules/_input.ts';
import { decodeModuleInput as decodeSearchInput } from '../src/modules/search.ts';
import voiceUpload from '../src/modules/voice_upload.ts';
import {
  createEffectModuleInvoker as createModuleInvoker,
  invokeModule,
} from '../src/sdk/runtime.ts';
import type { ModuleQuery, RequestCapability } from '../src/types/index.ts';
import {
  mockRequest,
  moduleResponse,
  testRequest,
} from './fixtures/request-capability.ts';
import { initXml, songFile, tokenBody } from './fixtures/upload-effect.ts';

describe('custom Effect upload request budgets', () => {
  beforeEach(() => resetDefaultTrafficGovernor());

  test.each([
    {
      stage: 'token',
      mode: 'timeout',
      total: undefined,
      elapsed: 0,
      budget: 60_000,
      completed: 0,
    },
    {
      stage: 'token',
      mode: 'timeout',
      total: 12_000,
      elapsed: 0,
      budget: 12_000,
      completed: 0,
    },
    {
      stage: 'pre-check',
      mode: 'timeout',
      total: undefined,
      elapsed: 0,
      budget: 60_000,
      completed: 4,
    },
    {
      stage: 'pre-check',
      mode: 'timeout',
      total: 70_000,
      elapsed: 20_000,
      budget: 50_000,
      completed: 4,
    },
    {
      stage: 'token',
      mode: 'cancel',
      total: undefined,
      elapsed: 0,
      budget: 60_000,
      completed: 0,
    },
    {
      stage: 'pre-check',
      mode: 'cancel',
      total: undefined,
      elapsed: 0,
      budget: 60_000,
      completed: 4,
    },
  ] as const)(
    'voice $stage $mode uses the current $budget ms budget and stops later stages',
    async (scenario) => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const clock = yield* TestClock.make();
            const controller = new AbortController();
            let tokenStarted!: () => void;
            const tokenReady = new Promise<void>((resolve) => {
              tokenStarted = resolve;
            });
            let releaseToken!: () => void;
            const tokenGate = new Promise<void>((resolve) => {
              releaseToken = resolve;
            });
            let stageStarted!: () => void;
            const stageReady = new Promise<void>((resolve) => {
              stageStarted = resolve;
            });
            const sent: Array<string> = [];
            let handlerSignal: AbortSignal | undefined;
            let handlerBudget: number | undefined;
            let typedFailure: unknown;
            let settled = false;
            const handler = mockRequest(async (target, _data, options) => {
              sent.push(target);
              if (
                target === '/api/nos/token/alloc' &&
                scenario.stage === 'pre-check'
              ) {
                tokenStarted();
                await tokenGate;
                return { status: 200, cookie: [], body: tokenBody };
              }
              handlerSignal = options?.signal;
              handlerBudget = options?.timeoutMs;
              stageStarted();
              return new Promise(() => {});
            });
            const pending = runCall(
              {
                identifier: 'voice_upload',
                input: { songFile },
                signal: controller.signal,
                config: {
                  cookie: 'MUSIC_U=custom-budget',
                  timeoutMs: scenario.total,
                  fetcher: async (input) => {
                    const target =
                      typeof input === 'string'
                        ? input
                        : input instanceof URL
                          ? input.href
                          : input.url;
                    sent.push(target);
                    return target.endsWith('?uploads')
                      ? new Response(initXml)
                      : new Response(new Uint8Array([0, 128, 255]), {
                          headers: { etag: 'etag-1' },
                        });
                  },
                },
              },
              Layer.merge(
                createClientLayer(createProcessLayer()),
                Layer.succeed(Clock.Clock, clock),
              ),
              {
                identifier: 'voice_upload',
                route: '/voice/upload',
                decodeInput: decodeLegacyModuleInput,
                execute: (input, request) =>
                  voiceUpload(input, request).pipe(
                    Effect.onExit((exit) =>
                      Effect.sync(() => {
                        typedFailure = Exit.isFailure(exit)
                          ? Cause.squash(exit.cause)
                          : undefined;
                      }),
                    ),
                  ),
              },
              handler,
            )
              .catch((error: unknown) => error)
              .then((result) => {
                settled = true;
                return result;
              });
            try {
              if (scenario.stage === 'pre-check') {
                yield* Effect.promise(() => tokenReady);
                yield* clock.adjust(scenario.elapsed);
                releaseToken();
              }
              yield* Effect.promise(() => stageReady);
              expect(handlerBudget).toBe(scenario.budget);
              expect(handlerSignal?.aborted).toBe(false);
              if (scenario.mode === 'cancel') {
                controller.abort();
              } else {
                yield* clock.adjust(scenario.budget - 1);
                expect(settled).toBe(false);
                expect(handlerSignal?.aborted).toBe(false);
                yield* clock.adjust(1);
              }
              yield* Effect.promise(() => Bun.sleep(1));
              expect(settled).toBe(true);
              expect(handlerSignal?.aborted).toBe(true);
              expect(yield* Effect.promise(() => pending)).toMatchObject({
                status: scenario.mode === 'cancel' ? 499 : 504,
                body: scenario.completed
                  ? {
                      partialCompletion: true,
                      completedStages: scenario.completed,
                    }
                  : { code: scenario.mode === 'cancel' ? 499 : 504 },
              });
              expect(sent).toHaveLength(scenario.completed + 1);
              if (scenario.completed) {
                expect(typedFailure).toMatchObject({
                  _tag: 'PartialUpload',
                  module: 'voice_upload',
                });
              }
              if (scenario.mode === 'timeout' && scenario.total === undefined) {
                expect(typedFailure).toMatchObject(
                  scenario.completed
                    ? { cause: { _tag: 'DeadlineExceeded' } }
                    : { _tag: 'DeadlineExceeded' },
                );
              }
            } finally {
              controller.abort();
              releaseToken();
              yield* Effect.promise(() => pending);
            }
          }),
        ),
      );
    },
  );

  test('ordinary custom Effect handlers use the remaining total without an upload stage cap', async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const clock = yield* TestClock.make();
          const controller = new AbortController();
          let started!: () => void;
          const ready = new Promise<void>((resolve) => {
            started = resolve;
          });
          let handlerBudget: number | undefined;
          let handlerSignal: AbortSignal | undefined;
          let settled = false;
          const handler = mockRequest(async (_target, _data, options) => {
            handlerBudget = options?.timeoutMs;
            handlerSignal = options?.signal;
            started();
            return new Promise(() => {});
          });
          const pending = runCall(
            {
              identifier: 'like',
              input: {},
              signal: controller.signal,
              config: { cookie: 'MUSIC_U=ordinary-budget', timeoutMs: 90_000 },
            },
            Layer.merge(
              createClientLayer(createProcessLayer()),
              Layer.succeed(Clock.Clock, clock),
            ),
            {
              identifier: 'like',
              route: '/like',
              decodeInput: decodeLegacyModuleInput,
              execute: (_input, request) =>
                Effect.gen(function* () {
                  yield* Effect.sleep(10_000);
                  const result = yield* request({
                    target: '/api/radio/like',
                    protocol: 'weapi',
                    method: 'POST',
                    headers: {},
                    body: '{}',
                    semantic: 'write',
                    response: 'json',
                  });
                  return {
                    status: result.status,
                    cookie: [...result.cookie],
                    body: result.body,
                  };
                }),
            },
            handler,
          )
            .catch((error: unknown) => error)
            .then((result) => {
              settled = true;
              return result;
            });
          try {
            yield* clock.adjust(10_000);
            yield* Effect.promise(() => ready);
            expect(handlerBudget).toBe(80_000);
            yield* clock.adjust(60_001);
            expect(settled).toBe(false);
            expect(handlerSignal?.aborted).toBe(false);
            yield* clock.adjust(19_999);
            expect(yield* Effect.promise(() => pending)).toMatchObject({
              status: 504,
            });
            expect(handlerSignal?.aborted).toBe(true);
          } finally {
            controller.abort();
            yield* Effect.promise(() => pending);
          }
        }),
      ),
    );
  });
});

describe('call lifecycle', () => {
  beforeEach(() => resetDefaultTrafficGovernor());
  test('the real web QR module consumes the configured device identity', async () => {
    const response = await invokeModule(
      'login_qr_create',
      { key: 'review-key', platform: 'web' },
      { cookie: 'MUSIC_U=qr-user; sDeviceId=review-device' },
    );
    expect(response.body).toMatchObject({
      data: {
        qrurl: expect.stringMatching(
          /codekey=review-key&chainId=v1_review-device_web_login_\d+$/,
        ),
      },
    });
  });

  test('the client web QR method consumes a mixed-case Cookie header identity', async () => {
    const client = createHanaMusicApi({
      headers: { cOoKiE: 'MUSIC_U=qr-user; sDeviceId=client-device' },
    });
    const response = await client.loginQrCreate({
      key: 'client-key',
      platform: 'web',
    });
    expect(response.body).toMatchObject({
      data: {
        qrurl: expect.stringMatching(
          /codekey=client-key&chainId=v1_client-device_web_login_\d+$/,
        ),
      },
    });
  });

  test('external header changes cannot affect an already started call', async () => {
    const headers = { 'X-Call-Snapshot': 'original' };
    const invoke = createModuleInvoker(
      'like',
      {
        identifier: 'like',
        route: '/test',
        decodeInput: decodeLegacyModuleInput,
        execute: (_query: ModuleQuery, request: RequestCapability) =>
          Effect.gen(function* () {
            headers['X-Call-Snapshot'] = 'changed';
            return yield* testRequest(
              request,
              '/api/like',
              {},
              { crypto: 'api' },
            );
          }).pipe(Effect.map(moduleResponse)),
      },
      {
        cookie: 'MUSIC_U=header-snapshot',
        headers,
        fetcher: async (_url, init) =>
          Response.json({
            code: 200,
            header: new Headers(init?.headers).get('X-Call-Snapshot'),
          }),
      },
    );
    expect((await invoke({ id: 1 })).body).toMatchObject({
      header: 'original',
    });
  });

  test.each(['retries', 'statusCodes'])(
    'external %s changes cannot change the call retry policy',
    async (field) => {
      let attempts = 0;
      const retry = {
        retries: 1,
        retryNonIdempotent: true,
        backoffMs: 0,
        jitter: false,
        statusCodes: [500],
      };
      const invoke = createModuleInvoker(
        'search',
        {
          identifier: 'search',
          route: '/test',
          decodeInput: decodeSearchInput,
          execute: (_query: ModuleQuery, request: RequestCapability) =>
            Effect.gen(function* () {
              if (field === 'retries') {
                retry.retries = 0;
              } else {
                retry.statusCodes.splice(0);
              }
              return yield* testRequest(
                request,
                '/api/search/get',
                {},
                { crypto: 'api' },
              );
            }).pipe(Effect.map(moduleResponse)),
        },
        {
          cookie: 'MUSIC_U=retry-snapshot',
          retry,
          fetcher: async () => {
            attempts += 1;
            return Response.json({ code: attempts === 1 ? 500 : 200 });
          },
        },
      );
      const response = await invoke({ keywords: field }).catch(
        (error: unknown) => error,
      );
      expect(response).toMatchObject({ status: 200 });
      expect(attempts).toBe(2);
    },
  );

  test.each([
    { identifier: 'like', timeoutMs: undefined, deadline: 8_000 },
    { identifier: 'voice_upload', timeoutMs: undefined, deadline: 300_000 },
    { identifier: 'voice_upload', timeoutMs: 0, deadline: 300_000 },
    { identifier: 'voice_upload', timeoutMs: 900_000, deadline: 300_000 },
  ])(
    'Effect clock owns the total deadline for %j',
    async ({ identifier, timeoutMs, deadline }) => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const clock = yield* TestClock.make();
            const controller = new AbortController();
            let settled = false;
            const pending = runCall(
              {
                identifier,
                input: {},
                config: { cookie: 'MUSIC_U=user', timeoutMs },
                signal: controller.signal,
              },
              Layer.merge(
                createClientLayer(createProcessLayer()),
                Layer.succeed(Clock.Clock, clock),
              ),
              {
                identifier: 'test',
                route: '/test',
                decodeInput: decodeLegacyModuleInput,
                execute: () =>
                  Effect.gen(function* () {
                    return yield* Effect.promise<never>(
                      () => new Promise(() => {}),
                    );
                  }).pipe(Effect.map(moduleResponse)),
              },
            ).catch((error: unknown) => {
              settled = true;
              return error;
            });
            try {
              yield* clock.adjust(deadline - 1);
              expect(settled).toBe(false);
              yield* clock.adjust(1);
              yield* Effect.promise(() => Bun.sleep(1));
              expect(settled).toBe(true);
              expect(yield* Effect.promise(() => pending)).toMatchObject({
                status: 504,
              });
            } finally {
              controller.abort();
            }
          }),
        ),
      );
    },
  );
  test('legacy module normalization cannot mutate the caller business input', async () => {
    const input = { id: 1, like: 'false' };
    const response = await invokeModule('like', input, {
      cookie: 'MUSIC_U=user',
      fetcher: async () => Response.json({ code: 200 }),
    });
    expect(response.status).toBe(200);
    expect(input).toEqual({ id: 1, like: 'false' });
  });
  test('execution configuration never enters module business input', async () => {
    const invoke = createModuleInvoker(
      'search',
      {
        identifier: 'search',
        route: '/test',
        decodeInput: decodeSearchInput,
        execute: (query: ModuleQuery) =>
          Effect.sync(() => {
            return {
              status: 200,
              cookie: [],
              body: { code: 200, keys: Object.keys(query) },
            };
          }).pipe(Effect.map(moduleResponse)),
      },
      {
        cookie: 'MUSIC_U=private',
        timeoutMs: 100,
        headers: { 'X-Test': 'value' },
      },
    );
    expect((await invoke({ keywords: 'business' })).body).toEqual({
      code: 200,
      keys: ['keywords'],
    });
  });

  test('all requests retain the identity captured before module execution', async () => {
    const cookie = { MUSIC_U: 'original-user' };
    const sentCookies: Array<string> = [];
    const invoke = createModuleInvoker(
      'like',
      {
        identifier: 'like',
        route: '/test',
        decodeInput: decodeLegacyModuleInput,
        execute: (_query: ModuleQuery, request: RequestCapability) =>
          Effect.gen(function* () {
            cookie.MUSIC_U = 'changed-user';
            yield* testRequest(request, '/api/like', {}, { crypto: 'api' });
            yield* testRequest(request, '/api/like', {}, { crypto: 'api' });
            return { status: 200, cookie: [], body: { code: 200 } };
          }).pipe(Effect.map(moduleResponse)),
      },
      {
        cookie,
        fetcher: async (_url, init) => {
          sentCookies.push(new Headers(init?.headers).get('cookie') ?? '');
          return Response.json({ code: 200 });
        },
      },
    );
    await invoke({ id: 1 });
    expect(sentCookies).toHaveLength(2);
    for (const sent of sentCookies) {
      expect(sent).toContain('MUSIC_U=original-user');
    }
  });

  test('explicit cookie overrides mixed-case Cookie header and identity pool', async () => {
    let sentCookie = '';
    const invoke = createModuleInvoker(
      'like',
      {
        identifier: 'like',
        route: '/test',
        decodeInput: decodeLegacyModuleInput,
        execute: (_query: ModuleQuery, request: RequestCapability) =>
          Effect.gen(function* () {
            return yield* testRequest(
              request,
              '/api/like',
              {},
              { crypto: 'api' },
            );
          }).pipe(Effect.map(moduleResponse)),
      },
      {
        cookie: 'MUSIC_U=explicit-user',
        headers: { cOoKiE: 'MUSIC_U=header-user' },
        identityPool: { size: 1 },
        fetcher: async (_url, init) => {
          sentCookie = new Headers(init?.headers).get('cookie') ?? '';
          return Response.json({ code: 200 });
        },
      },
    );
    await invoke({ id: 1 });
    expect(sentCookie).toContain('MUSIC_U=explicit-user');
    expect(sentCookie).not.toContain('header-user');
  });

  test('caller cancellation interrupts a module even when it ignores the signal', async () => {
    const controller = new AbortController();
    const invoke = createModuleInvoker(
      'like',
      {
        identifier: 'like',
        route: '/test',
        decodeInput: decodeLegacyModuleInput,
        execute: () =>
          Effect.gen(function* () {
            controller.abort();
            return yield* Effect.promise<never>(() => new Promise(() => {}));
          }).pipe(Effect.map(moduleResponse)),
      },
      { cookie: 'MUSIC_U=user', signal: controller.signal, timeoutMs: 0 },
    );
    const failure = await invoke({ id: 1 }).catch((error: unknown) => error);
    expect(failure).toMatchObject({ status: 499 });
  });

  test('disabled ordinary timeout still allows module completion', async () => {
    const invoke = createModuleInvoker(
      'like',
      {
        identifier: 'like',
        route: '/test',
        decodeInput: decodeLegacyModuleInput,
        execute: () =>
          Effect.gen(function* () {
            yield* Effect.sleep(20);
            return { status: 200, cookie: [], body: { code: 200 } };
          }).pipe(Effect.map(moduleResponse)),
      },
      { cookie: 'MUSIC_U=user', timeoutMs: 0 },
    );
    expect((await invoke({ id: 1 })).status).toBe(200);
  });

  test('one call deadline does not interrupt another waiter on the shared read', async () => {
    let calls = 0;
    let aborts = 0;
    const invoke = createModuleInvoker(
      'search',
      {
        identifier: 'search',
        route: '/test',
        decodeInput: decodeSearchInput,
        execute: (_query: ModuleQuery, request: RequestCapability) =>
          Effect.gen(function* () {
            return yield* testRequest(
              request,
              '/api/search/get',
              {},
              { crypto: 'api' },
            );
          }).pipe(Effect.map(moduleResponse)),
      },
      {
        cookie: 'MUSIC_U=shared-reader',
        fetcher: async (_url, init) => {
          calls += 1;
          init?.signal?.addEventListener(
            'abort',
            () => {
              aborts += 1;
            },
            { once: true },
          );
          await Bun.sleep(35);
          return Response.json({ code: 200 });
        },
      },
    );
    const first = invoke({ keywords: 'shared' }, { timeoutMs: 10 }).catch(
      (error: unknown) => error,
    );
    const second = invoke({ keywords: 'shared' }, { timeoutMs: 100 });
    expect(await first).toMatchObject({ status: 504 });
    expect((await second).status).toBe(200);
    expect(calls).toBe(1);
    expect(aborts).toBe(0);
  });

  test('runtime identity changes after call creation cannot alter later requests', async () => {
    const previous = getRuntimeState();
    const cookies: Array<string> = [];
    setRuntimeState({ anonymousToken: 'before-call' });
    try {
      const invoke = createModuleInvoker(
        'like',
        {
          identifier: 'like',
          route: '/test',
          decodeInput: decodeLegacyModuleInput,
          execute: (_query: ModuleQuery, request: RequestCapability) =>
            Effect.gen(function* () {
              setRuntimeState({ anonymousToken: 'after-call' });
              yield* testRequest(request, '/api/like', {}, { crypto: 'api' });
              return { status: 200, cookie: [], body: { code: 200 } };
            }).pipe(Effect.map(moduleResponse)),
        },
        {
          fetcher: async (_url, init) => {
            cookies.push(new Headers(init?.headers).get('cookie') ?? '');
            return Response.json({ code: 200 });
          },
        },
      );
      await invoke({ id: 1 });
      expect(cookies[0]).toContain('MUSIC_A=before-call');
      expect(cookies[0]).not.toContain('after-call');
    } finally {
      setRuntimeState(previous);
    }
  });

  test.each([0, 900_000])(
    'upload stage limit remains 60 seconds with timeoutMs %i',
    async (timeoutMs) => {
      const timeouts: Array<number | undefined> = [];
      const request = mockRequest(async (_uri, _data, options) => {
        timeouts.push(options?.timeoutMs);
        return { status: 200, cookie: [], body: { code: 200 } };
      });
      await runCall(
        {
          identifier: 'voice_upload',
          input: {},
          config: { cookie: 'MUSIC_U=user', timeoutMs },
        },
        createClientLayer(createProcessLayer()),
        {
          identifier: 'test',
          route: '/test',
          decodeInput: decodeLegacyModuleInput,
          execute: (_query: ModuleQuery, api: RequestCapability) =>
            Effect.gen(function* () {
              return yield* testRequest(api, '/api/nos/token/alloc', {});
            }).pipe(Effect.map(moduleResponse)),
        },
        request,
      );
      expect(timeouts).toEqual([60_000]);
    },
  );
});
