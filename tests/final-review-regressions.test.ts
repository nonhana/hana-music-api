import { expect, test } from 'bun:test';

import { Deferred, Effect, Fiber, Result, Scheduler } from 'effect';
import { TestClock } from 'effect/testing';

import {
  Call,
  createClientLayer,
  createProcessLayer,
  runCall,
} from '../src/core/call.ts';
import { ReadStore } from '../src/core/read-store.ts';
import { getRuntimeState, setRuntimeState } from '../src/core/runtime.ts';
import { TrafficGovernor } from '../src/core/traffic.ts';
import registerAnonymous from '../src/modules/register_anonimous.ts';

test.each([
  { prefix: 2037, budget: undefined },
  { prefix: 2038, budget: undefined },
  { prefix: 2039, budget: undefined },
  { prefix: 0, budget: 11 },
])(
  'ReadStore completion is atomic at prefix $prefix and budget $budget',
  async ({ prefix, budget }) => {
    const store = new ReadStore<number>(60_000);
    const started = Deferred.makeUnsafe<void>();
    const release = Deferred.makeUnsafe<void>();
    let calls = 0;
    const work = Effect.gen(function* () {
      const value = ++calls;
      yield* Deferred.succeed(started, undefined);
      yield* Deferred.await(release);
      return value;
    });
    const options = { cache: true, cacheable: () => true };
    const first = Effect.runFork(store.run('same', work, options));
    await Effect.runPromise(Deferred.await(started));
    const joining = Effect.gen(function* () {
      for (let index = 0; index < prefix; index += 1) {
        yield* Effect.sync(() => undefined);
      }
      return yield* store.run('same', work, options);
    });
    const second = Effect.runFork(
      budget === undefined
        ? joining
        : joining.pipe(
            Effect.provideService(Scheduler.MaxOpsBeforeYield, budget),
          ),
    );
    Effect.runSync(Deferred.succeed(release, undefined));
    const values = await Effect.runPromise(
      Effect.all([Fiber.join(first), Fiber.join(second)]),
    );
    expect(calls).toBe(1);
    expect(values).toEqual([1, 1]);
    expect(store.snapshot.inflight).toBe(0);
    expect(store.snapshot.cacheHits + store.snapshot.merged).toBe(1);
  },
);

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
    const results = await Effect.runPromise(
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

test('anonymous module uses the frozen Call device for both username and wire cookie', async () => {
  const original = getRuntimeState();
  const seen: Array<{
    deviceId: string;
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
          crypto: 'api',
          state: { deviceId: 'call-device-123' },
          fetcher: async (_url, init) => {
            if (typeof init?.body !== 'string') {
              throw new TypeError('Expected an encoded API body');
            }
            const username =
              new URLSearchParams(init.body).get('username') ?? '';
            seen.push({
              deviceId: callDeviceId,
              cookie: new Headers(init?.headers).get('cookie'),
              username: Buffer.from(username, 'base64')
                .toString('utf8')
                .split(' ')[0]!,
              global: getRuntimeState(),
            });
            return Response.json(
              { code: 200 },
              { headers: { 'set-cookie': 'MUSIC_A=registered; Path=/' } },
            );
          },
        },
      },
      createClientLayer(createProcessLayer(), {}, false),
      {
        identifier: 'register_anonimous',
        route: '/register/anonimous',
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
  await Effect.runPromise(
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
    }).pipe(Effect.provide(TestClock.layer())),
  );
  expect(governor.snapshot).toMatchObject({ active: 0, waiting: 0 });
});

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
    await Effect.runPromise(
      Effect.gen(function* () {
        yield* governor.withPermit('first-host', 'first-identity', Effect.void);
        const failed = yield* Effect.result(
          governor.withPermit(
            bucket === 'host' ? 'first-host' : 'next-host',
            bucket === 'identity' ? 'first-identity' : 'next-identity',
            Effect.void,
          ),
        );
        expect(Result.isFailure(failed)).toBe(true);
        yield* governor.withPermit('next-host', 'next-identity', Effect.void);
      }).pipe(
        Effect.provide(TestClock.layer()),
        Effect.provideService(Scheduler.MaxOpsBeforeYield, 5),
      ),
    );
    expect(governor.snapshot).toMatchObject({ active: 0, waiting: 0 });
  },
);

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
  await Effect.runPromise(
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
      yield* governor.withPermit('queued-host', 'queued-identity', Effect.void);
    }).pipe(Effect.provide(TestClock.layer())),
  );
  expect(governor.snapshot).toMatchObject({ active: 0, waiting: 0 });
});

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
      await Effect.runPromise(
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

test('ReadStore retries failures before caching the next success', async () => {
  const store = new ReadStore<number, string>(60_000);
  let calls = 0;
  const options = { cache: true, cacheable: () => true };
  const work = Effect.suspend(() =>
    ++calls === 1 ? Effect.fail('retry') : Effect.succeed(calls),
  );
  expect(
    await Effect.runPromise(store.run('same', work, options).pipe(Effect.flip)),
  ).toBe('retry');
  expect(await Effect.runPromise(store.run('same', work, options))).toBe(2);
  expect(await Effect.runPromise(store.run('same', work, options))).toBe(2);
  expect(calls).toBe(2);
  expect(store.snapshot).toMatchObject({ inflight: 0, cacheHits: 1 });
});

test('an obsolete ReadStore finalizer cannot remove a replacement or its cache', async () => {
  const store = new ReadStore<number>(60_000);
  const started = Deferred.makeUnsafe<void>();
  const closing = Deferred.makeUnsafe<void>();
  const release = Deferred.makeUnsafe<void>();
  const options = { cache: true, cacheable: () => true };
  const work = Deferred.succeed(started, undefined).pipe(
    Effect.andThen(Effect.never),
    Effect.onInterrupt(() =>
      Deferred.succeed(closing, undefined).pipe(
        Effect.andThen(Deferred.await(release)),
      ),
    ),
  );
  const first = Effect.runFork(store.run('same', work, options));
  await Effect.runPromise(Deferred.await(started));
  const cancellation = Effect.runPromise(Fiber.interrupt(first));
  await Effect.runPromise(Deferred.await(closing));
  expect(
    await Effect.runPromise(store.run('same', Effect.succeed(2), options)),
  ).toBe(2);
  Effect.runSync(Deferred.succeed(release, undefined));
  await cancellation;
  expect(
    await Effect.runPromise(store.run('same', Effect.succeed(3), options)),
  ).toBe(2);
  expect(store.snapshot).toMatchObject({ inflight: 0, cacheHits: 1 });
});
