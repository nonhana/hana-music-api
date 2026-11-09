import { expect } from 'bun:test';

import { Cause, Effect, Exit, Ref } from 'effect';

import {
  ExecutionScope,
  resolveExecutionScope,
} from '../../src/core/call-context.ts';
import { buildCallServices, Call, runCall } from '../../src/core/call.ts';
import type { CallShape } from '../../src/core/call.ts';
import { resolveIdentitySnapshot } from '../../src/core/identity.ts';
import { getRuntimeState } from '../../src/core/runtime.ts';
import { sdkModuleRegistry } from '../../src/sdk/generated/registry.generated.ts';
import type {
  FetchLike,
  ModuleCallConfig,
  ModuleEffect,
  ModuleQuery,
  RequestCapability,
  UnknownJson,
} from '../../src/types/index.ts';
import { settle } from './assertions.ts';
import { testEntropy } from './harness/sdk.ts';

export const response = (body: unknown, headers = new Headers()) => ({
  status: 200,
  cookie: [],
  headers,
  body: body as UnknownJson,
});

export const executeModule = (
  implementation: unknown,
  input: ModuleQuery,
  request: RequestCapability,
  config: ModuleCallConfig = {},
) => {
  const result: unknown = Reflect.apply(
    implementation as (...args: Array<unknown>) => unknown,
    undefined,
    [input, request],
  );
  if (result instanceof Promise) {
    void result.catch(() => undefined);
  }
  expect(Effect.isEffect(result)).toBe(true);
  const call: CallShape = {
    actions:
      Object.values(sdkModuleRegistry).find(
        (definition) => definition.execute === implementation,
      )?.actions ?? {},
    identifier: 'upload-test',
    input,
    identity: resolveIdentitySnapshot(config, getRuntimeState()),
    policy: { read: false, upload: true },
  };
  return (result as ReturnType<ModuleEffect<ModuleQuery>>).pipe(
    Effect.provideService(Call, call),
    Effect.provideService(ExecutionScope, {
      ...resolveExecutionScope(config, undefined, 0, 0, 60_000),
    }),
  );
};

export const captureBoundModule = async (
  implementation: unknown,
  input: ModuleQuery,
  fetcher: FetchLike,
  config: ModuleCallConfig = {},
) => {
  const definition = Object.values(sdkModuleRegistry).find(
    (entry) => entry.execute === implementation,
  );
  if (!definition)
    throw new Error('Bound module test requires a registered implementation');
  let failure: unknown;
  let completedStages: ReadonlyArray<string> = [];
  const outcome = await settle(
    runCall(
      { identifier: definition.identifier, input, config },
      buildCallServices({}, false, { fetcher, entropy: testEntropy }),
      {
        ...definition,
        execute: (decoded, request) => {
          const work: unknown = Reflect.apply(definition.execute, undefined, [
            decoded,
            request,
          ]);
          if (!Effect.isEffect(work))
            throw new Error('Module must construct Effect work');
          return (work as ReturnType<ModuleEffect<ModuleQuery>>).pipe(
            Effect.onExit((exit) =>
              Effect.gen(function* () {
                if (Exit.isFailure(exit)) failure = Cause.squash(exit.cause);
                const call = yield* Call;
                completedStages = call.completedStages
                  ? yield* Ref.get(call.completedStages)
                  : [];
              }),
            ),
          );
        },
      },
    ),
  );
  return { outcome, failure, completedStages };
};
