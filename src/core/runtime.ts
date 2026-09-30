import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';

import { Context, Effect, Layer } from 'effect';

import type { RuntimeState } from '../types/index.ts';
import { DeadlineExceeded } from './errors.ts';
import { normalizeFailure } from './response.ts';
import { getDefaultTrafficGovernor } from './traffic.ts';
import type { TrafficGovernor } from './traffic.ts';
import { generateDeviceId, generateRandomChineseIP } from './utils.ts';

export const DEFAULT_ANONYMOUS_TOKEN_PATH = resolve(
  tmpdir(),
  'anonymous_token',
);

export const readAnonymousToken = (
  filePath = DEFAULT_ANONYMOUS_TOKEN_PATH,
): string => {
  try {
    return readFileSync(filePath, 'utf8').trim();
  } catch {
    return '';
  }
};

let runtimeState: RuntimeState = {
  anonymousToken: readAnonymousToken(DEFAULT_ANONYMOUS_TOKEN_PATH),
  cnIp: generateRandomChineseIP(),
  deviceId: generateDeviceId(),
};

export const getRuntimeState = (
  overrides: Partial<RuntimeState> = {},
): RuntimeState => {
  return {
    ...runtimeState,
    ...overrides,
  };
};

export const setRuntimeState = (
  nextState: Partial<RuntimeState>,
): RuntimeState => {
  runtimeState = {
    ...runtimeState,
    ...nextState,
  };

  return runtimeState;
};

export const writeAnonymousToken = (
  token: string,
  filePath = DEFAULT_ANONYMOUS_TOKEN_PATH,
): void => {
  mkdirSync(dirname(filePath), {
    recursive: true,
  });
  writeFileSync(filePath, token, 'utf8');
  setRuntimeState({
    anonymousToken: token,
  });
};

export interface TrafficEvent {
  readonly phase: 'admission' | 'send' | 'cooldown' | 'complete';
  readonly host: string;
  readonly active: number;
  readonly waiting: number;
  readonly status?: number;
}

export interface RequestRuntime {
  readonly governor: TrafficGovernor;
  readonly onTrafficEvent?: (event: TrafficEvent) => void;
}

export class ProcessServices extends Context.Service<
  ProcessServices,
  RequestRuntime & {
    readonly readState: typeof getRuntimeState;
    readonly waitForRate?: boolean;
  }
>()('hana/ProcessServices') {}

export const createProcessLayer = (
  runtime: RequestRuntime = { governor: getDefaultTrafficGovernor() },
) => {
  return Layer.succeed(ProcessServices, {
    ...runtime,
    readState: getRuntimeState,
  });
};

export const runPublicEffect = async <Value>(
  work: Effect.Effect<Value, unknown>,
  signal?: AbortSignal,
  failure?: () => unknown,
): Promise<Value> => {
  if (signal?.aborted) {
    throw normalizeFailure(signal.reason, true);
  }
  try {
    return await Effect.runPromise(work, { signal });
  } catch (error) {
    throw normalizeFailure(
      failure?.() ?? error,
      signal?.aborted,
      error instanceof DeadlineExceeded,
    );
  }
};
