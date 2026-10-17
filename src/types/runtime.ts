import type { Effect } from 'effect';

import type {
  ModuleError,
  ModuleInputError,
  RequestError,
} from '../core/errors.ts';
import type { requestEffect, RequestServices } from '../core/request.ts';
import type { LegacyModuleInput } from './legacy.ts';
import type { UnknownJson } from './unknown.ts';
import type { LegacyResponseBody } from './upstream.ts';

export type RequestCrypto = '' | 'api' | 'eapi' | 'linuxapi' | 'weapi';

export type RequestProtocol = Exclude<RequestCrypto, ''>;

export type RequestClient = 'web' | 'desktop' | 'iphone' | 'android';

export type CheckTokenPolicy = 'none' | 'optional' | 'required';

export type RequestProfileName = 'web' | 'desktop';

export interface RequestProfileCachePolicy {
  readonly reads: boolean;
}

export interface RequestProfileRetryPolicy {
  readonly read: boolean;
}

export interface RequestProfile {
  readonly protocol: RequestProtocol;
  readonly client: RequestClient;
  readonly userAgent: string;
  readonly cookie: Readonly<CookieRecord>;
  readonly checkToken: CheckTokenPolicy;
  readonly cache: RequestProfileCachePolicy;
  readonly retry: RequestProfileRetryPolicy;
}

export interface ModuleRequestMetadata {
  readonly profile: RequestProfileName | 'legacy';
  readonly checkToken: CheckTokenPolicy;
}

export type BooleanLike = boolean | number | string;

export type CookieValue = boolean | number | string;

export type CookieRecord = Record<string, CookieValue | undefined>;

export type FetchLike = (
  input: Request | URL | string,
  init?: RequestInit,
) => Promise<Response>;

export type ModuleQuery = Record<string, unknown>;

export interface RuntimeState {
  readonly anonymousToken: string;
  readonly cnIp: string;
  readonly deviceId: string;
}

export interface RequestIntent {
  readonly target: string;
  readonly protocol: 'api' | 'weapi' | 'eapi' | 'linuxapi' | 'plain';
  readonly method: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly domain?: string;
  readonly cookieOverrides?: CookieRecord;
  readonly checkToken?: boolean;
  readonly body?: Uint8Array | string;
  readonly response: 'json' | 'text' | 'bytes';
  readonly semantic: 'read' | 'write' | 'login' | 'upload';
}

export interface ModuleResponse<Body = UnknownJson> {
  body: Body;
  cookie: Array<string>;
  status: number;
}

export type NcmApiResponse<TBody = LegacyResponseBody> = ModuleResponse<TBody>;

export type RequestCapability = typeof requestEffect;

export type ModuleServices = RequestServices;

export type ModuleEffect<Input, Body = UnknownJson> = ((
  input: Input,
  request: RequestCapability,
) => Effect.Effect<
  ModuleResponse<Body>,
  ModuleInputError | ModuleError | RequestError,
  ModuleServices
>) & {
  readonly request?: ModuleRequestMetadata;
};

export interface ModuleDefinition<
  Identifier extends string = string,
  Input = LegacyModuleInput,
  Body = UnknownJson,
> {
  readonly identifier: Identifier;
  readonly route: string;
  readonly decodeInput: (
    input: unknown,
  ) => Effect.Effect<Input, ModuleInputError>;
  readonly execute: ModuleEffect<Input, Body>;
}
