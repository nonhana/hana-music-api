import { Effect, Schema, SchemaIssue } from 'effect';

import type { UpstreamResponse } from '../types/upstream.ts';
import { UnexpectedUpstreamShape, UpstreamBusinessFailed } from './errors.ts';
import { isRecord } from './utils.ts';

// 只声明确认过的字段；effect 4 的 Struct 会删掉多余字段，所以用带 rest 的结构把其余字段原样留下，类型仍是 JSON。
export const UpstreamObject = <const Fields extends Schema.Struct.Fields>(
  fields: Fields,
) =>
  Schema.StructWithRest(Schema.Struct(fields), [
    Schema.Record(Schema.String, Schema.MutableJson),
  ]).annotate({ expected: 'object' });

const formatIssue = SchemaIssue.makeFormatterStandardSchemaV1();

const kindOf = (value: unknown) =>
  value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;

const toShapeError = (
  module: string,
  body: unknown,
  error: Schema.SchemaError,
) => {
  const [issue] = formatIssue(error.issue).issues;
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
  return new UnexpectedUpstreamShape({
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

/**
 * 按模块导出的结构定义校验 SDK 将要返回的 body：网易云的 `code` 不在 `codes` 里时当作业务拒绝原样转交，
 * HTTP 状态取返回码；返回码认识但结构不符时报 `UnexpectedUpstreamShape`。
 */
export const decodeUpstreamBody = <S extends Schema.Decoder<unknown>>(
  module: string,
  schema: S,
  response: UpstreamResponse,
  {
    body = response.body,
    codes = [200],
  }: { readonly body?: unknown; readonly codes?: ReadonlyArray<number> } = {},
): Effect.Effect<
  S['Type'],
  UnexpectedUpstreamShape | UpstreamBusinessFailed
> => {
  const code = isRecord(response.body) ? response.body.code : undefined;
  return typeof code === 'number' && !codes.includes(code)
    ? Effect.fail(
        new UpstreamBusinessFailed({
          message: `NetEase rejected the request with code ${code}`,
          code,
          response: {
            ...response,
            status: code > 100 && code < 600 ? code : 400,
          },
        }),
      )
    : Schema.decodeUnknownEffect(schema)(body).pipe(
        Effect.mapError((error) => toShapeError(module, body, error)),
      );
};
