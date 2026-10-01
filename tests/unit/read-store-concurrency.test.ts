import { expect, test } from 'bun:test';

import { Deferred, Effect, Exit, Fiber, Scheduler } from 'effect';

import { ReadStore } from '../../src/core/read-store.ts';
import { runEffect } from '../_kit/it.ts';

test.each([5, 8])(
  'ReadStore starts one shared execution at scheduler budget %i',
  async (budget) => {
    const store = new ReadStore<number, never>(null);
    const release = Deferred.makeUnsafe<void>();
    let calls = 0;
    const work = Effect.gen(function* () {
      const value = ++calls;
      yield* Deferred.await(release);
      return value;
    });
    const pending = runEffect(
      Effect.all([store.run('same', work), store.run('same', work)], {
        concurrency: 'unbounded',
      }).pipe(Effect.provideService(Scheduler.MaxOpsBeforeYield, budget)),
    );
    await Bun.sleep(10);
    Effect.runSync(Deferred.succeed(release, undefined));
    expect(await pending).toEqual([1, 1]);
    expect(calls).toBe(1);
    expect(store.snapshot).toMatchObject({ inflight: 0, merged: 1 });
  },
);

test.each([10, 11])(
  'ReadStore keeps a joining waiter alive at scheduler budget %i',
  async (budget) => {
    const store = new ReadStore<number, never>(null);
    const started = Deferred.makeUnsafe<void>();
    const release = Deferred.makeUnsafe<void>();
    let interrupted = false;
    const work = Deferred.succeed(started, undefined).pipe(
      Effect.andThen(Deferred.await(release)),
      Effect.as(1),
    );
    const first = Effect.runFork(store.run('same', work));
    await runEffect(Deferred.await(started));
    const second = Effect.runFork(
      store.run('same', work).pipe(
        Effect.provideService(Scheduler.MaxOpsBeforeYield, budget),
        Effect.onInterrupt(() =>
          Effect.sync(() => {
            interrupted = true;
          }),
        ),
      ),
    );
    await runEffect(Fiber.interrupt(first));
    Effect.runSync(Deferred.succeed(release, undefined));
    const result = await runEffect(Fiber.await(second));
    expect(Exit.isSuccess(result)).toBe(true);
    expect(interrupted).toBe(false);
    if (Exit.isSuccess(result)) {
      expect(result.value).toBe(1);
    }
    expect(store.snapshot.inflight).toBe(0);
  },
);

test.each([
  { prefix: 2037, budget: undefined },
  { prefix: 2038, budget: undefined },
  { prefix: 2039, budget: undefined },
  { prefix: 0, budget: 11 },
])(
  'ReadStore completion is atomic at prefix $prefix and budget $budget',
  async ({ prefix, budget }) => {
    const store = new ReadStore<number, never>(60_000);
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
    await runEffect(Deferred.await(started));
    const joining = Effect.gen(function* () {
      for (let index = 0; index < prefix; index += 1) {
        yield* Effect.void;
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
    const values = await runEffect(
      Effect.all([Fiber.join(first), Fiber.join(second)]),
    );
    expect(calls).toBe(1);
    expect(values).toEqual([1, 1]);
    expect(store.snapshot.inflight).toBe(0);
    expect(store.snapshot.cacheHits + store.snapshot.merged).toBe(1);
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
    await runEffect(store.run('same', work, options).pipe(Effect.flip)),
  ).toBe('retry');
  expect(await runEffect(store.run('same', work, options))).toBe(2);
  expect(await runEffect(store.run('same', work, options))).toBe(2);
  expect(calls).toBe(2);
  expect(store.snapshot).toMatchObject({ inflight: 0, cacheHits: 1 });
});

test('an obsolete ReadStore finalizer cannot remove a replacement or its cache', async () => {
  const store = new ReadStore<number, never>(60_000);
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
  await runEffect(Deferred.await(started));
  const cancellation = runEffect(Fiber.interrupt(first));
  await runEffect(Deferred.await(closing));
  expect(await runEffect(store.run('same', Effect.succeed(2), options))).toBe(
    2,
  );
  Effect.runSync(Deferred.succeed(release, undefined));
  await cancellation;
  expect(await runEffect(store.run('same', Effect.succeed(3), options))).toBe(
    2,
  );
  expect(store.snapshot).toMatchObject({ inflight: 0, cacheHits: 1 });
});

test.each([5, 8, 10, 11])(
  'ReadStore interrupts only after its last registered waiter leaves at budget %i',
  async (budget) => {
    const store = new ReadStore<number, never>(null);
    let calls = 0;
    let interrupted = false;
    const work = Effect.sync(() => {
      calls += 1;
    }).pipe(
      Effect.andThen(Effect.never),
      Effect.onInterrupt(() =>
        Effect.sync(() => {
          interrupted = true;
        }),
      ),
    );
    const first = Effect.runFork(
      store
        .run('same', work)
        .pipe(Effect.provideService(Scheduler.MaxOpsBeforeYield, budget)),
    );
    const second = Effect.runFork(
      store
        .run('same', work)
        .pipe(Effect.provideService(Scheduler.MaxOpsBeforeYield, budget)),
    );
    try {
      for (
        let attempts = 0;
        store.snapshot.merged === 0 && attempts < 100;
        attempts += 1
      ) {
        await Bun.sleep(1);
      }
      expect(store.snapshot.merged).toBe(1);
      await runEffect(Fiber.interrupt(first));
      expect(interrupted).toBe(false);
      expect(store.snapshot.inflight).toBe(1);
      await runEffect(Fiber.interrupt(second));
      expect(interrupted).toBe(true);
      expect(calls).toBe(1);
      expect(store.snapshot.inflight).toBe(0);
    } finally {
      await runEffect(Fiber.interruptAll([first, second]));
    }
  },
);
