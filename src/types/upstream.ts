export type JsonPrimitive = boolean | number | string | null

export type DynamicJsonValue = unknown

export type DynamicJsonRecord = Record<string, unknown>

export type DynamicJsonArray = unknown[]

// This alias is reserved for unstable upstream response bodies and dynamic parse edges.
export type UnsafeUpstreamValue = ReturnType<typeof JSON.parse>
export type UnsafeUpstreamRecord = Record<string, UnsafeUpstreamValue>

export type UpstreamBody =
  | DynamicJsonArray
  | DynamicJsonRecord
  | JsonPrimitive
  | UnsafeUpstreamRecord
  | UnsafeUpstreamRecord[]
