import { describe, expect, test } from 'bun:test';

import { Effect, Result } from 'effect';

import { Call } from '../../src/core/call.ts';
import type { CallShape } from '../../src/core/call.ts';
import { resolveIdentitySnapshot } from '../../src/core/identity.ts';
import { createRequest, requestEffect } from '../../src/core/request.ts';
import { getRuntimeState } from '../../src/core/runtime.ts';
import type { FetchLike, ModuleCallConfig } from '../../src/types/index.ts';
import type { RequestIntent } from '../../src/types/runtime.ts';
import { runEffect } from '../_kit/it.ts';
import { plainRequest } from '../fixtures/request-capability.ts';

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
      const result = await runEffect(
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
      const result = await runEffect(
        Effect.result(
          kernelFor(
            { ...scenario, headers: {}, body: '{}', response: 'json' },
            {
              fetcher: async () => {
                calls += 1;
                return Response.json({ code: 200 });
              },
            },
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
      let cancelled = false;
      const result = await runEffect(
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
            Date.now() + 30,
          ),
        ),
      );
      expect(Result.isFailure(result)).toBe(true);
      if (Result.isFailure(result)) {
        expect(result.failure).toMatchObject({ _tag: 'DeadlineExceeded' });
      }
      expect(cancelled).toBe(true);
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
    '$target interruption cancels body consumption',
    async (scenario) => {
      const controller = new AbortController();
      let started!: () => void;
      const ready = new Promise<void>((resolve) => {
        started = resolve;
      });
      let cancelled = false;
      const pending = runEffect(
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
        ),
        undefined,
        { signal: controller.signal },
      ).catch((error: unknown) => error);
      await ready;
      controller.abort();
      await pending;
      expect(cancelled).toBe(true);
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
      const call: CallShape = {
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
      const result = await runEffect(
        Effect.result(
          requestEffect(intent).pipe(Effect.provideService(Call, call)),
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
    },
  );

  test('the plain RequestIntent preserves all byte values in order', async () => {
    const response = await plainRequest({
      fetcher: async () => new Response(new Uint8Array([0, 128, 255, 1])),
    })('https://ymusic.nos-hz.163yun.com/test');
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toEqual([0, 128, 255, 1]);
  });
  test('a pre-cancelled write never reaches the upstream', async () => {
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
  });

  test('the total deadline includes a stalled response body', async () => {
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
  });

  test('cancelling an in-flight request rejects with 499', async () => {
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
  });
});

const kernelFor = (
  intent: RequestIntent,
  config: ModuleCallConfig,
  deadlineAt?: number,
) => {
  const call: CallShape = {
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
  return requestEffect(intent).pipe(Effect.provideService(Call, call));
};
