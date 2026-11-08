import { expect } from 'bun:test';

import { Effect } from 'effect';

import { Call } from '../../src/core/call.ts';
import type { CallShape } from '../../src/core/call.ts';
import { resolveIdentitySnapshot } from '../../src/core/identity.ts';
import { getRuntimeState } from '../../src/core/runtime.ts';
import { sdkModuleRegistry } from '../../src/sdk/generated/registry.generated.ts';
import type {
  ModuleCallConfig,
  ModuleEffect,
  ModuleQuery,
  RequestCapability,
  UnknownJson,
} from '../../src/types/index.ts';

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
  deadlineAt?: number,
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
    config,
    identity: resolveIdentitySnapshot(config, getRuntimeState()),
    startedAt: 0,
    deadlineAt,
    policy: { read: false, upload: true, stageTimeoutMs: 60_000 },
  };
  // Pre-build the Context once and provideService it (rather than providing the layer per run):
  // layer values are captured at build time, and a pre-built Context survives fiber scope
  // closing between provide and run.
  return (result as ReturnType<ModuleEffect<ModuleQuery>>).pipe(
    Effect.provideService(Call, call),
  );
};
