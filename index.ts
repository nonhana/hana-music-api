import type { ModuleBody as UserPlaylistModuleBody } from './src/modules/user_playlist.ts';

export {
  getNcmFailureInfo,
  isNcmApiResponse,
} from './src/core/failure-guards.ts';
export { createOption } from './src/core/option-builder.ts';
export { createRequest } from './src/core/request.ts';
export { generateDeviceId } from './src/core/utils.ts';
export { createClient } from './src/sdk/client.ts';
export { createHanaMusicApi } from './src/sdk/generated/client.generated.ts';
export * from './src/sdk/generated/client.generated.ts';
export { invokeModule } from './src/sdk/runtime.ts';

export type PlaylistSummary = UserPlaylistModuleBody['playlist'][number];
export type PlaylistUser = NonNullable<PlaylistSummary['creator']>;

export type * from './src/sdk/generated/bodies-types.generated.ts';
export type { RiskBody as LoginCellphoneRiskBody } from './src/modules/login_cellphone.ts';

export type {
  AnySdkModuleInvoker,
  BodySchema,
  CookieRecord,
  CreateHanaMusicApiConfig,
  CreateRequestOptions,
  FetchLike,
  ModuleCallConfig,
  ModuleIdentifier,
  ModuleInputOf,
  ModuleQueryOf,
  ModuleResponseOf,
  NcmApiFailure,
  NcmApiResponse,
  NcmFailureInfo,
  RequestConnectionStrategy,
  RequestCrypto,
  RequestDebugEvent,
  RequestRetryOptions,
  RuntimeState,
  SdkModuleInvoker,
  SdkModuleInvokerFor,
  StandardSchemaV1,
  StandardSchemaV1Issue,
  StandardSchemaV1Options,
  StandardSchemaV1PathSegment,
  StandardSchemaV1Props,
  StandardSchemaV1Result,
  StandardSchemaV1Types,
  UnknownJson,
} from './src/types/index.ts';
export type { HanaMusicApiClient } from './src/sdk/generated/client.generated.ts';
