import type { Clock } from 'effect';
import { Context } from 'effect';

import type {
  FetchLike,
  ModuleCallConfig,
  ModuleQuery,
  NcmApiResponse,
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
}

export type CallConfig = Omit<ModuleCallConfig, 'signal'>;

export interface CallInput {
  readonly identifier: string;
  readonly input: unknown;
  readonly config: CallConfig;
  readonly signal?: AbortSignal;
}

export interface CallShape {
  readonly identifier: string;
  readonly actions?: ModuleActions;
  readonly input: Readonly<ModuleQuery>;
  readonly config: CallConfig;
  readonly identity: IdentitySnapshot;
  readonly policy: {
    readonly read: boolean;
    readonly upload: boolean;
    readonly cache?: boolean;
    readonly cacheable?: (response: NcmApiResponse) => boolean;
    readonly stageTimeoutMs?: number;
  };
  readonly execution?: Readonly<InternalExecution>;
  readonly startedAt: number;
  readonly deadlineAt?: number;
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
