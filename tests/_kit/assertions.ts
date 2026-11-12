import { expect } from 'bun:test';
import { resolve } from 'node:path';

import { Exit } from 'effect';

import { normalizeFailure } from '../../src/core/response.ts';
import type { NcmApiFailure, NcmFailureInfo } from '../../src/types/index.ts';

export const projectRoot = resolve(import.meta.dir, '../..');

export const expectFailure = (exit: Exit.Exit<unknown, unknown>) => {
  expect(Exit.isFailure(exit)).toBe(true);
  if (!Exit.isFailure(exit)) {
    throw new Error('expected failure exit');
  }
  return normalizeFailure(exit.cause);
};

export const settle = <Value>(promise: Promise<Value>) =>
  promise.then(
    (resolved) => ({ resolved }),
    (rejected: NcmApiFailure) => ({ rejected }),
  );

// 契约测试回放的录制文件：一次 SDK 调用的查询参数和网易云的原始返回，见 tests/fixtures/netease/。
// `context.expect` 只在公开体由 SDK 合成、与上游原文不同时出现，是这次调用的最终体。
export type Recording = {
  readonly query: Record<string, unknown>;
  readonly context?: { readonly expect?: unknown } & Record<string, unknown>;
  readonly response: { readonly status: number; readonly body: object };
};

// 非 JSON 正文（如空字符串）的录制：body 是原始字节解码后的值，不保证是对象。
export type RawRecording = {
  readonly query: Record<string, unknown>;
  readonly response: { readonly status: number; readonly body: unknown };
};

export type Validator = {
  readonly '~standard': { readonly validate: (value: unknown) => unknown };
};

export const validateSync = (schema: Validator, input: unknown) => {
  const result = schema['~standard'].validate(input);
  expect(result).not.toBeInstanceOf(Promise);
  if (result instanceof Promise) {
    throw new Error('Standard Schema validation must be synchronous');
  }
  return result as { value?: unknown; issues?: ReadonlyArray<unknown> };
};

export type UpstreamShape = Record<
  'module' | 'path' | 'expected' | 'actual',
  string
>;

// 业务拒绝的公开元数据由正文 code 和 msg/message 决定；独立实现，避免直接复用生产提取逻辑。
export const businessFailure = (
  body: unknown,
  code?: number,
): NcmFailureInfo => {
  const record =
    typeof body === 'object' && body !== null && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : undefined;
  const bodyCode = Number(record?.code);
  const message = record?.msg ?? record?.message;
  const resolved = code ?? (Number.isFinite(bodyCode) ? bodyCode : null);
  return {
    kind: 'business',
    code: resolved,
    ...(typeof message === 'string' ? { message } : {}),
  };
};

export const expectUpstreamShapeRejection = async (
  promise: Promise<unknown>,
  shape: UpstreamShape,
) =>
  expect(await settle(promise)).toEqual({
    rejected: {
      status: 502,
      cookie: [],
      body: {
        code: 502,
        msg: `Unexpected upstream shape in ${shape.module} at ${shape.path}: expected ${shape.expected}, got ${shape.actual}`,
        upstreamShape: shape,
      },
      failure: { kind: 'upstreamShape', ...shape },
    },
  });
