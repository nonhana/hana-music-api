import { expect, test } from 'bun:test';

import { Effect, Exit, Schema } from 'effect';

import {
  decodeModuleInput,
  EmptyInput,
  NumberId,
  NumberIdList,
  PlainObject,
} from '../../../src/core/module-input.ts';

const accepts = (
  schema: Schema.ConstraintDecoder<unknown, never>,
  value: unknown,
) => {
  const exit = Effect.runSyncExit(Schema.decodeUnknownEffect(schema)(value));
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
  expect(Schema.decodeUnknownSync(NumberIdList)([3, '1', 3])).toEqual([
    3,
    '1',
    3,
  ]);
  expect(accepts(NumberIdList, [])).toBe(false);
  expect(accepts(NumberIdList, ['1,2'])).toBe(false);
});

test('EmptyInput accepts only an empty plain object', () => {
  expect(Schema.decodeUnknownSync(EmptyInput)({})).toEqual({});
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
