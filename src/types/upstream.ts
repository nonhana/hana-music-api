import type { UnknownJson } from './unknown.ts';

export type JsonPrimitive = boolean | number | string | null;

export type DynamicJsonValue = unknown;

export type DynamicJsonRecord = Record<string, unknown>;

export type DynamicJsonArray = Array<unknown>;

// This alias is reserved for unstable upstream response bodies and dynamic parse edges.
export type UnsafeUpstreamValue = ReturnType<typeof JSON.parse>;
export type UnsafeUpstreamRecord = Record<string, UnsafeUpstreamValue>;

export type UpstreamBody = UnknownJson;

export type LegacyResponseBody =
  | DynamicJsonArray
  | DynamicJsonRecord
  | JsonPrimitive
  | UnsafeUpstreamRecord
  | Array<UnsafeUpstreamRecord>;

export interface UpstreamResponse {
  readonly status: number;
  readonly headers: Headers;
  readonly cookie: ReadonlyArray<string>;
  readonly body: UnknownJson;
}
