import { describe, expect, test } from 'bun:test';

import { Effect, Result } from 'effect';

import {
  ExecutionScope,
  resolveExecutionScope,
} from '../../../src/core/call-context.ts';
import type { RequestError } from '../../../src/core/errors.ts';
import { resolveIdentitySnapshot } from '../../../src/core/identity.ts';
import {
  createRequest,
  requestEffect,
  resolveRawRequest,
} from '../../../src/core/request.ts';
import type { RawRequestInput } from '../../../src/core/request.ts';
import { getRuntimeState } from '../../../src/core/runtime.ts';
import type {
  CreateRequestOptions,
  FetchLike,
} from '../../../src/types/index.ts';
import type { UpstreamResponse } from '../../../src/types/upstream.ts';
import { provideService, runEffect } from '../../_kit/it.ts';
import { plainRequest } from '../../_kit/module.ts';

describe('Effect request execution', () => {
  test.each([
    {
      protocol: 'api',
      target: '/api/test',
      method: 'POST',
      response: 'json',
      data: {},
    },
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
    '$target body consumption shares the Scope deadline and releases its reader',
    async (scenario) => {
      let cancelled = false;
      const result = await runEffect(
        Effect.result(
          kernelFor(
            { ...scenario, headers: {} },
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
    {
      protocol: 'api',
      target: '/api/test',
      method: 'POST',
      response: 'json',
      data: {},
    },
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
          { ...scenario, headers: {} },
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
    'the resolved kernel serves $target using its identity snapshot',
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
      const request: RawRequestInput =
        scenario.protocol === 'plain'
          ? { ...scenario, protocol: 'plain', method: 'GET', headers: {} }
          : {
              ...scenario,
              protocol: 'api',
              response: 'json',
              method: 'POST',
              headers: {},
              data: {},
            };
      const result = await runEffect(
        Effect.result(
          requestEffect(
            resolveRawRequest(
              request,
              { fetcher },
              resolveIdentitySnapshot({}, state),
            ),
          ).pipe(
            provideService(
              ExecutionScope,
              resolveExecutionScope({ fetcher }, undefined, Date.now(), 0),
            ),
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
    },
  );

  test('the plain request preserves all byte values in order', async () => {
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
  request: RawRequestInput,
  config: CreateRequestOptions,
  deadlineAt?: number,
): Effect.Effect<UpstreamResponse, RequestError> =>
  requestEffect(resolveRawRequest(request, config)).pipe(
    provideService(ExecutionScope, {
      ...resolveExecutionScope(config, undefined, Date.now(), 0),
      deadlineAt,
    }),
  );
