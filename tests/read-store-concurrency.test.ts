import { expect, test } from 'bun:test';

import { Deferred, Effect, Exit, Fiber, Scheduler } from 'effect';

import { ReadStore } from '../src/core/read-store.ts';

test.each([5, 8])(
  'ReadStore starts one shared execution at scheduler budget %i',
  async (budget) => {
    const store = new ReadStore<number>(null);
    const release = Deferred.makeUnsafe<void>();
    let calls = 0;
    const work = Effect.gen(function* () {
      const value = ++calls;
      yield* Deferred.await(release);
      return value;
    });
    const pending = Effect.runPromise(
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
    const store = new ReadStore<number>(null);
    const started = Deferred.makeUnsafe<void>();
    const release = Deferred.makeUnsafe<void>();
    let interrupted = false;
    const work = Deferred.succeed(started, undefined).pipe(
      Effect.andThen(Deferred.await(release)),
      Effect.as(1),
    );
    const first = Effect.runFork(store.run('same', work));
    await Effect.runPromise(Deferred.await(started));
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
    await Effect.runPromise(Fiber.interrupt(first));
    Effect.runSync(Deferred.succeed(release, undefined));
    const result = await Effect.runPromise(Fiber.await(second));
    expect(Exit.isSuccess(result)).toBe(true);
    expect(interrupted).toBe(false);
    if (Exit.isSuccess(result)) {
      expect(result.value).toBe(1);
    }
    expect(store.snapshot.inflight).toBe(0);
  },
);

test.each([5, 8, 10, 11])(
  'ReadStore interrupts only after its last registered waiter leaves at budget %i',
  async (budget) => {
    const store = new ReadStore<number>(null);
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
      await Effect.runPromise(Fiber.interrupt(first));
      expect(interrupted).toBe(false);
      expect(store.snapshot.inflight).toBe(1);
      await Effect.runPromise(Fiber.interrupt(second));
      expect(interrupted).toBe(true);
      expect(calls).toBe(1);
      expect(store.snapshot.inflight).toBe(0);
    } finally {
      await Effect.runPromise(Fiber.interruptAll([first, second]));
    }
  },
);
