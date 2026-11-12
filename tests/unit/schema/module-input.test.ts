import { expect, test } from 'bun:test';

import { Effect, Exit, Schema } from 'effect';

import {
  BooleanValue,
  decodeModuleInput,
  EmptyInput,
  IntegerValue,
  NaturalValue,
  NumberId,
  NumberIdList,
  NumberLiterals,
  NumberValue,
  PlainObject,
} from '../../../src/core/module-input.ts';

const accepts = (schema: Schema.Constraint, value: unknown) => {
  const exit = Effect.runSyncExit(
    Schema.decodeUnknownEffect(
      schema as unknown as Schema.ConstraintDecoder<unknown>,
    )(value),
  );
  return Exit.isSuccess(exit);
};

test('NumberId accepts positive safe integers and pure decimal strings', () => {
  for (const value of [
    1,
    42,
    Number.MAX_SAFE_INTEGER,
    '1',
    '42',
    '999999999999999999999',
  ]) {
    expect(accepts(NumberId, value)).toBe(true);
  }
});

test('NumberId rejects non-positive, fractional and encoded values', () => {
  for (const value of [
    0,
    -1,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    '0',
    '01',
    '1.5',
    '-1',
    '1,2',
    ' 1',
    '1 ',
    '+1',
    '1e3',
    '',
    true,
    null,
    undefined,
    {},
    [],
  ]) {
    expect(accepts(NumberId, value)).toBe(false);
  }
});

test('NumberIdList keeps order and duplicates and rejects an empty array', () => {
  expect(Schema.decodeSync(NumberIdList)([3, '1', 3])).toEqual([3, '1', 3]);
  expect(accepts(NumberIdList, [])).toBe(false);
  expect(accepts(NumberIdList, ['1,2'])).toBe(false);
});

test('EmptyInput accepts only an empty plain object', () => {
  expect(Schema.decodeSync(EmptyInput)({})).toEqual({});
  expect(accepts(EmptyInput, { any: 1 })).toBe(false);
  expect(accepts(EmptyInput, [])).toBe(false);
  expect(accepts(EmptyInput, null)).toBe(false);
});

test('PlainObject rejects arrays, null and class instances', () => {
  expect(accepts(PlainObject, {})).toBe(true);
  expect(accepts(PlainObject, Object.create(null))).toBe(true);
  expect(accepts(PlainObject, [])).toBe(false);
  expect(accepts(PlainObject, null)).toBe(false);
  expect(accepts(PlainObject, new Date())).toBe(false);
});

test('NumberValue accepts HTTP numeric strings and decodes to numbers', () => {
  expect(Schema.decodeSync(NumberValue)('5')).toBe(5);
  expect(Schema.decodeSync(NumberValue)('1.5')).toBe(1.5);
  expect(Schema.decodeSync(NumberValue)('-1')).toBe(-1);
  for (const value of ['abc', '', '1,2', true, null]) {
    expect(accepts(NumberValue, value)).toBe(false);
  }
});

test('IntegerValue and NaturalValue reject fractions and negative naturals', () => {
  expect(Schema.decodeSync(IntegerValue)('5')).toBe(5);
  expect(accepts(IntegerValue, '1.5')).toBe(false);
  expect(accepts(IntegerValue, 1.5)).toBe(false);
  expect(Schema.decodeSync(NaturalValue)('0')).toBe(0);
  expect(accepts(NaturalValue, '-1')).toBe(false);
  expect(accepts(NaturalValue, -1)).toBe(false);
});

test('BooleanValue accepts query strings and numeric forms', () => {
  for (const [value, expected] of [
    [true, true],
    [false, false],
    [1, true],
    [0, false],
    ['1', true],
    ['0', false],
    ['true', true],
    ['false', false],
  ] as const) {
    expect(Schema.decodeSync(BooleanValue)(value)).toBe(expected);
  }
  expect(accepts(BooleanValue, 'yes')).toBe(false);
  expect(accepts(BooleanValue, 2)).toBe(false);
});

test('NumberLiterals accepts numeric and string enum members only', () => {
  const schema = NumberLiterals([0, 1, 2]);
  expect(accepts(schema, '1')).toBe(true);
  expect(accepts(schema, 2)).toBe(true);
  expect(accepts(schema, 3)).toBe(false);
  expect(accepts(schema, '3')).toBe(false);
});

test('decodeModuleInput rejects undeclared fields at every level', () => {
  const schema = Schema.Struct({
    nested: Schema.Struct({ value: Schema.String }),
    list: Schema.Array(Schema.Struct({ id: NumberId })),
  });
  const decode = (value: unknown) =>
    Effect.runSyncExit(decodeModuleInput(schema, value));
  expect(Exit.isSuccess(decode({ nested: { value: 'x' }, list: [] }))).toBe(
    true,
  );
  expect(
    Exit.isSuccess(decode({ nested: { value: 'x', extra: 1 }, list: [] })),
  ).toBe(false);
  expect(
    Exit.isSuccess(
      decode({ nested: { value: 'x' }, list: [{ id: 1, extra: 1 }] }),
    ),
  ).toBe(false);
  expect(
    Exit.isSuccess(decode({ nested: { value: 'x' }, list: [], extra: 1 })),
  ).toBe(false);
});
