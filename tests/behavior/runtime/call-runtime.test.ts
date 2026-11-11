import { describe, expect, test } from 'bun:test';

import { Cause, Effect, Exit } from 'effect';
import { TestClock } from 'effect/testing';

import { createHanaMusicApi } from '../../../index.ts';
import type { SearchBody } from '../../../index.ts';
import { buildCallServices, Call, runCall } from '../../../src/core/call.ts';
import { decodeModuleObject } from '../../../src/core/module-input.ts';
import { getRuntimeState, setRuntimeState } from '../../../src/core/runtime.ts';
import registerAnonymous, {
  moduleActions as anonymousActions,
} from '../../../src/modules/register_anonimous.ts';
import { decodeModuleInput as decodeSearchInput } from '../../../src/modules/search.ts';
import voiceUpload, {
  moduleActions as voiceUploadActions,
} from '../../../src/modules/voice_upload.ts';
import {
  createEffectModuleInvoker as createModuleInvoker,
  invokeModule,
} from '../../../src/sdk/runtime.ts';
import type {
  ModuleQuery,
  RequestCapability,
} from '../../../src/types/index.ts';
import { createStage, testEntropy } from '../../_kit/harness/sdk.ts';
import { runEffect } from '../../_kit/it.ts';
import { clientLayer } from '../../_kit/layers.ts';
import {
  moduleResponse,
  probeReadActions,
  probeUploadActions,
  probeWriteActions,
  testRequest,
} from '../../_kit/module.ts';
import { readWebBody } from '../../_kit/upstream/wire.ts';
import {
  initXml,
  songFile,
  tokenBody,
} from '../../fixtures/synthetic/upload.ts';

describe('real kernel request budgets', () => {
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
      await runEffect(
        Effect.scoped(
          Effect.gen(function* () {
            const clock = yield* TestClock.make();
            const controller = new AbortController();
            const tokenStarted = createStage('token allocation');
            let releaseToken!: () => void;
            const tokenGate = new Promise<void>((resolve) => {
              releaseToken = resolve;
            });
            const stageStarted = createStage('request under deadline');
            const sent: Array<string> = [];
            let requestSignal: AbortSignal | undefined;
            let typedFailure: unknown;
            let settled = false;
            const pending = runCall(
              {
                identifier: 'voice_upload',
                input: { songFile },

                config: {
                  signal: controller.signal,
                  cookie: 'MUSIC_U=custom-budget',
                  timeoutMs: scenario.total,
                  fetcher: async (input, init) => {
                    const target =
                      input instanceof Request ? input.url : String(input);
                    sent.push(target);
                    if (
                      target.includes('/nos/token/alloc') &&
                      scenario.stage === 'pre-check'
                    ) {
                      tokenStarted.reach();
                      await tokenGate;
                      if (init?.signal?.aborted)
                        throw new DOMException('Cancelled', 'AbortError');
                      return Response.json(tokenBody);
                    }
                    if (
                      target.startsWith('https://ymusic.nos-hz.163yun.com/')
                    ) {
                      return target.endsWith('?uploads')
                        ? new Response(initXml)
                        : new Response(new Uint8Array([0, 128, 255]), {
                            headers: { etag: 'etag-1' },
                          });
                    }
                    requestSignal = init?.signal ?? undefined;
                    stageStarted.reach();
                    return new Promise((_resolve, reject) => {
                      requestSignal?.addEventListener(
                        'abort',
                        () =>
                          reject(new DOMException('Cancelled', 'AbortError')),
                        { once: true },
                      );
                    });
                  },
                },
              },
              clientLayer(),
              {
                identifier: 'voice_upload',
                actions: voiceUploadActions,
                route: '/voice/upload',
                decodeInput: decodeModuleObject,
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

              clock,
            )
              .catch((error: unknown) => error)
              .then((result) => {
                settled = true;
                return result;
              });
            try {
              if (scenario.stage === 'pre-check') {
                yield* Effect.promise(() => tokenStarted.wait(pending));
                yield* clock.adjust(scenario.elapsed);
                releaseToken();
              }
              yield* Effect.promise(() => stageStarted.wait(pending));
              expect(requestSignal?.aborted).toBe(false);
              if (scenario.mode === 'cancel') {
                controller.abort();
              } else {
                yield* clock.adjust(scenario.budget - 1);
                expect(settled).toBe(false);
                expect(requestSignal?.aborted).toBe(false);
                yield* clock.adjust(1);
              }
              yield* Effect.promise(() => Bun.sleep(1));
              expect(settled).toBe(true);
              expect(requestSignal?.aborted).toBe(true);
              const rejection = yield* Effect.promise(() => pending);
              expect(rejection).toMatchObject({
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

  test('ordinary kernel requests use the remaining total without an upload stage cap', async () => {
    await runEffect(
      Effect.scoped(
        Effect.gen(function* () {
          const clock = yield* TestClock.make();
          const controller = new AbortController();
          const started = createStage('ordinary request');
          let requestSignal: AbortSignal | undefined;
          let settled = false;
          const pending = runCall(
            {
              identifier: 'like',
              input: {},

              config: {
                signal: controller.signal,
                cookie: 'MUSIC_U=ordinary-budget',
                timeoutMs: 90_000,
                fetcher: async (_input, init) => {
                  requestSignal = init?.signal ?? undefined;
                  started.reach();
                  return new Promise((_resolve, reject) => {
                    requestSignal?.addEventListener(
                      'abort',
                      () => reject(new DOMException('Cancelled', 'AbortError')),
                      { once: true },
                    );
                  });
                },
              },
            },
            clientLayer(),
            {
              actions: probeWriteActions,
              identifier: 'like',
              route: '/like',
              decodeInput: decodeModuleObject,
              execute: (_input, request) =>
                Effect.gen(function* () {
                  yield* Effect.sleep(10_000);
                  const result = yield* request('like', {
                    data: {},
                    headers: {},
                  });
                  return {
                    status: result.status,
                    cookie: [...result.cookie],
                    body: result.body,
                  };
                }),
            },

            clock,
          )
            .catch((error: unknown) => error)
            .then((result) => {
              settled = true;
              return result;
            });
          try {
            yield* clock.adjust(10_000);
            yield* Effect.promise(() => started.wait(pending));
            yield* clock.adjust(60_001);
            expect(settled).toBe(false);
            expect(requestSignal?.aborted).toBe(false);
            yield* clock.adjust(19_999);
            const rejection = yield* Effect.promise(() => pending);
            expect(rejection).toMatchObject({
              status: 504,
            });
            expect(requestSignal?.aborted).toBe(true);
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

  test('the client web QR method consumes its cookie config identity', async () => {
    const client = createHanaMusicApi({
      cookie: 'MUSIC_U=qr-user; sDeviceId=client-device',
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

  test('external state changes cannot affect an already started call', async () => {
    const state = { deviceId: 'original' };
    // inner_version 已带收窄 Body；这里改用无 Body 的模块标识占位，fake execute 才能返回任意正文。
    const invoke = createModuleInvoker(
      'captcha_verify',
      {
        actions: probeWriteActions,
        identifier: 'captcha_verify',
        route: '/test',
        decodeInput: decodeModuleObject as never,
        execute: (_query: ModuleQuery, request: RequestCapability) =>
          Effect.gen(function* () {
            state.deviceId = 'changed';
            return yield* testRequest(request, '/api/like', {});
          }).pipe(Effect.map(moduleResponse)),
      },
      {
        cookie: 'MUSIC_U=header-snapshot',
        state,
        fetcher: async (_url, init) =>
          Response.json({
            code: 200,
            header: decodeURIComponent(
              new Headers(init?.headers).get('cookie') ?? '',
            ),
          }),
      },
    );
    expect((await invoke({} as never)).body).toMatchObject({
      header: expect.stringContaining('deviceId=original'),
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
          actions: probeReadActions,
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
              return yield* testRequest(request, '/api/search/get', {});
            }).pipe(Effect.map(moduleResponse<SearchBody>)),
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
      await runEffect(
        Effect.scoped(
          Effect.gen(function* () {
            const clock = yield* TestClock.make();
            const controller = new AbortController();
            let settled = false;
            const pending = runCall(
              {
                identifier,
                input: {},
                config: {
                  signal: controller.signal,
                  cookie: 'MUSIC_U=user',
                  timeoutMs,
                },
              },
              clientLayer(),
              {
                actions:
                  identifier === 'voice_upload' ? probeUploadActions : {},
                identifier: 'test',
                route: '/test',
                decodeInput: decodeModuleObject,
                execute: () =>
                  Effect.promise<never>(() => new Promise(() => {})).pipe(
                    Effect.map(moduleResponse),
                  ),
              },

              clock,
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
              const rejection = yield* Effect.promise(() => pending);
              expect(rejection).toMatchObject({
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
    const input = { id: 1, like: false };
    const response = await invokeModule('like', input, {
      cookie: 'MUSIC_U=user',
      fetcher: async () =>
        Response.json({ code: 200, playlistId: 1, songs: [] }),
    });
    expect(response.status).toBe(200);
    expect(input).toEqual({ id: 1, like: false });
  });
  test('execution configuration never enters module business input', async () => {
    const invoke = createModuleInvoker(
      'search',
      {
        actions: {},
        identifier: 'search',
        route: '/test',
        decodeInput: decodeSearchInput,
        execute: (query: ModuleQuery) =>
          Effect.sync(() => ({
            status: 200,
            cookie: [],
            body: { code: 200, keys: Object.keys(query) },
          })).pipe(Effect.map(moduleResponse<SearchBody>)),
      },
      {
        cookie: 'MUSIC_U=private',
        timeoutMs: 100,
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
      'captcha_verify',
      {
        actions: probeWriteActions,
        identifier: 'captcha_verify',
        route: '/test',
        decodeInput: decodeModuleObject as never,
        execute: (_query: ModuleQuery, request: RequestCapability) =>
          Effect.gen(function* () {
            cookie.MUSIC_U = 'changed-user';
            yield* testRequest(request, '/api/like', {});
            yield* testRequest(request, '/api/like', {});
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
    await invoke({} as never);
    expect(sentCookies).toHaveLength(2);
    for (const sent of sentCookies) {
      expect(sent).toContain('MUSIC_U=original-user');
    }
  });

  test('explicit cookie overrides mixed-case Cookie header and identity pool', async () => {
    let sentCookie = '';
    const invoke = createModuleInvoker(
      'captcha_verify',
      {
        actions: probeWriteActions,
        identifier: 'captcha_verify',
        route: '/test',
        decodeInput: decodeModuleObject as never,
        execute: (_query: ModuleQuery, request: RequestCapability) =>
          testRequest(request, '/api/like', {}).pipe(
            Effect.map(moduleResponse),
          ),
      },
      {
        cookie: 'MUSIC_U=explicit-user',

        identityPool: { size: 1 },
        fetcher: async (_url, init) => {
          sentCookie = new Headers(init?.headers).get('cookie') ?? '';
          return Response.json({ code: 200 });
        },
      },
    );
    await invoke({} as never);
    expect(sentCookie).toContain('MUSIC_U=explicit-user');
    expect(sentCookie).not.toContain('header-user');
  });

  test('caller cancellation interrupts a module even when it ignores the signal', async () => {
    const controller = new AbortController();
    const invoke = createModuleInvoker(
      'captcha_verify',
      {
        actions: {},
        identifier: 'captcha_verify',
        route: '/test',
        decodeInput: decodeModuleObject as never,
        execute: () =>
          Effect.gen(function* () {
            controller.abort();
            return yield* Effect.promise<never>(() => new Promise(() => {}));
          }).pipe(Effect.map(moduleResponse)),
      },
      { cookie: 'MUSIC_U=user', signal: controller.signal, timeoutMs: 0 },
    );
    const failure = await invoke({} as never).catch((error: unknown) => error);
    expect(failure).toMatchObject({ status: 499 });
  });

  test('disabled ordinary timeout still allows module completion', async () => {
    const invoke = createModuleInvoker(
      'captcha_verify',
      {
        actions: {},
        identifier: 'captcha_verify',
        route: '/test',
        decodeInput: decodeModuleObject as never,
        execute: () =>
          Effect.gen(function* () {
            yield* Effect.sleep(20);
            return { status: 200, cookie: [], body: { code: 200 } };
          }).pipe(Effect.map(moduleResponse)),
      },
      { cookie: 'MUSIC_U=user', timeoutMs: 0 },
    );
    expect((await invoke({} as never)).status).toBe(200);
  });

  test('one call deadline does not interrupt another waiter on the shared read', async () => {
    let calls = 0;
    let aborts = 0;
    const invoke = createModuleInvoker(
      'search',
      {
        actions: probeReadActions,
        identifier: 'search',
        route: '/test',
        decodeInput: decodeSearchInput,
        execute: (_query: ModuleQuery, request: RequestCapability) =>
          testRequest(request, '/api/search/get', {}).pipe(
            Effect.map(moduleResponse<SearchBody>),
          ),
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
        'captcha_verify',
        {
          actions: probeWriteActions,
          identifier: 'captcha_verify',
          route: '/test',
          decodeInput: decodeModuleObject as never,
          execute: (_query: ModuleQuery, request: RequestCapability) =>
            Effect.gen(function* () {
              setRuntimeState({ anonymousToken: 'after-call' });
              yield* testRequest(request, '/api/like', {});
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
      await invoke({} as never);
      expect(cookies[0]).toContain('MUSIC_A=before-call');
      expect(cookies[0]).not.toContain('after-call');
    } finally {
      setRuntimeState(previous);
    }
  });

  test.each([0, 900_000])(
    'upload stage limit remains 60 seconds with timeoutMs %i',
    async (timeoutMs) => {
      await runEffect(
        Effect.scoped(
          Effect.gen(function* () {
            const clock = yield* TestClock.make();
            const started = createStage('upload stage');
            let requestSignal: AbortSignal | undefined;
            let settled = false;
            const pending = runCall(
              {
                identifier: 'voice_upload',
                input: {},
                config: {
                  cookie: 'MUSIC_U=user',
                  timeoutMs,
                  fetcher: async (_input, init) => {
                    requestSignal = init?.signal ?? undefined;
                    started.reach();
                    return new Promise((_resolve, reject) => {
                      requestSignal?.addEventListener(
                        'abort',
                        () =>
                          reject(new DOMException('Cancelled', 'AbortError')),
                        { once: true },
                      );
                    });
                  },
                },
              },
              clientLayer(),
              {
                actions: probeUploadActions,
                identifier: 'test',
                route: '/test',
                decodeInput: decodeModuleObject,
                execute: (_query: ModuleQuery, api: RequestCapability) =>
                  testRequest(api, '/api/nos/token/alloc', {}).pipe(
                    Effect.map(moduleResponse),
                  ),
              },

              clock,
            ).catch((error: unknown) => {
              settled = true;
              return error;
            });
            yield* Effect.promise(() => started.wait(pending));
            yield* clock.adjust(59_999);
            expect(settled).toBe(false);
            expect(requestSignal?.aborted).toBe(false);
            yield* clock.adjust(1);
            const result = yield* Effect.promise(() => pending);
            expect(result).toMatchObject({
              status: 504,
            });
            expect(requestSignal?.aborted).toBe(true);
          }),
        ),
      );
    },
  );

  test('anonymous module uses the frozen Call device for both username and wire cookie', async () => {
    const original = getRuntimeState();
    const seen: Array<{
      deviceId: string;
      url: string;
      cookie: string | null;
      username: string;
      global: unknown;
    }> = [];
    let callDeviceId = '';
    try {
      const result = await runCall(
        {
          identifier: 'register_anonimous',
          input: {},
          config: {
            state: { deviceId: 'call-device-123' },
            fetcher: async (url, init) => {
              if (typeof init?.body !== 'string') {
                throw new TypeError('Expected an encoded API body');
              }
              const username = (readWebBody(init.body) as { username: string })
                .username;
              seen.push({
                deviceId: callDeviceId,
                url:
                  typeof url === 'string'
                    ? url
                    : url instanceof URL
                      ? url.href
                      : url.url,
                cookie: new Headers(init?.headers).get('cookie'),
                username: Buffer.from(username, 'base64')
                  .toString('utf8')
                  .split(' ')[0]!,
                global: getRuntimeState(),
              });
              return Response.json(
                { code: 200, userId: 1 },
                { headers: { 'set-cookie': 'MUSIC_A=registered; Path=/' } },
              );
            },
          },
        },
        buildCallServices({}, false, { entropy: testEntropy }),
        {
          identifier: 'register_anonimous',
          route: '/register/anonimous',
          actions: anonymousActions,
          decodeInput: () => Effect.succeed({}),
          execute: (input, request) =>
            Effect.gen(function* () {
              callDeviceId = (yield* Call).identity.state.deviceId;
              return yield* registerAnonymous(input, request);
            }),
        },
      );
      expect(result.cookie).toEqual(['MUSIC_A=registered; Path=/']);
      expect(seen).toEqual([
        {
          deviceId: 'call-device-123',
          url: 'https://music.163.com/weapi/register/anonimous',
          cookie: expect.stringContaining('deviceId=call-device-123'),
          username: 'call-device-123',
          global: original,
        },
      ]);
      expect(getRuntimeState()).toEqual(original);
    } finally {
      setRuntimeState(original);
    }
  });
});
