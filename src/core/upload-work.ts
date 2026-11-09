import { Cause, Effect, Ref } from 'effect';

import type { ModuleServices, RequestCapability } from '../types/index.ts';
import { Call } from './call-context.ts';
import type { ModuleError, ModuleInputError, RequestError } from './errors.ts';
import { PartialUpload } from './errors.ts';
import type { ModuleActions } from './request-actions.ts';

export const uploadWork = <Value, Actions extends ModuleActions>(
  module: string,
  request: RequestCapability<Actions>,
  execute: (
    request: RequestCapability<Actions>,
  ) => Effect.Effect<
    Value,
    ModuleError | ModuleInputError | RequestError,
    ModuleServices
  >,
) =>
  Effect.gen(function* () {
    const { completedStages: progress } = yield* Call;
    const start = progress ? (yield* Ref.get(progress)).length : 0;
    return yield* Effect.uninterruptibleMask((restore) =>
      restore(execute(request)).pipe(
        Effect.catchCauseIf(
          (cause) => !Cause.hasDies(cause),
          (cause) =>
            Effect.gen(function* () {
              const completedStages = progress
                ? (yield* Ref.get(progress)).slice(start)
                : [];
              if (!completedStages.length) {
                return yield* Effect.failCause(cause);
              }
              const failure = Cause.hasInterrupts(cause)
                ? cause
                : Cause.squash(cause);
              return yield* PartialUpload.make({
                module,
                completedStages,
                cause: failure,
              });
            }),
        ),
      ),
    );
  });
