import { Effect, Schema } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';
import type { QueryNumberLike } from '../types/module-shared.ts';

export const QueryNumber = Schema.declare<QueryNumberLike>(
  (value): value is QueryNumberLike =>
    (typeof value === 'number' && Number.isFinite(value)) ||
    (typeof value === 'string' &&
      value.trim() !== '' &&
      Number.isFinite(Number(value))),
);

export const QueryIdentifier = Schema.Union([Schema.String, Schema.Number]);
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

export const LegacyInput = Schema.declare<LegacyModuleInput>(
  (value): value is LegacyModuleInput => {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  },
);

export const UploadedFile = Schema.Struct({
  data: Schema.Union([
    Schema.instanceOf(ArrayBuffer),
    Schema.instanceOf(Uint8Array),
  ]),
  md5: Schema.optional(Schema.String),
  mimetype: Schema.String,
  name: Schema.String,
  size: Schema.Number,
});

export const decodeLegacyModuleInput = (input: unknown) =>
  Schema.decodeUnknownEffect(LegacyInput)(input).pipe(
    Effect.mapError(
      (error) => new InvalidModuleInput({ message: error.message }),
    ),
  );

export const decodeModuleInput = <InputSchema extends Schema.Constraint>(
  schema: InputSchema,
  input: unknown,
) => {
  return decodeLegacyModuleInput(input).pipe(
    Effect.flatMap(Schema.decodeUnknownEffect(schema)),
    Effect.mapError(
      (error) => new InvalidModuleInput({ message: error.message }),
    ),
  );
};
