import { Effect, Schema, SchemaGetter } from 'effect';

import type { QueryNumberLike } from '../types/module-shared.ts';
import { InvalidModuleInput } from './errors.ts';

export const QueryNumber = Schema.declare<QueryNumberLike>(
  (value): value is QueryNumberLike =>
    (typeof value === 'number' && Number.isFinite(value)) ||
    (typeof value === 'string' &&
      value.trim() !== '' &&
      Number.isFinite(Number(value))),
);

export const QueryIdentifier = Schema.Union([Schema.String, Schema.Finite]);
export const QueryBoolean = Schema.Literals([
  true,
  false,
  0,
  1,
  '0',
  '1',
  'true',
  'false',
]);

// 业务编号：正安全整数或纯十进制正数字符串；字符串保持原样，不做 Number 转换。
export type NumberId = number | string;

export const NumberId = Schema.declare<NumberId>(
  (value): value is NumberId =>
    (typeof value === 'number' && Number.isSafeInteger(value) && value > 0) ||
    (typeof value === 'string' && /^[1-9][0-9]*$/u.test(value)),
);

// 编号集合不接受空数组；重复项和顺序由调用者决定，SDK 原样保留。
export const NumberIdList = Schema.Array(NumberId).check(Schema.isMinLength(1));
export type NumberIdList = typeof NumberIdList.Type;

export type PlainObjectValue = Readonly<Record<string, unknown>>;

export const PlainObject = Schema.declare<PlainObjectValue>(
  (value): value is PlainObjectValue => {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  },
);

// 无参数模块的输入：没有任何有效键，生成器因此允许省略 query。
export type NoInput = { readonly __noInput?: never };

// 无参数模块：普通对象且没有任何键；Struct({}) 对多余键不设防，不能用它表达“无参数”。
export const EmptyInput = Schema.declare<NoInput>(
  (value): value is NoInput =>
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0,
);

// HTTP query 的值都是字符串；业务类型仍是数字/布尔，由 schema 在入口归一。
const NumericString = Schema.String.check(
  Schema.isPattern(/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?$/u),
).pipe(
  Schema.decodeTo(Schema.Finite, {
    decode: SchemaGetter.transform((value) => Number(value)),
    encode: SchemaGetter.transform((value) => String(value)),
  }),
);

export const NumberValue = Schema.Union([Schema.Finite, NumericString]);
export type NumberValue = typeof NumberValue.Type;

export const IntegerValue = NumberValue.check(Schema.isInt());
export type IntegerValue = typeof IntegerValue.Type;

export const NaturalValue = IntegerValue.check(
  Schema.isGreaterThanOrEqualTo(0),
);
export type NaturalValue = typeof NaturalValue.Type;

const BooleanString = Schema.Literals(['0', '1', 'false', 'true']).pipe(
  Schema.decodeTo(Schema.Boolean, {
    decode: SchemaGetter.transform(
      (value) => value === '1' || value === 'true',
    ),
    encode: SchemaGetter.transform((value) => (value ? 'true' : 'false')),
  }),
);

const BooleanNumber = Schema.Literals([0, 1]).pipe(
  Schema.decodeTo(Schema.Boolean, {
    decode: SchemaGetter.transform((value) => value === 1),
    encode: SchemaGetter.transform((value) => (value ? 1 : 0)),
  }),
);

export const BooleanValue = Schema.Union([
  Schema.Boolean,
  BooleanNumber,
  BooleanString,
]);
export type BooleanValue = typeof BooleanValue.Type;

// 数字枚举同样要接受 HTTP query 的字符串形式，解码后仍是数字字面量。
export const NumberLiteral = <const Value extends number>(value: Value) =>
  Schema.Union([
    Schema.Literal(value),
    Schema.Literal(String(value)).pipe(
      Schema.decodeTo(Schema.Literal(value), {
        decode: SchemaGetter.transform(() => value),
        encode: SchemaGetter.transform(() => String(value)),
      }),
    ),
  ]);

export const NumberLiterals = <const Values extends ReadonlyArray<number>>(
  values: Values,
): Schema.Schema<Values[number]> =>
  Schema.Union(values.map((value) => NumberLiteral(value)));

export const UploadedFile = Schema.Struct({
  data: Schema.Union([
    Schema.instanceOf(ArrayBuffer),
    Schema.instanceOf(Uint8Array),
  ]),
  md5: Schema.optional(Schema.String),
  mimetype: Schema.String,
  name: Schema.String,
  size: Schema.Finite,
});

export const decodeModuleObject = (input: unknown) =>
  Schema.decodeUnknownEffect(PlainObject)(input).pipe(
    Effect.mapError((error) =>
      InvalidModuleInput.make({ message: error.message }),
    ),
  );

// 输入必须先是普通对象，再按模块 Schema 解码；未声明字段直接拒绝。
export const decodeModuleInput = <InputSchema extends Schema.Constraint>(
  schema: InputSchema,
  input: unknown,
): Effect.Effect<InputSchema['Type'], InvalidModuleInput> =>
  decodeModuleObject(input).pipe(
    Effect.flatMap(
      Schema.decodeUnknownEffect(
        schema as unknown as Schema.ConstraintCodec<unknown, unknown>,
        { onExcessProperty: 'error' },
      ),
    ),
    Effect.mapError((error) =>
      InvalidModuleInput.make({ message: error.message }),
    ),
  );
