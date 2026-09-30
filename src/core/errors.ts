import { Data } from 'effect';

import type { UpstreamResponse } from '../types/upstream.ts';

export class InvalidRequest extends Data.TaggedError('InvalidRequest')<{
  readonly message: string;
}> {}

export class TargetRejected extends Data.TaggedError('TargetRejected')<{
  readonly message: string;
}> {}

export class AdmissionRejected extends Data.TaggedError('AdmissionRejected')<{
  readonly message: string;
  readonly retryAfterMs?: number;
}> {}

export class UpstreamRateLimited extends Data.TaggedError(
  'UpstreamRateLimited',
)<{
  readonly host: string;
  readonly identity: string;
  readonly retryAfterMs: number;
  readonly status: number;
  readonly message?: string;
  readonly response?: UpstreamResponse;
}> {}

export class DeadlineExceeded extends Data.TaggedError('DeadlineExceeded')<{
  readonly message: string;
}> {}

export class TransportFailed extends Data.TaggedError('TransportFailed')<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class ResponseDecodeFailed extends Data.TaggedError(
  'ResponseDecodeFailed',
)<{
  readonly message: string;
}> {}

export class ProtocolFailed extends Data.TaggedError('ProtocolFailed')<{
  readonly message: string;
  readonly response?: UpstreamResponse;
}> {}

export class InvalidModuleInput extends Data.TaggedError('InvalidModuleInput')<{
  readonly message: string;
  readonly status?: number;
}> {}

export class UnexpectedUpstreamShape extends Data.TaggedError(
  'UnexpectedUpstreamShape',
)<{
  readonly module: string;
  readonly path: string;
  readonly expected: string;
  readonly actual: string;
}> {}

export class UpstreamBusinessFailed extends Data.TaggedError(
  'UpstreamBusinessFailed',
)<{
  readonly message: string;
  readonly code?: number;
  readonly response?: UpstreamResponse;
}> {}

export class PartialUpload extends Data.TaggedError('PartialUpload')<{
  readonly completedStages: ReadonlyArray<string>;
  readonly module: string;
  readonly cause?: unknown;
}> {}

export class ModuleInvariantFailed extends Data.TaggedError(
  'ModuleInvariantFailed',
)<{
  readonly message: string;
}> {}

export type RequestError =
  | InvalidRequest
  | TargetRejected
  | AdmissionRejected
  | UpstreamRateLimited
  | DeadlineExceeded
  | TransportFailed
  | ResponseDecodeFailed
  | ProtocolFailed;

export type ModuleInputError = InvalidModuleInput;

export type ModuleError =
  | UnexpectedUpstreamShape
  | UpstreamBusinessFailed
  | PartialUpload
  | ModuleInvariantFailed;
