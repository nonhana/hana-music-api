import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';
import * as SchemaIssue from 'effect/SchemaIssue';

import type { BodySchema, StandardSchemaV1 } from '../types/standard-schema.ts';
import type { UnknownJson } from '../types/unknown.ts';
import type { UpstreamResponse } from '../types/upstream.ts';
import { UnexpectedUpstreamShape, UpstreamBusinessFailed } from './errors.ts';
import { isRecord } from './utils.ts';

// 用公开 UnknownJson 承接未声明字段的 JSON 索引类型，避免向公共声明泄漏 effect/Schema 内部类型。
const UpstreamJson = Schema.MutableJson as unknown as Schema.Codec<UnknownJson>;

// 只声明确认过的字段；effect 4 的 Struct 会删掉多余字段，所以用带 rest 的结构把其余字段原样留下，类型仍是 JSON。
export const UpstreamObject = <const Fields extends Schema.Struct.Fields>(
  fields: Fields,
) =>
  Schema.StructWithRest(Schema.Struct(fields), [
    Schema.Record(Schema.String, UpstreamJson),
  ]).annotate({ expected: 'object' });

const bodySchemas = new WeakMap<object, Schema.Decoder<unknown>>();

type OmitIndexSignature<RecordType> = {
  [
    Key in keyof RecordType as string extends Key
      ? never
      : number extends Key
        ? never
        : symbol extends Key
          ? never
          : Key
  ]: RecordType[Key];
};

type IsUnknownJson<Value> = [Value] extends [UnknownJson]
  ? [UnknownJson] extends [Value]
    ? true
    : false
  : false;

// 将 Effect StructWithRest 展平后的对象还原为「具名字段 & 字符串索引」交叉类型，
// 避免发射到 .d.ts 时触发 TS2411（含 undefined/readonly 的具名字段与索引类型冲突）。
type CleanUpstreamType<Value> =
  IsUnknownJson<Value> extends true
    ? UnknownJson
    : Value extends ReadonlyArray<infer Item>
      ? ReadonlyArray<CleanUpstreamType<Item>>
      : Value extends object
        ? string extends keyof Value
          ? keyof OmitIndexSignature<Value> extends never
            ? { readonly [key: string]: CleanUpstreamType<Value[string]> }
            : {
                [Key in keyof OmitIndexSignature<Value>]: CleanUpstreamType<
                  OmitIndexSignature<Value>[Key]
                >;
              } & { readonly [key: string]: CleanUpstreamType<Value[string]> }
          : { [Key in keyof Value]: CleanUpstreamType<Value[Key]> }
        : Value;

export type UpstreamSchemaType<S extends Schema.Decoder<unknown>> =
  CleanUpstreamType<S['Type']>;

export type BodyType<SchemaValue> =
  SchemaValue extends StandardSchemaV1<unknown, infer Output> ? Output : never;

export const defineModuleBody = <S extends Schema.Decoder<unknown>>(
  schema: S,
): BodySchema<CleanUpstreamType<S['Type']>> => {
  const standard = Schema.toStandardSchemaV1(schema);
  bodySchemas.set(standard, schema);
  return standard as unknown as BodySchema<CleanUpstreamType<S['Type']>>;
};

/**
 * 宽松字段：可能缺失，也可能是 `null`；有值但类型不对时当成缺失。
 * 收紧字段照常用必填写法；声明处一眼能分出两种字段。
 */
export const Loose = <S extends Schema.Decoder<unknown>>(schema: S) =>
  schema.pipe(
    Schema.NullOr,
    Schema.catchDecoding(() => Effect.succeedNone),
    Schema.optionalKey,
  );

/**
 * 可以没有的路径：缺失或是 `null` 时照常返回；出现了就按 `schema` 收紧校验，坏一条记录也报错。
 * 不要把宽松字段套在这里：宽松字段整个值校验失败时应该当成缺失。
 */
export const Optional = <S extends Schema.Decoder<unknown>>(schema: S) =>
  schema.pipe(Schema.NullOr, Schema.optionalKey);

let formatIssue:
  | ReturnType<typeof SchemaIssue.makeFormatterStandardSchemaV1>
  | undefined;

export const kindOf = (value: unknown) =>
  value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;

const toShapeError = (
  module: string,
  body: unknown,
  error: Schema.SchemaError,
) => {
  const [issue] = (formatIssue ??= SchemaIssue.makeFormatterStandardSchemaV1())(
    error.issue,
  ).issues;
  const keys = (issue?.path ?? []).map((segment) =>
    typeof segment === 'object' ? segment.key : segment,
  );
  const missing = issue?.message === 'Missing key';
  const value = keys.reduce<unknown>(
    (current, key) =>
      isRecord(current) || Array.isArray(current)
        ? (current as Record<PropertyKey, unknown>)[key]
        : undefined,
    body,
  );
  return UnexpectedUpstreamShape.make({
    module,
    path: keys.reduce<string>(
      (path, key) =>
        typeof key === 'number' ? `${path}[${key}]` : `${path}.${String(key)}`,
      'body',
    ),
    expected: missing
      ? 'present'
      : (issue?.message ?? 'a valid value').replace(/^Expected /, ''),
    actual: missing ? 'missing' : kindOf(value),
  });
};

type DecodableBody = BodySchema<unknown> | Schema.Decoder<unknown>;

type DecodedBody<Target extends DecodableBody> =
  Target extends BodySchema<infer Output>
    ? Output
    : Target extends Schema.Decoder<infer Output>
      ? Output
      : never;

/**
 * 按模块导出的结构定义校验 SDK 将要返回的 body：网易云的 `code` 不在 `codes` 里时当作业务拒绝原样转交，
 * HTTP 状态取返回码；返回码认识但结构不符时报 `UnexpectedUpstreamShape`。
 */
export const decodeUpstreamBody = <Target extends DecodableBody>(
  module: string,
  schema: Target,
  response: UpstreamResponse,
  {
    body = response.body,
    codes = [200],
  }: { readonly body?: unknown; readonly codes?: ReadonlyArray<number> } = {},
): Effect.Effect<
  DecodedBody<Target>,
  UnexpectedUpstreamShape | UpstreamBusinessFailed
> => {
  const code = isRecord(response.body) ? response.body.code : undefined;
  if (typeof code === 'number' && !codes.includes(code)) {
    return Effect.fail(
      UpstreamBusinessFailed.make({
        message: `NetEase rejected the request with code ${code}`,
        code,
        response: {
          ...response,
          status: code > 100 && code < 600 ? code : 400,
        },
      }),
    );
  }
  const decoder =
    bodySchemas.get(schema) ?? (schema as Schema.Decoder<unknown>);
  return Schema.decodeUnknownEffect(decoder)(body).pipe(
    Effect.mapBoth({
      onSuccess: (decoded) => decoded as DecodedBody<Target>,
      onFailure: (error) => toShapeError(module, body, error),
    }),
  );
};
