import { describe, expect, test } from 'bun:test';

import { Effect } from 'effect';

import { startServer } from '../../src/app/cli.ts';
import { Call, ProcessServices } from '../../src/core/call.ts';
import { createRuntimeRequest, requestEffect } from '../../src/core/request.ts';
import { TrafficGovernor } from '../../src/core/traffic.ts';
import { decodeLegacyModuleInput } from '../../src/modules/_input.ts';
import { createServer } from '../../src/server/create-server.ts';
import type {
  ModuleDefinition,
  ModuleQuery,
  RequestCapability,
} from '../../src/types/index.ts';
import {
  mockRequest,
  moduleResponse,
  testRequest,
} from '../fixtures/request-capability.ts';

describe('server traffic admission', () => {
  test.each(['/api/test', '/api/playlist/track/add', '/api/login/status'])(
    'debug classifies %s through the real request pipeline',
    async (uri) => {
      let calls = 0;
      const governor = new TrafficGovernor();
      const app = await createServer(
        {
          hostname: '127.0.0.1',
          debugApiRequests: true,
          requestHandler: (intent) =>
            requestEffect(intent).pipe(
              Effect.updateService(Call, (call) => ({
                ...call,
                config: {
                  ...call.config,
                  fetcher: async () => {
                    calls += 1;
                    return Response.json({ code: 200 });
                  },
                },
              })),
              Effect.updateService(ProcessServices, (services) => ({
                ...services,
                governor,
              })),
            ),
        },
        { allowDebugApiRequests: true },
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

  test.each([200, 429])(
    'the first API %s response preserves Retry-After',
    async (status) => {
      let calls = 0;
      const request = createRuntimeRequest({ governor: new TrafficGovernor() });
      const app = await createServer({
        moduleDefinitions: [
          {
            identifier: 'probe',
            route: '/probe',
            decodeInput: decodeLegacyModuleInput,
            execute: (_query: ModuleQuery, handler: RequestCapability) =>
              testRequest(handler, '/api/test', {}).pipe(
                Effect.map(moduleResponse),
              ),
          },
        ],
        requestHandler: mockRequest((uri, data, options) =>
          request(uri, data, {
            ...options,
            crypto: 'api',
            fetcher: async () => {
              calls += 1;
              return Response.json(
                { code: 429 },
                { status, headers: { 'Retry-After': '17' } },
              );
            },
          }),
        ),
      });
      for (let index = 0; index < 2; index += 1) {
        const response = await app.request('/probe');
        expect(response.status).toBe(429);
        expect(response.headers.get('retry-after')).toBe('17');
        expect(await response.json()).toMatchObject({
          code: 429,
          retryAfter: 17,
        });
      }
      expect(calls).toBe(1);
    },
  );

  test('debug execution passes client cancellation to the upstream handler', async () => {
    let receivedSignal: AbortSignal | undefined;
    let notifyStarted!: () => void;
    const started = new Promise<void>((resolve) => {
      notifyStarted = resolve;
    });
    const requestHandler = mockRequest(async (_uri, _data, options) => {
      receivedSignal = options?.signal;
      notifyStarted();
      return { body: { code: 200 }, cookie: [], status: 200 };
    });
    const app = await createServer(
      {
        hostname: '127.0.0.1',
        debugApiRequests: true,
        requestHandler,
      },
      { allowDebugApiRequests: true },
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
    await started;
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

  test('bounds 100 real HTTP requests and ignores forged forwarding headers', async () => {
    for (const burst of [10, 200]) {
      let active = 0;
      let peak = 0;
      let calls = 0;
      const { server, url } = await startServer({
        hostname: '127.0.0.1',
        port: 0,
        silent: true,
        traffic: { burst },
        cacheEnabled: false,
        moduleDefinitions: [
          {
            identifier: 'search',
            route: '/search',
            decodeInput: decodeLegacyModuleInput,
            execute: () =>
              Effect.gen(function* () {
                active += 1;
                calls += 1;
                peak = Math.max(peak, active);
                yield* Effect.sleep(100);
                active -= 1;
                return { body: { code: 200 }, cookie: [], status: 200 };
              }).pipe(Effect.map(moduleResponse)),
          },
        ],
      });
      try {
        const responses = await Promise.all(
          Array.from({ length: 100 }, (_, index) =>
            fetch(new URL(`/search?key=${index}`, url), {
              headers: { 'X-Forwarded-For': `10.0.0.${index}` },
            }),
          ),
        );
        expect(peak).toBeLessThanOrEqual(32);
        expect(calls).toBe(burst === 10 ? 10 : 32);
        expect(
          responses.filter(
            (response) => response.status === (burst === 10 ? 429 : 503),
          ),
        ).toHaveLength(100 - calls);
        for (const response of responses) {
          if (response.status !== 200) {
            expect(response.headers.get('retry-after')).toBe('1');
          }
          await response.text();
        }
        expect(active).toBe(0);
      } finally {
        await server.stop(true);
      }
    }
  });
  test('rejects before parsing the request body', async () => {
    let invoked = 0;
    const moduleDefinitions: Array<ModuleDefinition> = [
      {
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
