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

export type ModuleEffect<Input, Body = UnknownJson> = (
  input: Input,
  request: RequestCapability,
) => Effect.Effect<
  ModuleResponse<Body>,
  ModuleInputError | ModuleError | RequestError,
  ModuleServices
>;

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
