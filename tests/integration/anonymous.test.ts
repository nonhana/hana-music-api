import { afterEach, beforeEach, describe, expect, test } from 'bun:test';

import {
  ensureRuntimeAnonymousToken,
  registerAnonymousToken,
} from '../../src/core/anonymous.ts';
import { getRuntimeState, setRuntimeState } from '../../src/core/runtime.ts';
import type { FetchLike } from '../../src/types/index.ts';

const anonymousFetcher = (
  token: string,
): { calls: () => number; fetcher: FetchLike } => {
  let calls = 0;
  const fetcher: FetchLike = async () => {
    calls += 1;

    const response = new Response(JSON.stringify({ code: 200 }), {
      status: 200,
    });
    (
      response.headers as Headers & {
        getSetCookie?: () => Array<string>;
      }
    ).getSetCookie = () => [`MUSIC_A=${token}; Path=/`];

    return response;
  };

  return {
    calls: () => calls,
    fetcher,
  };
};

describe('ensureRuntimeAnonymousToken', () => {
  let previous = getRuntimeState();
  beforeEach(() => {
    previous = getRuntimeState();
    setRuntimeState({ anonymousToken: '' });
  });
  afterEach(() => setRuntimeState(previous));

  test('a successful registration response without MUSIC_A is rejected', async () => {
    expect(
      registerAnonymousToken({
        fetcher: async () => Response.json({ code: 200 }),
      }),
    ).rejects.toMatchObject({
      status: 502,
      body: { msg: 'Anonymous registration did not return MUSIC_A' },
    });
  });

  test('a pre-cancelled caller does not start registration or change the token', async () => {
    setRuntimeState({ anonymousToken: '' });
    const controller = new AbortController();
    controller.abort();
    const { calls, fetcher } = anonymousFetcher('cancelled-token');
    expect(
      ensureRuntimeAnonymousToken({ fetcher, signal: controller.signal }),
    ).rejects.toMatchObject({ status: 499 });
    await Bun.sleep(10);
    expect(calls()).toBe(0);
    expect(getRuntimeState().anonymousToken).toBe('');
  });

  test('should register and cache an anonymous token when runtime has none', async () => {
    setRuntimeState({
      anonymousToken: '',
    });
    const { calls, fetcher } = anonymousFetcher('lazy-token');

    const token = await ensureRuntimeAnonymousToken({
      fetcher,
    });

    expect(token).toBe('lazy-token');
    expect(getRuntimeState().anonymousToken).toBe('lazy-token');
    expect(calls()).toBe(1);
  });

  test('standalone anonymous initialization keeps its caller deadline', async () => {
    const controller = new AbortController();
    let aborted = false;
    const pending = ensureRuntimeAnonymousToken({
      signal: controller.signal,
      timeoutMs: 10,
      fetcher: async (_input, init) => {
        init?.signal?.addEventListener(
          'abort',
          () => {
            aborted = true;
          },
          { once: true },
        );
        return new Promise<Response>(() => {});
      },
    }).catch((error: unknown) => error);
    try {
      const result = await Promise.race([
        pending,
        Bun.sleep(100).then(() => 'deadline not enforced'),
      ]);
      expect(result).toMatchObject({ status: 504 });
      expect(aborted).toBe(true);
      expect(getRuntimeState().anonymousToken).toBe('');
    } finally {
      controller.abort();
      await pending;
    }
  });

  test('should reuse the cached token without re-registering', async () => {
    setRuntimeState({
      anonymousToken: 'existing-token',
    });
    const { calls, fetcher } = anonymousFetcher('should-not-be-used');

    const token = await ensureRuntimeAnonymousToken({
      fetcher,
    });

    expect(token).toBe('existing-token');
    expect(calls()).toBe(0);
  });

  test('should single-flight concurrent callers', async () => {
    setRuntimeState({
      anonymousToken: '',
    });
    const { calls, fetcher } = anonymousFetcher('shared-token');

    const [a, b] = await Promise.all([
      ensureRuntimeAnonymousToken({ fetcher }),
      ensureRuntimeAnonymousToken({ fetcher }),
    ]);

    expect(a).toBe('shared-token');
    expect(b).toBe('shared-token');
    expect(calls()).toBe(1);
  });

  test.each(['one', 'all'] as const)(
    '%s registration waiters can cancel without leaking state',
    async (mode) => {
      let calls = 0;
      let aborted = false;
      let release!: () => void;
      let started!: () => void;
      const ready = new Promise<void>((resolve) => {
        started = resolve;
      });
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      const fetcher: FetchLike = async (_input, init) => {
        calls += 1;
        init?.signal?.addEventListener(
          'abort',
          () => {
            aborted = true;
          },
          { once: true },
        );
        started();
        await gate;
        return Response.json(
          { code: 200 },
          { headers: { 'set-cookie': 'MUSIC_A=shared-cancel-token; Path=/' } },
        );
      };
      const first = new AbortController();
      const second = new AbortController();
      const pendingFirst = ensureRuntimeAnonymousToken({
        fetcher,
        signal: first.signal,
      }).catch((error: unknown) => error);
      const pendingSecond = ensureRuntimeAnonymousToken({
        fetcher,
        signal: second.signal,
      }).catch((error: unknown) => error);
      try {
        await ready;
        first.abort();
        expect(await pendingFirst).toMatchObject({ status: 499 });
        expect(aborted).toBe(false);
        if (mode === 'all') {
          second.abort();
          expect(await pendingSecond).toMatchObject({ status: 499 });
          expect(aborted).toBe(true);
          release();
          await Bun.sleep(1);
          expect(getRuntimeState().anonymousToken).toBe('');
        } else {
          release();
          expect(await pendingSecond).toBe('shared-cancel-token');
          expect(getRuntimeState().anonymousToken).toBe('shared-cancel-token');
        }
        expect(calls).toBe(1);
      } finally {
        first.abort();
        second.abort();
        release();
        await Promise.all([pendingFirst, pendingSecond]);
      }
    },
  );
});
