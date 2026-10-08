import { describe, expect, test } from 'bun:test';

import { Effect, Result } from 'effect';
import { TestClock } from 'effect/testing';

import { UpstreamRateLimited } from '../../src/core/errors.ts';
import { transportEffect } from '../../src/core/transport.ts';
import { runEffect } from '../_kit/it.ts';
import { plainRequest } from '../fixtures/request-capability.ts';

describe('Effect outbound traffic', () => {
  test('HTTP 429 remains typed when its body cannot be decoded', async () => {
    const result = await runEffect(
      Effect.result(
        transportEffect(
          'https://music.163.com/test',
          {
            fetcher: async () =>
              new Response('not json', {
                status: 429,
                headers: { 'Retry-After': '9' },
              }),
          },
          (response) => JSON.parse(new TextDecoder().decode(response.body)),
        ),
      ),
    );
    expect(Result.isFailure(result)).toBe(true);
    if (Result.isFailure(result)) {
      expect(result.failure).toMatchObject({
        _tag: 'UpstreamRateLimited',
        retryAfterMs: 9000,
      });
    }
  });
  test.each([429, 200])(
    'HTTP %s with business 429 fails typed after consuming the body',
    async (status) => {
      let consumed = false;
      const result = await runEffect(
        Effect.result(
          transportEffect('https://music.163.com/api/test', {
            identity: 'snapshot-account',
            fetcher: async () =>
              new Response(
                new ReadableStream({
                  pull: (controller) => {
                    controller.enqueue(
                      new TextEncoder().encode('{"code":429}'),
                    );
                    controller.close();
                    consumed = true;
                  },
                }),
                { status, headers: { 'Retry-After': '7' } },
              ),
          }),
        ),
      );
      expect(Result.isFailure(result)).toBe(true);
      if (Result.isFailure(result)) {
        expect(result.failure).toBeInstanceOf(UpstreamRateLimited);
        expect(result.failure).toMatchObject({
          retryAfterMs: 7000,
          identity: 'snapshot-account',
        });
      }
      expect(consumed).toBe(true);
    },
  );
  test('raw 429 preserves Retry-After', async () => {
    const raw = plainRequest({
      fetcher: async () =>
        new Response('{"code":429}', {
          headers: { 'Retry-After': '7' },
          status: 429,
        }),
    });

    expect(raw('https://music.163.com/api/test')).rejects.toMatchObject({
      status: 429,
      body: { retryAfter: 7 },
    });
  });

  test.each([
    { retryAfter: '-1', retryAfterMs: 30_000 },
    { retryAfter: 'Sun, 31 Feb 2026 08:49:37 GMT', retryAfterMs: 30_000 },
    { retryAfter: 'Sun, 27 Sep 2026 12:00:10 GMT', retryAfterMs: 10_000 },
    { retryAfter: 'Sunday, 27-Sep-26 12:00:10 GMT', retryAfterMs: 10_000 },
    { retryAfter: 'Sun Sep 27 12:00:10 2026', retryAfterMs: 10_000 },
  ])(
    'Retry-After $retryAfter at 12:00:00 asks the caller to wait $retryAfterMs ms',
    async ({ retryAfter, retryAfterMs }) => {
      const result = await runEffect(
        Effect.gen(function* () {
          yield* TestClock.setTime(Date.UTC(2026, 8, 27, 12, 0, 0));
          return yield* Effect.result(
            transportEffect('https://music.163.com/api/test', {
              fetcher: async () =>
                Response.json(
                  { code: 429 },
                  { status: 429, headers: { 'Retry-After': retryAfter } },
                ),
            }),
          );
        }),
        TestClock.layer(),
      );
      expect(Result.isFailure(result)).toBe(true);
      if (Result.isFailure(result)) {
        expect(result.failure).toMatchObject({ retryAfterMs });
      }
    },
  );
});
