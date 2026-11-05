import { Schema } from 'effect';

import type { UnknownJson } from '../types/unknown.ts';
import type { UpstreamResponse } from '../types/upstream.ts';

// fetch 的 Headers 可以来自不同实现，因此检查标准结构并保留原始对象。
const HeadersSchema = Schema.declare<Headers>(
  (value): value is Headers =>
    typeof value === 'object' &&
    value !== null &&
    [
      'append',
      'delete',
      'get',
      'has',
      'set',
      'forEach',
      'entries',
      'keys',
      'values',
    ].every((name) => typeof Reflect.get(value, name) === 'function') &&
    typeof Reflect.get(value, Symbol.iterator) === 'function' &&
    (!('getSetCookie' in value) ||
      typeof Reflect.get(value, 'getSetCookie') === 'function'),
);

// 失败正文可能已把非数字业务码转为 NaN，保持现 UnknownJson 的 number 语义。
const UpstreamNumber = Schema.Union([
  Schema.Finite,
  Schema.declare<number>(
    (value): value is number =>
      typeof value === 'number' && !Number.isFinite(value),
    { expected: 'a non-finite upstream number' },
  ),
]);

// 错误正文可以很深，用显式栈校验完整值域并区分循环与共享引用。
const UnknownJsonSchema = Schema.declare<UnknownJson>(
  (value): value is UnknownJson => {
    const pending: Array<{ value: unknown; exiting: boolean }> = [
      { value, exiting: false },
    ];
    const active = new WeakSet<object>();
    const completed = new WeakSet<object>();
    for (;;) {
      const entry = pending.pop();
      if (!entry) return true;
      const current = entry.value;
      if (
        current === null ||
        typeof current === 'boolean' ||
        typeof current === 'number' ||
        typeof current === 'string'
      ) {
        continue;
      }
      if (typeof current !== 'object') return false;
      if (entry.exiting) {
        active.delete(current);
        completed.add(current);
        continue;
      }
      if (completed.has(current)) continue;
      if (
        active.has(current) ||
        (!Array.isArray(current) &&
          Object.prototype.toString.call(current) !== '[object Object]')
      ) {
        return false;
      }
      active.add(current);
      pending.push({ value: current, exiting: true });
      const children: ReadonlyArray<unknown> = Array.isArray(current)
        ? current
        : Object.values(current);
      for (let index = children.length - 1; index >= 0; index -= 1) {
        pending.push({ value: children[index], exiting: false });
      }
    }
  },
);
const UpstreamResponseSchema = Schema.Struct({
  status: Schema.Finite,
  headers: HeadersSchema,
  cookie: Schema.Array(Schema.String),
  body: UnknownJsonSchema,
}) satisfies Schema.Codec<UpstreamResponse>;

export class InvalidRequest extends Schema.TaggedError<
  InvalidRequest,
  { readonly brand: unique symbol }
>()('InvalidRequest', { message: Schema.String }) {}

export class TargetRejected extends Schema.TaggedError<
  TargetRejected,
  { readonly brand: unique symbol }
>()('TargetRejected', { message: Schema.String }) {}

export class UpstreamRateLimited extends Schema.TaggedError<
  UpstreamRateLimited,
  { readonly brand: unique symbol }
>()('UpstreamRateLimited', {
  host: Schema.String,
  identity: Schema.String,
  retryAfterMs: Schema.Finite,
  status: Schema.Finite,
  message: Schema.optional(Schema.String),
  response: Schema.optional(UpstreamResponseSchema),
}) {}

export class DeadlineExceeded extends Schema.TaggedError<
  DeadlineExceeded,
  { readonly brand: unique symbol }
>()('DeadlineExceeded', { message: Schema.String }) {}

export class TransportFailed extends Schema.TaggedError<
  TransportFailed,
  { readonly brand: unique symbol }
>()('TransportFailed', {
  message: Schema.String,
  cause: Schema.optional(Schema.Unknown),
}) {}

export class ResponseDecodeFailed extends Schema.TaggedError<
  ResponseDecodeFailed,
  { readonly brand: unique symbol }
>()('ResponseDecodeFailed', { message: Schema.String }) {}

export class ProtocolFailed extends Schema.TaggedError<
  ProtocolFailed,
  { readonly brand: unique symbol }
>()('ProtocolFailed', {
  message: Schema.String,
  cause: Schema.optional(Schema.Unknown),
  response: Schema.optional(UpstreamResponseSchema),
}) {}

export class InvalidModuleInput extends Schema.TaggedError<
  InvalidModuleInput,
  { readonly brand: unique symbol }
>()('InvalidModuleInput', {
  message: Schema.String,
  status: Schema.optional(Schema.Finite),
}) {}

export class UnexpectedUpstreamShape extends Schema.TaggedError<
  UnexpectedUpstreamShape,
  { readonly brand: unique symbol }
>()('UnexpectedUpstreamShape', {
  module: Schema.String,
  path: Schema.String,
  expected: Schema.String,
  actual: Schema.String,
}) {}

export class UpstreamBusinessFailed extends Schema.TaggedError<
  UpstreamBusinessFailed,
  { readonly brand: unique symbol }
>()('UpstreamBusinessFailed', {
  message: Schema.String,
  code: Schema.optional(UpstreamNumber),
  response: Schema.optional(UpstreamResponseSchema),
}) {}

export class PartialUpload extends Schema.TaggedError<
  PartialUpload,
  { readonly brand: unique symbol }
>()('PartialUpload', {
  module: Schema.String,
  completedStages: Schema.Array(Schema.String),
  cause: Schema.optional(Schema.Unknown),
}) {}

export class ModuleInvariantFailed extends Schema.TaggedError<
  ModuleInvariantFailed,
  { readonly brand: unique symbol }
>()('ModuleInvariantFailed', { message: Schema.String }) {}

export type RequestError =
  | InvalidRequest
  | TargetRejected
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
