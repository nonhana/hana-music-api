import { describe, expect, test } from 'bun:test';

import { Deferred, Effect, Fiber, Result, Scheduler } from 'effect';
import { TestClock } from 'effect/testing';

import { UpstreamRateLimited } from '../../src/core/errors.ts';
import type { TrafficEvent } from '../../src/core/runtime.ts';
import { TrafficGovernor } from '../../src/core/traffic.ts';
import { transportEffect } from '../../src/core/transport.ts';
import { runEffect } from '../_kit/it.ts';
import { plainRequest } from '../fixtures/request-capability.ts';

describe('Effect outbound traffic', () => {
  test('HTTP 429 remains typed when its body cannot be decoded', async () => {
    const runtime = { governor: new TrafficGovernor() };
    const result = await runEffect(
      Effect.result(
        transportEffect(
          'https://music.163.com/test',
          {
            runtime,
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
    expect(runtime.governor.snapshot.active).toBe(0);
  });
  test.each([429, 200])(
    'HTTP %s with business 429 fails typed and cools exactly once',
    async (status) => {
      const events: Array<string> = [];
      const runtime = {
        governor: new TrafficGovernor(),
        onTrafficEvent: (event: TrafficEvent) => events.push(event.phase),
      };
      let consumed = false;
      const result = await runEffect(
        Effect.result(
          transportEffect('https://music.163.com/api/test', {
            runtime,
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
      expect(events.filter((event) => event === 'cooldown')).toHaveLength(1);
      expect(runtime.governor.snapshot.active).toBe(0);
    },
  );
  test('raw 429 preserves Retry-After and emits a cooldown event', async () => {
    const events: Array<string> = [];
    const runtime = {
      governor: new TrafficGovernor(),
      onTrafficEvent: (event: TrafficEvent) => events.push(event.phase),
    };
    const raw = plainRequest(
      {
        fetcher: async () =>
          new Response('{"code":429}', {
            headers: { 'Retry-After': '7' },
            status: 429,
          }),
      },
      runtime,
    );

    expect(raw('https://music.163.com/api/test')).rejects.toMatchObject({
      status: 429,
      body: { retryAfter: 7 },
    });
    expect(events).toContain('cooldown');
  });

  test.each(['-1', 'Sun, 31 Feb 2026 08:49:37 GMT'])(
    'invalid Retry-After %s keeps the default host cooldown',
    async (retryAfter) => {
      const runtime = { governor: new TrafficGovernor() };
      let calls = 0;
      const fetcher = async () => {
        calls += 1;
        return Response.json(
          { code: 429 },
          { status: 429, headers: { 'Retry-After': retryAfter } },
        );
      };
      await runEffect(
        Effect.gen(function* () {
          yield* TestClock.setTime(Date.UTC(2090, 3, 1));
          const first = yield* Effect.result(
            transportEffect('https://music.163.com/api/test', {
              runtime,
              fetcher,
              identity: 'first',
            }),
          );
          expect(Result.isFailure(first)).toBe(true);
          yield* TestClock.adjust('2 seconds');
          const second = yield* Effect.result(
            transportEffect('https://music.163.com/api/test', {
              runtime,
              fetcher,
              identity: 'second',
            }),
          );
          expect(Result.isFailure(second)).toBe(true);
        }),
        TestClock.layer(),
      );
      expect(calls).toBe(1);
    },
  );

  test.each([
    'Sun, 27 Sep 2026 12:00:10 GMT',
    'Sunday, 27-Sep-26 12:00:10 GMT',
    'Sun Sep 27 12:00:10 2026',
  ])(
    'HTTP-date Retry-After %s expires at the advertised time',
    async (retryAfter) => {
      const runtime = { governor: new TrafficGovernor() };
      const now = Date.UTC(2026, 8, 27, 12, 0, 0);
      let calls = 0;
      const fetcher = async () => {
        calls += 1;
        return calls === 1
          ? Response.json(
              { code: 429 },
              { status: 429, headers: { 'Retry-After': retryAfter } },
            )
          : Response.json({ code: 200 });
      };
      await runEffect(
        Effect.gen(function* () {
          yield* TestClock.setTime(now);
          const first = yield* Effect.result(
            transportEffect('https://music.163.com/api/test', {
              runtime,
              fetcher,
            }),
          );
          expect(Result.isFailure(first)).toBe(true);
          yield* TestClock.adjust('2 seconds');
          const duringCooldown = yield* Effect.result(
            transportEffect('https://music.163.com/api/test', {
              runtime,
              fetcher,
            }),
          );
          expect(Result.isFailure(duringCooldown)).toBe(true);
          yield* TestClock.adjust('10 seconds');
          const afterCooldown = yield* transportEffect(
            'https://music.163.com/api/test',
            {
              runtime,
              fetcher,
            },
          );
          expect(afterCooldown.status).toBe(200);
        }),
        TestClock.layer(),
      );
      expect(calls).toBe(2);
    },
  );

  test('host cooldown crosses identities and expires', async () => {
    const governor = new TrafficGovernor();
    await runEffect(
      Effect.gen(function* () {
        yield* governor.cool('music.163.com', 'first', 30_000);
        const denied = yield* Effect.result(
          governor.withPermit('music.163.com', 'second', Effect.void),
        );
        expect(Result.isFailure(denied)).toBe(true);
        yield* TestClock.adjust('30 seconds');
        yield* governor.withPermit('music.163.com', 'second', Effect.void);
      }),
      TestClock.layer(),
    );
    expect(governor.snapshot.active).toBe(0);
    expect(governor.snapshot.waiting).toBe(0);
  });

  test('limits 100 distinct tasks to eight active and 32 waiting', async () => {
    const governor = new TrafficGovernor({
      maxInFlight: 8,
      maxWaiting: 32,
      waitMs: 50,
      hostRate: 100,
      hostBurst: 100,
      identityRate: 100,
      identityBurst: 100,
    });
    let active = 0;
    let peak = 0;
    const tasks = Array.from({ length: 100 }, (_, index) =>
      runEffect(
        governor.withPermit(
          'music.163.com',
          String(index),
          Effect.tryPromise({
            try: async () => {
              active += 1;
              peak = Math.max(peak, active);
              await Bun.sleep(30);
              active -= 1;
            },
            catch: (error) =>
              error instanceof Error ? error : new Error(String(error)),
          }),
        ),
      ).catch((error) => error),
    );
    await Promise.all(tasks);
    expect(peak).toBeLessThanOrEqual(8);
    expect(governor.snapshot.peakWaiting).toBeLessThanOrEqual(32);
    expect(governor.snapshot.active).toBe(0);
    expect(governor.snapshot.waiting).toBe(0);
  });

  test('Governor refills both budgets while waiting with the Effect clock', async () => {
    const governor = new TrafficGovernor({
      maxInFlight: 1,
      maxWaiting: 2,
      waitMs: 2000,
      hostBurst: 1,
      hostRate: 1,
      identityBurst: 1,
      identityRate: 1,
    });
    let sends = 0;
    await runEffect(
      Effect.gen(function* () {
        yield* governor.withPermit(
          'host',
          'identity',
          Effect.sync(() => ++sends),
        );
        const pending = yield* governor
          .withPermit(
            'host',
            'identity',
            Effect.sync(() => ++sends),
            true,
          )
          .pipe(Effect.forkChild);
        yield* TestClock.adjust('999 millis');
        expect(sends).toBe(1);
        yield* TestClock.adjust('11 millis');
        expect(yield* Fiber.join(pending)).toBe(2);
      }),
      TestClock.layer(),
    );
    expect(governor.snapshot).toMatchObject({ active: 0, waiting: 0 });
  });

  test('waiting for a semaphore cannot consume tokens and cancellation releases queue entries', async () => {
    const governor = new TrafficGovernor({
      maxInFlight: 1,
      maxWaiting: 2,
      waitMs: 1000,
      hostBurst: 1,
      hostRate: 1,
      identityBurst: 1,
      identityRate: 1,
    });
    const started = Deferred.makeUnsafe<void>();
    await runEffect(
      Effect.gen(function* () {
        const first = yield* governor
          .withPermit(
            'first-host',
            'first-identity',
            Deferred.succeed(started, undefined).pipe(
              Effect.andThen(Effect.never),
            ),
          )
          .pipe(Effect.forkChild);
        yield* Deferred.await(started);
        const queued = yield* governor
          .withPermit('queued-host', 'queued-identity', Effect.void)
          .pipe(Effect.forkChild);
        yield* TestClock.adjust('50 millis');
        yield* Fiber.interrupt(queued);
        yield* Fiber.interrupt(first);
        yield* governor.withPermit(
          'queued-host',
          'queued-identity',
          Effect.void,
        );
      }),
      TestClock.layer(),
    );
    expect(governor.snapshot).toMatchObject({ active: 0, waiting: 0 });
  });

  test.each([
    { bucket: 'host', budget: 5 },
    { bucket: 'host', budget: 10 },
    { bucket: 'identity', budget: 5 },
    { bucket: 'identity', budget: 10 },
  ])(
    'Governor reserves the $bucket burst atomically at budget $budget',
    async ({ bucket, budget }) => {
      const governor = new TrafficGovernor({
        maxInFlight: 100,
        maxWaiting: 200,
        waitMs: 1000,
        hostBurst: bucket === 'host' ? 1 : 1000,
        hostRate: 1,
        identityBurst: bucket === 'identity' ? 1 : 1000,
        identityRate: 1,
      });
      let sends = 0;
      const results = await runEffect(
        Effect.all(
          Array.from({ length: 50 }, (_, index) =>
            Effect.result(
              governor.withPermit(
                bucket === 'host' ? 'same-host' : `host-${index}`,
                'same-identity',
                Effect.sync(() => ++sends),
              ),
            ),
          ),
          { concurrency: 'unbounded' },
        ).pipe(Effect.provideService(Scheduler.MaxOpsBeforeYield, budget)),
      );
      expect(sends).toBe(1);
      expect(results.filter(Result.isSuccess)).toHaveLength(1);
      expect(governor.snapshot).toMatchObject({ active: 0, waiting: 0 });
    },
  );

  test.each(['host', 'identity'])(
    'failed %s budget cannot consume the other token',
    async (bucket) => {
      const governor = new TrafficGovernor({
        maxInFlight: 2,
        maxWaiting: 2,
        waitMs: 1000,
        hostBurst: 1,
        hostRate: 1,
        identityBurst: 1,
        identityRate: 1,
      });
      await runEffect(
        Effect.gen(function* () {
          yield* governor.withPermit(
            'first-host',
            'first-identity',
            Effect.void,
          );
          const failed = yield* Effect.result(
            governor.withPermit(
              bucket === 'host' ? 'first-host' : 'next-host',
              bucket === 'identity' ? 'first-identity' : 'next-identity',
              Effect.void,
            ),
          );
          expect(Result.isFailure(failed)).toBe(true);
          yield* governor.withPermit('next-host', 'next-identity', Effect.void);
        }).pipe(Effect.provideService(Scheduler.MaxOpsBeforeYield, 5)),
        TestClock.layer(),
      );
      expect(governor.snapshot).toMatchObject({ active: 0, waiting: 0 });
    },
  );

  test.each([5, 8, 10, 11, 15])(
    'interruption releases a partially acquired permit at budget %i',
    async (budget) => {
      for (let turns = 0; turns < 40; turns += 1) {
        const governor = new TrafficGovernor({
          maxInFlight: 1,
          maxWaiting: 2,
          waitMs: 30,
          hostBurst: 100,
          hostRate: 100,
          identityBurst: 100,
          identityRate: 100,
        });
        await runEffect(
          Effect.gen(function* () {
            const pending = yield* governor
              .withPermit('host', 'identity', Effect.never)
              .pipe(
                Effect.provideService(Scheduler.MaxOpsBeforeYield, budget),
                Effect.forkChild,
              );
            for (let step = 0; step < turns; step += 1) {
              yield* Effect.yieldNow;
            }
            yield* Fiber.interrupt(pending);
            expect(governor.snapshot).toMatchObject({ active: 0, waiting: 0 });
            yield* governor.withPermit('host', 'identity', Effect.void);
          }),
        );
      }
    },
  );
});
