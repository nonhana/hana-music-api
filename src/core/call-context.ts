import type { Clock, Ref } from 'effect';
import { Context } from 'effect';

import type {
  FetchLike,
  ModuleCallConfig,
  ModuleQuery,
  NcmApiResponse,
  RequestDebugEvent,
} from '../types/index.ts';
import type { IdentitySnapshot } from './identity-snapshot.ts';
import type { IdentityPool } from './identity.ts';
import type { ReadStore } from './read-store.ts';
import type { ModuleActions } from './request-actions.ts';
import type { RequestEntropy } from './request-plan.ts';
import type { ProcessServices } from './runtime.ts';

export interface InternalExecution {
  readonly fetcher?: FetchLike;
  readonly clock?: Clock.Clock;
  readonly entropy?: (now: number) => RequestEntropy;
  readonly onRequestEvent?: (event: RequestDebugEvent) => void;
}

export interface ExecutionScopeShape {
  readonly fetcher?: FetchLike;
  readonly proxy?: string;
  readonly connectionStrategy?: ModuleCallConfig['connectionStrategy'];
  readonly entropy?: (now: number) => RequestEntropy;
  readonly onRequestEvent?: (event: RequestDebugEvent) => void;
  readonly startedAt: number;
  readonly deadlineAt?: number;
  readonly stageTimeoutMs?: number;
}

export class ExecutionScope extends Context.Service<
  ExecutionScope,
  ExecutionScopeShape
>()('hana-music-api/core/call-context/ExecutionScope') {}

export const resolveExecutionScope = (
  options: Pick<
    ModuleCallConfig,
    'fetcher' | 'proxy' | 'connectionStrategy' | 'onRequestEvent'
  >,
  execution: InternalExecution | undefined,
  startedAt: number,
  timeoutMs: number,
  stageTimeoutMs?: number,
): ExecutionScopeShape =>
  Object.freeze({
    fetcher: options.fetcher ?? execution?.fetcher,
    proxy: options.proxy,
    connectionStrategy: options.connectionStrategy,
    onRequestEvent: options.onRequestEvent ?? execution?.onRequestEvent,
    entropy: execution?.entropy,
    startedAt,
    deadlineAt: timeoutMs > 0 ? startedAt + timeoutMs : undefined,
    stageTimeoutMs,
  });

export interface CallInput {
  readonly identifier: string;
  readonly input: unknown;
  readonly config: ModuleCallConfig;
  readonly defaults?: ModuleCallConfig;
}

export interface CallShape {
  readonly identifier: string;
  readonly actions: ModuleActions;
  readonly input: Readonly<ModuleQuery>;
  readonly identity: IdentitySnapshot;
  readonly policy: {
    readonly read: boolean;
    readonly upload: boolean;
  };
  readonly checkTokenUses?: Ref.Ref<number>;
  readonly tokenSource?: ModuleCallConfig['checkToken'];
  readonly ip?: string;
  readonly retry?: ModuleCallConfig['retry'];
  readonly completedStages?: Ref.Ref<ReadonlyArray<string>>;
}

export class Call extends Context.Service<Call, CallShape>()(
  'hana-music-api/core/call-context/Call',
) {}

export class CallServices extends Context.Service<
  CallServices,
  {
    readonly process: Context.Service.Shape<typeof ProcessServices>;
    readonly reads: ReadStore<NcmApiResponse>;
    readonly pool: IdentityPool | null;
    readonly initializeAnonymous: boolean;
    readonly execution?: Readonly<InternalExecution>;
  }
>()('hana-music-api/core/call-context/CallServices') {}
