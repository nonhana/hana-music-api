import { describe, expect, test } from 'bun:test';

import { Effect, Fiber, Result } from 'effect';
import { TestClock } from 'effect/testing';

import { AdmissionController } from '../../src/server/admission.ts';
import { runEffect } from '../_kit/it.ts';

describe('HTTP admission', () => {
  test('refills the per-identity bucket using the Effect clock', async () => {
    const admission = new AdmissionController({
      burst: 1,
      requestsPerSecond: 1,
    });
    await runEffect(
      Effect.gen(function* () {
        yield* admission.run('unknown', false, Effect.void);
        const denied = yield* Effect.result(
          admission.run('unknown', false, Effect.void),
        );
        expect(Result.isFailure(denied)).toBe(true);
        yield* TestClock.adjust('1 second');
        yield* admission.run('unknown', false, Effect.void);
      }),
      TestClock.layer(),
    );
    expect(admission.snapshot).toEqual({ active: 0, uploadActive: 0 });
  });

  test('releases module and upload permits after cancellation and errors', async () => {
    const admission = new AdmissionController({ maxUploads: 1 });
    await runEffect(
      Effect.gen(function* () {
        const fiber = yield* admission
          .run('first', true, Effect.never)
          .pipe(Effect.forkChild);
        yield* Effect.yieldNow;
        expect(admission.snapshot.uploadActive).toBe(1);
        const denied = yield* Effect.result(
          admission.run('second', true, Effect.void),
        );
        expect(Result.isFailure(denied)).toBe(true);
        yield* Fiber.interrupt(fiber);
        yield* Effect.result(
          admission.run('third', true, Effect.fail(new Error('expected'))),
        );
      }),
    );
    expect(admission.snapshot).toEqual({ active: 0, uploadActive: 0 });
  });
});
