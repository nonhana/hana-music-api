import { describe, expect, test } from 'bun:test';

import { Effect } from 'effect';
import { TestClock } from 'effect/testing';

import { decodeLegacyModuleInput } from '../../../src/core/module-input.ts';
import { setConnectionIp } from '../../../src/server/admission.ts';
import { createServer } from '../../../src/server/create-server.ts';
import type {
  ModuleDefinition,
  ModuleQuery,
  RequestCapability,
} from '../../../src/types/index.ts';
import { createStage } from '../../_kit/harness/sdk.ts';
import { runEffect } from '../../_kit/it.ts';
import {
  moduleResponse,
  probeReadActions,
  testRequest,
} from '../../_kit/module.ts';
import { withScenario } from '../../_kit/upstream/scenario.ts';

describe('server traffic admission', () => {
  test.each(['/api/test', '/api/playlist/track/add', '/api/login/status'])(
    'debug classifies %s through the real request pipeline',
    async (uri) => {
      let calls = 0;
      const app = await createServer(
        {
          hostname: '127.0.0.1',
          debugApiRequests: true,
        },
        {
          execution: {
            fetcher: async () => {
              calls += 1;
              return Response.json({ code: 200 });
            },
          },
          allowDebugApiRequests: true,
        },
      );
      const response = await app.request('/demo/api-debug/request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ uri, crypto: 'api' }),
      });
      expect(response.status).toBe(200);
      expect(calls).toBe(1);
    },
  );

  test.each([
    { status: 200, code: 429, msg: 'too many requests' },
    { status: 429, code: 429, msg: 'too many requests' },
    { status: 200, code: 405, msg: '操作频繁，请稍候再试' },
    { status: 405, code: 405, msg: '操作过于频繁，请稍后再试' },
  ])(
    'an upstream $code rate limit inside an HTTP $status response keeps Retry-After',
    async ({ status, code, msg }) => {
      await withScenario(
        [
          {
            url: 'https://interface.music.163.com/api/test',
            method: 'POST',
            response: () =>
              Response.json(
                { code, msg },
                { status, headers: { 'Retry-After': '17' } },
              ),
          },
        ],
        async (network) => {
          const app = await createServer(
            {
              moduleDefinitions: [
                {
                  actions: probeReadActions,
                  identifier: 'probe',
                  route: '/probe',
                  decodeInput: decodeLegacyModuleInput,
                  execute: (_query: ModuleQuery, handler: RequestCapability) =>
                    testRequest(handler, '/api/test', {}).pipe(
                      Effect.map(moduleResponse),
                    ),
                },
              ],
            },
            { execution: { fetcher: network.fetcher } },
          );
          const response = await app.request('/probe');
          expect(response.status).toBe(code);
          expect(response.headers.get('retry-after')).toBe('17');
          expect(await response.json()).toMatchObject({
            code,
            msg,
            retryAfter: 17,
          });
        },
      );
    },
  );

  test('debug execution passes client cancellation to the upstream handler', async () => {
    let receivedSignal: AbortSignal | undefined;
    const stage = createStage('debug transport');
    const fetcher = async (
      _input: Request | URL | string,
      init?: RequestInit,
    ) => {
      receivedSignal = init?.signal ?? undefined;
      stage.reach();
      return Response.json({ code: 200 });
    };
    const app = await createServer(
      {
        hostname: '127.0.0.1',
        debugApiRequests: true,
      },
      { allowDebugApiRequests: true, execution: { fetcher } },
    );
    const controller = new AbortController();
    const pending = app.request(
      new Request('http://localhost/demo/api-debug/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: '/api/playlist/track/add', data: {} }),
        signal: controller.signal,
      }),
    );
    await stage.wait(pending);
    controller.abort();
    await pending;
    expect(receivedSignal).toBeDefined();
    expect(receivedSignal?.aborted).toBe(true);
  });

  test('rejects HTTP execution options and disables debugging by default', async () => {
    let calls = 0;
    const app = await createServer({
      moduleDefinitions: [
        {
          actions: {},
          identifier: 'search',
          route: '/search',
          decodeInput: decodeLegacyModuleInput,
          execute: () =>
            Effect.sync(() => {
              calls += 1;
              return { body: {}, cookie: [], status: 200 };
            }).pipe(Effect.map(moduleResponse)),
        },
      ],
      traffic: { burst: 100 },
    });
    for (const key of [
      'deviceId',
      'domain',
      'proxy',
      'headers',
      'fetcher',
      'state',
      'retry',
      'signal',
      'ip',
      'crypto',
      'timeoutMs',
    ]) {
      expect(
        (await app.request(`/search?${key}=http://127.0.0.1:9`)).status,
      ).toBe(400);
      expect(
        (
          await app.request('/search', {
            method: 'POST',
            body: JSON.stringify({ [key]: {} }),
            headers: { 'Content-Type': 'application/json' },
          })
        ).status,
      ).toBe(400);
    }
    expect(
      (await app.request('/demo/api-debug/request', { method: 'POST' })).status,
    ).toBe(404);
    expect(calls).toBe(0);
    expect(
      createServer({ debugApiRequests: true, hostname: '0.0.0.0' }),
    ).rejects.toThrow('loopback');
    expect(
      createServer({ debugApiRequests: true, hostname: '127.0.0.1' }),
    ).rejects.toThrow('startServer');
  });

  test('each visiting IP keeps its own HTTP budget in front of the request pipeline', async () => {
    let calls = 0;
    const app = await createServer(
      {
        moduleDefinitions: [
          {
            actions: probeReadActions,
            identifier: 'probe',
            route: '/probe',
            decodeInput: decodeLegacyModuleInput,
            execute: (_query: ModuleQuery, handler: RequestCapability) =>
              testRequest(handler, '/api/test', {}).pipe(
                Effect.map(moduleResponse),
              ),
          },
        ],
        cacheEnabled: false,
        traffic: {
          burst: 2,
          requestsPerSecond: 1,
          trustedProxyIps: ['127.0.0.1'],
        },
      },
      {
        execution: {
          fetcher: async () => {
            calls += 1;
            return Response.json({ code: 200 });
          },
        },
      },
    );
    const visit = (ip: string) => {
      const request = new Request('http://localhost/probe', {
        headers: { 'x-forwarded-for': ip },
      });
      setConnectionIp(request, '127.0.0.1');
      return app.request(request);
    };

    const busy = [];
    for (let index = 0; index < 3; index += 1) {
      busy.push(await visit('10.0.0.1'));
    }
    const other = await visit('10.0.0.2');

    expect(busy.map((response) => response.status)).toEqual([200, 200, 429]);
    expect(busy[2]?.headers.get('retry-after')).toBe('1');
    expect(other.status).toBe(200);
    expect(calls).toBe(3);
  });
  test('rejects before parsing the request body', async () => {
    let invoked = 0;
    const moduleDefinitions: Array<ModuleDefinition> = [
      {
        actions: {},
        identifier: 'traffic-probe',
        decodeInput: decodeLegacyModuleInput,
        execute: () =>
          Effect.sync(() => {
            invoked += 1;
            return { body: { code: 200 }, cookie: [], status: 200 };
          }).pipe(Effect.map(moduleResponse)),
        route: '/traffic-probe',
      },
    ];
    const app = await createServer({
      moduleDefinitions,
      traffic: { burst: 1, requestsPerSecond: 1 },
    });

    const first = await app.request('http://localhost/traffic-probe');
    const second = await app.request('http://localhost/traffic-probe', {
      body: '{"bad":',
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    });

    expect(first.status).toBe(200);
    expect(second.status).toBe(429);
    expect(invoked).toBe(1);
  });

  test('bounds request body size before invoking the module', async () => {
    let invoked = 0;
    const app = await createServer({
      maxBodyBytes: 4,
      moduleDefinitions: [
        {
          actions: {},
          identifier: 'body-limit',
          route: '/body-limit',
          decodeInput: decodeLegacyModuleInput,
          execute: () =>
            Effect.sync(() => {
              invoked += 1;
              return { body: { code: 200 }, cookie: [], status: 200 };
            }).pipe(Effect.map(moduleResponse)),
        },
      ],
    });
    const response = await app.request('http://localhost/body-limit', {
      body: '{}',
      headers: { 'Content-Length': '10', 'Content-Type': 'application/json' },
      method: 'POST',
    });
    expect(response.status).toBe(413);
    expect(invoked).toBe(0);
  });

  test('accepts a multipart file at the configured size limit', async () => {
    let fileSize = 0;
    const app = await createServer({
      maxBodyBytes: 10 * 1024 * 1024,
      moduleDefinitions: [
        {
          actions: {},
          identifier: 'upload-limit',
          route: '/upload-limit',
          decodeInput: decodeLegacyModuleInput,
          execute: (query: ModuleQuery) =>
            Effect.sync(() => {
              fileSize = (query.file as { size: number }).size;
              return { body: { code: 200 }, cookie: [], status: 200 };
            }).pipe(Effect.map(moduleResponse)),
        },
      ],
    });
    const form = new FormData();
    form.set('file', new File([new Uint8Array(10 * 1024 * 1024)], 'track.mp3'));
    form.set('songName', 'Track at the upload limit');

    const response = await app.request('http://localhost/upload-limit', {
      body: form,
      method: 'POST',
    });

    expect(response.status).toBe(200);
    expect(fileSize).toBe(10 * 1024 * 1024);
  });

  test.each(['file', 'files', 'field'])(
    'rejects oversized multipart %s content before invoking the module',
    async (kind) => {
      let invoked = 0;
      const app = await createServer({
        maxBodyBytes: 128,
        moduleDefinitions: [
          {
            actions: {},
            identifier: 'voice_upload',
            route: '/voice/upload',
            decodeInput: decodeLegacyModuleInput,
            execute: () =>
              Effect.sync(() => {
                invoked += 1;
                return { status: 200, cookie: [], body: { code: 200 } };
              }).pipe(Effect.map(moduleResponse)),
          },
        ],
      });
      const body = new FormData();
      if (kind === 'field') {
        body.set('value', 'x'.repeat(129));
      } else {
        body.append(
          'file',
          new File([new Uint8Array(kind === 'files' ? 80 : 129)], 'first.mp3'),
        );
        if (kind === 'files') {
          body.append('file', new File([new Uint8Array(80)], 'second.mp3'));
        }
      }
      const response = await app.request('/voice/upload', {
        method: 'POST',
        body,
      });
      expect(response.status).toBe(413);
      expect(invoked).toBe(0);
    },
  );

  test.each(['pending', 'rejected'])(
    'body timeout releases ingress even when stream cancellation is %s',
    async (mode) => {
      let cancelled = false;
      const app = await createServer({
        bodyTimeoutMs: 20,
        traffic: { maxInFlight: 1 },
        moduleDefinitions: [
          {
            actions: {},
            identifier: 'body-timeout',
            route: '/body-timeout',
            decodeInput: decodeLegacyModuleInput,
            execute: () =>
              Effect.sync(() => ({
                status: 200,
                cookie: [],
                body: { code: 200 },
              })).pipe(Effect.map(moduleResponse)),
          },
        ],
      });
      const body = new ReadableStream<Uint8Array>({
        start: (controller) => {
          controller.enqueue(new TextEncoder().encode('{'));
        },
        cancel: () => {
          cancelled = true;
          return mode === 'pending'
            ? new Promise<void>(() => {})
            : Promise.reject(new Error('cancel failed'));
        },
      });
      const response = await app.request('/body-timeout', {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
      });
      expect(response.status).toBe(408);
      expect(cancelled).toBe(true);
      expect((await app.request('/body-timeout')).status).toBe(200);
    },
    1_000,
  );
});

test('debug raw request uses the internal instance fetcher at the final wire', async () => {
  await withScenario(
    [
      {
        url: 'https://interface.music.163.com/api/context/probe',
        method: 'POST',
        check: (wire) => {
          expect(new URLSearchParams(wire.body).get('id')).toBe('7');
          expect(wire.headers.get('cookie')).toContain('MUSIC_U=debug-context');
        },
        response: () => Response.json({ code: 200 }),
      },
    ],
    async (scenario) => {
      const app = await createServer(
        { hostname: '127.0.0.1', debugApiRequests: true },
        {
          allowDebugApiRequests: true,
          execution: { fetcher: scenario.fetcher },
        },
      );
      const response = await app.request('/demo/api-debug/request', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: 'MUSIC_U=debug-context',
        },
        body: JSON.stringify({
          uri: '/api/context/probe',
          crypto: 'api',
          data: { id: 7 },
        }),
      });
      expect(response.status).toBe(200);
      expect(scenario.sent).toHaveLength(1);
    },
  );
});

test('debug raw request keeps the instance clock for its deadline and body cancellation', async () => {
  await runEffect(
    Effect.scoped(
      Effect.gen(function* () {
        const clock = yield* TestClock.make();
        const controller = new AbortController();
        const stage = createStage('debug body');
        let settled = false;
        let aborted = false;
        const app = yield* Effect.promise(() =>
          createServer(
            {
              hostname: '127.0.0.1',
              debugApiRequests: true,
            },
            {
              allowDebugApiRequests: true,
              execution: {
                fetcher: async (_input, init) => {
                  stage.reach();
                  init?.signal?.addEventListener(
                    'abort',
                    () => {
                      aborted = true;
                    },
                    { once: true },
                  );
                  return new Promise<Response>(() => {});
                },
                clock,
              },
            },
          ),
        );
        const pending = Promise.resolve(
          app.request('/demo/api-debug/request', {
            method: 'POST',
            signal: controller.signal,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ uri: '/api/context/probe', crypto: 'api' }),
          }),
        ).then((response) => {
          settled = true;
          return response;
        });
        try {
          yield* Effect.promise(() => stage.wait(pending));
          yield* clock.adjust(8_000);
          yield* Effect.promise(() => Bun.sleep(5));
          expect(settled).toBe(true);
          expect((yield* Effect.promise(() => pending)).status).toBe(504);
          expect(aborted).toBe(true);
        } finally {
          controller.abort();
          yield* Effect.promise(() => pending);
        }
      }),
    ),
  );
});
