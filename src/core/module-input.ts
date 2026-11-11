import { Effect, Schema } from 'effect';

import type { LegacyModuleInput } from '../types/legacy.ts';
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

export const PlainObject = Schema.declare<LegacyModuleInput>(
  (value): value is LegacyModuleInput => {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  },
);

// 无参数模块：普通对象且没有任何键；Struct({}) 对多余键不设防，不能用它表达“无参数”。
export const EmptyInput = Schema.declare<Record<never, never>>(
  (value): value is Record<never, never> =>
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0,
);

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

// 迁移期间保留旧名字，全部模块迁移完成后删除。
export const LegacyInput = PlainObject;
export const decodeLegacyModuleInput = decodeModuleObject;

// 输入必须先是普通对象，再按模块 Schema 解码；未声明字段直接拒绝。
export const decodeModuleInput = <InputSchema extends Schema.Constraint>(
  schema: InputSchema,
  input: unknown,
) =>
  decodeModuleObject(input).pipe(
    Effect.flatMap(
      Schema.decodeUnknownEffect(schema, { onExcessProperty: 'error' }),
    ),
    Effect.mapError((error) =>
      InvalidModuleInput.make({ message: error.message }),
    ),
  );
