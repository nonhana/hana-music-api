export { getNcmFailureInfo, isNcmApiResponse } from '../core/failure-guards.ts';
export { createOption } from '../core/option-builder.ts';
export { createRequest } from '../core/request.ts';
export { generateDeviceId } from '../core/utils.ts';
export { createClient } from './client.ts';

export type {
  AnySdkModuleInvoker,
  BodySchema,
  CookieRecord,
  CreateHanaMusicApiConfig,
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
  SdkModuleInvokerFor,
  StandardSchemaV1,
  StandardSchemaV1Issue,
  StandardSchemaV1Options,
  StandardSchemaV1PathSegment,
  StandardSchemaV1Props,
  StandardSchemaV1Result,
  StandardSchemaV1Types,
  UnknownJson,
} from '../types/index.ts';
