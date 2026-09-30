import { Cause, Clock, Effect } from 'effect';

import type { ModuleServices, RequestCapability } from '../types/index.ts';
import { Call } from './call.ts';
import type { ModuleError, ModuleInputError, RequestError } from './errors.ts';
import { DeadlineExceeded, PartialUpload } from './errors.ts';

export const uploadWork = <Value>(
  module: string,
  request: RequestCapability,
  execute: (
    stage: RequestCapability,
  ) => Effect.Effect<
    Value,
    ModuleError | ModuleInputError | RequestError,
    ModuleServices
  >,
) => {
  return Effect.suspend(() => {
    let completedStages: ReadonlyArray<string> = [];
    const stage: RequestCapability = (intent) =>
      Effect.gen(function* () {
        const call = yield* Call;
        const now = yield* Clock.currentTimeMillis;
        if (call.deadlineAt !== undefined && now >= call.deadlineAt) {
          return yield* Effect.fail(
            new DeadlineExceeded({ message: 'Request timed out' }),
          );
        }
        const response = yield* request(intent);
        completedStages = [...completedStages, intent.target];
        return response;
      });
    return Effect.uninterruptibleMask((restore) =>
      restore(execute(stage)).pipe(
        Effect.catchCause((cause) =>
          completedStages.length === 0 || Cause.hasDies(cause)
            ? Effect.failCause(cause)
            : Effect.fail(
                new PartialUpload({
                  module,
                  completedStages,
                  cause: Cause.hasInterrupts(cause)
                    ? cause
                    : Cause.squash(cause),
                }),
              ),
        ),
      ),
    );
  });
};
