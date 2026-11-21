export { getNcmFailureInfo, isNcmApiResponse } from '../core/failure-guards.ts';
export { createOption } from '../core/option-builder.ts';
export { generateDeviceId } from '../core/utils.ts';

export type {
  CookieRecord,
  CreateRequestOptions,
  FetchLike,
  ModuleCallConfig,
  NcmApiFailure,
  NcmApiResponse,
  NcmFailureInfo,
  RequestConnectionStrategy,
  RequestCrypto,
  RequestDebugEvent,
  RequestRetryOptions,
  RuntimeState,
} from '../types/index.ts';
