import { describe, expect, test } from 'bun:test';

import { Effect, Result } from 'effect';

import { Call, ProcessServices } from '../src/core/call.ts';
import { resolveIdentitySnapshot } from '../src/core/identity.ts';
import {
  createRequest,
  createRuntimeRequest,
  requestEffect,
} from '../src/core/request.ts';
import { getRuntimeState } from '../src/core/runtime.ts';
import {
  getDefaultTrafficGovernor,
  resetDefaultTrafficGovernor,
  TrafficGovernor,
} from '../src/core/traffic.ts';
import type { FetchLike, ModuleCallConfig } from '../src/types/index.ts';
import type { RequestIntent } from '../src/types/runtime.ts';
import {
  moduleRuntime,
  plainRequest,
  testRequest,
} from './fixtures/request-capability.ts';

describe('Effect request execution', () => {
  test.each([
    { protocol: 'api', target: '/api/playlist/track/add', method: 'POST' },
    {
      protocol: 'plain',
      target: 'https://ymusic.nos-hz.163yun.com/test',
      method: 'PUT',
    },
  ] as const)(
    'rejects a write disguised as read at $target before transport',
    async (scenario) => {
      let calls = 0;
      const result = await Effect.runPromise(
        Effect.result(
          kernelFor(
            {
              ...scenario,
              headers: {},
              body: '{}',
              response: 'json',
              semantic: 'read',
            },
            {
              fetcher: async () => {
                calls += 1;
                return Response.json({ code: 200 });
              },
            },
            new TrafficGovernor(),
          ),
        ),
      );
      expect(Result.isFailure(result)).toBe(true);
      if (Result.isFailure(result)) {
        expect(result.failure).toMatchObject({ _tag: 'InvalidRequest' });
      }
      expect(calls).toBe(0);
    },
  );

  test.each([
    { protocol: 'api', target: '/api/test', method: 'POST', semantic: 'write' },
    {
      protocol: 'api',
      target: '/api/playlist/track/add',
      method: 'POST',
      semantic: 'read',
    },
    {
      protocol: 'api',
      target: '/api/login/status',
      method: 'POST',
      semantic: 'write',
    },
    {
      protocol: 'plain',
      target: 'https://music.163.com/playlist',
      method: 'GET',
      semantic: 'upload',
    },
  ] as const)(
    'rejects every semantic mismatch before transport: $protocol $target $semantic',
    async (scenario) => {
      let calls = 0;
      const result = await Effect.runPromise(
        Effect.result(
          kernelFor(
            { ...scenario, headers: {}, body: '{}', response: 'json' },
            {
              fetcher: async () => {
                calls += 1;
                return Response.json({ code: 200 });
              },
            },
            new TrafficGovernor(),
          ),
        ),
      );
      expect(Result.isFailure(result)).toBe(true);
      if (Result.isFailure(result)) {
        expect(result.failure).toMatchObject({ _tag: 'InvalidRequest' });
      }
      expect(calls).toBe(0);
    },
  );

  test.each([
    { protocol: 'api', target: '/api/test', method: 'POST', response: 'json' },
    {
      protocol: 'plain',
      target: 'https://music.163.com/playlist',
      method: 'GET',
      response: 'text',
    },
    {
      protocol: 'plain',
      target: 'https://ymusic.nos-hz.163yun.com/test',
      method: 'GET',
      response: 'bytes',
    },
  ] as const)(
    '$target body consumption shares the Call deadline and releases its reader',
    async (scenario) => {
      const governor = new TrafficGovernor();
      let cancelled = false;
      const result = await Effect.runPromise(
        Effect.result(
          kernelFor(
            { ...scenario, headers: {}, semantic: 'read' },
            {
              fetcher: async () =>
                new Response(
                  new ReadableStream({
                    cancel: () => {
                      cancelled = true;
                    },
                  }),
                ),
            },
            governor,
            Date.now() + 30,
          ),
        ),
      );
      expect(Result.isFailure(result)).toBe(true);
      if (Result.isFailure(result)) {
        expect(result.failure).toMatchObject({ _tag: 'DeadlineExceeded' });
      }
      expect(cancelled).toBe(true);
      expect(governor.snapshot.active).toBe(0);
      expect(governor.snapshot.waiting).toBe(0);
    },
  );

  test.each([
    { protocol: 'api', target: '/api/test', method: 'POST', response: 'json' },
    {
      protocol: 'plain',
      target: 'https://music.163.com/playlist',
      method: 'GET',
      response: 'text',
    },
    {
      protocol: 'plain',
      target: 'https://ymusic.nos-hz.163yun.com/test',
      method: 'GET',
      response: 'bytes',
    },
  ] as const)(
    '$target interruption cancels body consumption and releases the permit',
    async (scenario) => {
      const governor = new TrafficGovernor();
      const controller = new AbortController();
      let started!: () => void;
      const ready = new Promise<void>((resolve) => {
        started = resolve;
      });
      let cancelled = false;
      const pending = Effect.runPromise(
        kernelFor(
          { ...scenario, headers: {}, semantic: 'read' },
          {
            fetcher: async () =>
              new Response(
                new ReadableStream({
                  pull: () => {
                    started();
                  },
                  cancel: () => {
                    cancelled = true;
                  },
                }),
              ),
          },
          governor,
        ),
        { signal: controller.signal },
      ).catch((error: unknown) => error);
      await ready;
      controller.abort();
      await pending;
      expect(cancelled).toBe(true);
      expect(governor.snapshot.active).toBe(0);
      expect(governor.snapshot.waiting).toBe(0);
    },
  );
  test.each([
    {
      protocol: 'api',
      target: '/api/test',
      response: 'json',
      expected: { code: 200 },
    },
    {
      protocol: 'plain',
      target: 'https://music.163.com/playlist',
      response: 'text',
      expected: 'page',
    },
    {
      protocol: 'plain',
      target: 'https://ymusic.nos-hz.163yun.com/test',
      response: 'bytes',
      expected: [0, 128, 255, 1],
    },
  ] as const)(
    'the Call kernel serves $target using its identity snapshot',
    async (scenario) => {
      const governor = new TrafficGovernor();
      const state = getRuntimeState({ anonymousToken: 'captured-token' });
      const fetcher: FetchLike = async (_url, init) => {
        if (scenario.protocol === 'api') {
          expect(new Headers(init?.headers).get('Cookie')).toContain(
            'MUSIC_A=captured-token',
          );
        }
        return scenario.response === 'bytes'
          ? new Response(new Uint8Array([0, 128, 255, 1]))
          : scenario.response === 'text'
            ? new Response('page')
            : Response.json({ code: 200 });
      };
      const call: Call = {
        identifier: 'test',
        input: {},
        config: { fetcher },
        identity: resolveIdentitySnapshot({}, state),
        policy: { read: true, upload: false },
        startedAt: Date.now(),
      };
      const intent: RequestIntent = {
        ...scenario,
        method: scenario.protocol === 'api' ? 'POST' : 'GET',
        headers: {},
        semantic: 'read',
        body: scenario.protocol === 'api' ? '{}' : undefined,
      };
      const result = await Effect.runPromise(
        Effect.result(
          requestEffect(intent).pipe(
            Effect.provideService(Call, call),
            Effect.provideService(ProcessServices, {
              governor,
              readState: () => {
                throw new Error('Identity must not be reread');
              },
            }),
          ),
        ),
      );
      expect(Result.isSuccess(result)).toBe(true);
      if (Result.isSuccess(result)) {
        expect(result.success.body).toEqual(
          scenario.response === 'bytes'
            ? [...scenario.expected]
            : scenario.expected,
        );
      }
      expect(governor.snapshot.active).toBe(0);
    },
  );

  test('the plain RequestIntent preserves all byte values in order', async () => {
    const response = await plainRequest(
      { fetcher: async () => new Response(new Uint8Array([0, 128, 255, 1])) },
      { governor: new TrafficGovernor() },
    )('https://ymusic.nos-hz.163yun.com/test');
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toEqual([0, 128, 255, 1]);
  });
  test.each(['api', 'raw'] as const)(
    'an empty MUSIC_U cannot change the account cooldown for %s requests',
    async (path) => {
      const runtime = { governor: new TrafficGovernor() };
      const request = createRuntimeRequest(runtime);
      let calls = 0;
      const config = {
        cookie: { MUSIC_A: 'same-account' },
        fetcher: async () => {
          calls += 1;
          return Response.json({ code: calls === 1 ? 429 : 200 });
        },
      };
      const first = await request(
        '/api/test',
        {},
        { ...config, crypto: 'weapi' },
      ).catch((error: unknown) => error);
      expect(first).toMatchObject({ status: 429 });
      const nextConfig = {
        ...config,
        cookie: { MUSIC_U: '', MUSIC_A: 'same-account' },
      };
      const next = await (
        path === 'api'
          ? request('/api/test', {}, { ...nextConfig, crypto: 'api' })
          : plainRequest(
              nextConfig,
              runtime,
            )('https://ymusic.nos-hz.163yun.com/test')
      ).catch((error: unknown) => error);
      expect(next).toMatchObject({
        status: 429,
        body: { msg: 'Upstream is cooling down' },
      });
      expect(calls).toBe(1);
      expect(runtime.governor.snapshot.active).toBe(0);
      expect(runtime.governor.snapshot.waiting).toBe(0);
    },
  );

  test.each([
    { headers: { Cookie: 'MUSIC_U=header-user' } },
    { headers: { cookie: 'MUSIC_A=header-anonymous' } },
    {
      cookie: 'MUSIC_U=explicit-user',
      headers: { Cookie: 'MUSIC_U=ignored-user' },
    },
    { state: { anonymousToken: 'runtime-anonymous' } },
  ] as Array<ModuleCallConfig>)(
    'API and NOS share the effective account cooldown for %j',
    async (identity) => {
      const runtime = { governor: new TrafficGovernor() };
      let calls = 0;
      const config = {
        ...identity,
        crypto: 'api' as const,
        fetcher: async () => {
          calls += 1;
          return Response.json({ code: 429 }, { status: 429 });
        },
      };
      const first = await createRuntimeRequest(runtime)(
        '/api/test',
        {},
        config,
      ).catch((error: unknown) => error);
      const next = await plainRequest(
        config,
        runtime,
      )('https://ymusic.nos-hz.163yun.com/test').catch(
        (error: unknown) => error,
      );

      expect(first).toMatchObject({ status: 429 });
      expect(next).toMatchObject({
        status: 429,
        body: { msg: 'Upstream is cooling down' },
      });
      expect(calls).toBe(1);
      expect(runtime.governor.snapshot.active).toBe(0);
    },
  );

  test('standard requests wait for a refill within the queue deadline', async () => {
    const runtime = {
      governor: new TrafficGovernor({
        maxInFlight: 8,
        maxWaiting: 32,
        waitMs: 200,
        hostRate: 20,
        hostBurst: 1,
        identityRate: 20,
        identityBurst: 1,
      }),
    };
    const request = createRuntimeRequest(runtime);
    let calls = 0;
    const options = {
      crypto: 'api' as const,
      cookie: 'MUSIC_A=test',
      fetcher: async () => {
        calls += 1;
        return Response.json({ code: 200 });
      },
    };
    expect((await request('/api/search/get', {}, options)).status).toBe(200);
    expect((await request('/api/search/get', {}, options)).status).toBe(200);
    const modules = moduleRuntime(null, runtime);
    expect(
      (
        await modules.invoke(
          'search',
          (_query, capability) =>
            testRequest(capability, '/api/search/get', {}, { crypto: 'api' }),
          {},
          options,
        )
      ).status,
    ).toBe(200);
    const raw = plainRequest(options, runtime);
    expect((await raw('https://music.163.com/playlist')).status).toBe(200);
    expect((await raw('https://music.163.com/playlist')).status).toBe(200);
    expect(calls).toBe(5);
    expect(runtime.governor.snapshot.waiting).toBe(0);
  });

  test('a pre-cancelled write never reaches the upstream', async () => {
    resetDefaultTrafficGovernor();

    const controller = new AbortController();
    controller.abort();
    let calls = 0;
    expect(
      createRequest(
        '/api/playlist/track/add',
        {},
        {
          crypto: 'api',
          signal: controller.signal,
          fetcher: async () => {
            calls += 1;
            return Response.json({ code: 200 });
          },
        },
      ),
    ).rejects.toMatchObject({ status: 499 });
    expect(calls).toBe(0);
    expect(getDefaultTrafficGovernor().snapshot.active).toBe(0);
    expect(getDefaultTrafficGovernor().snapshot.waiting).toBe(0);
  });

  test('the total deadline includes a stalled response body', async () => {
    resetDefaultTrafficGovernor();

    let aborted = false;
    const fetcher: FetchLike = async (_input, init) => {
      init?.signal?.addEventListener(
        'abort',
        () => {
          aborted = true;
        },
        { once: true },
      );
      return new Response(new ReadableStream({ start: () => {} }), {
        status: 200,
      });
    };
    expect(
      createRequest(
        '/api/test',
        {},
        { crypto: 'api', fetcher, timeoutMs: 20, cookie: 'MUSIC_A=test' },
      ),
    ).rejects.toMatchObject({ status: 504 });
    expect(aborted).toBe(true);
    expect(getDefaultTrafficGovernor().snapshot.active).toBe(0);
    expect(getDefaultTrafficGovernor().snapshot.waiting).toBe(0);
  });

  test('cancellation releases the outbound permit', async () => {
    resetDefaultTrafficGovernor();

    const controller = new AbortController();
    let resolveStarted!: () => void;
    const startedPromise = new Promise<void>((resolve) => {
      resolveStarted = resolve;
    });
    const fetcher: FetchLike = async (_input, init) => {
      resolveStarted();
      return new Promise((_resolve, reject) =>
        init?.signal?.addEventListener(
          'abort',
          () => reject(new DOMException('Aborted', 'AbortError')),
          { once: true },
        ),
      );
    };
    const pending = createRequest(
      '/api/test',
      {},
      {
        crypto: 'api',
        fetcher,
        signal: controller.signal,
        cookie: 'MUSIC_A=test',
      },
    );
    await startedPromise;
    controller.abort();
    expect(pending).rejects.toMatchObject({ status: 499 });
    expect(getDefaultTrafficGovernor().snapshot.active).toBe(0);
  });
});

const kernelFor = (
  intent: RequestIntent,
  config: ModuleCallConfig,
  governor: TrafficGovernor,
  deadlineAt?: number,
) => {
  const call: Call = {
    identifier: 'test',
    input: {},
    config,
    identity: resolveIdentitySnapshot(config, getRuntimeState(config.state)),
    policy: {
      read: intent.semantic === 'read',
      upload: intent.semantic === 'upload',
    },
    startedAt: Date.now(),
    deadlineAt,
  };
  return requestEffect(intent).pipe(
    Effect.provideService(Call, call),
    Effect.provideService(ProcessServices, {
      governor,
      readState: getRuntimeState,
    }),
  );
};
