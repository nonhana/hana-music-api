import type { Context } from 'hono';

import { isRecord } from '../core/utils.ts';
import type { ModuleQuery } from '../types/index.ts';
import type { LegacyUploadedFile } from '../types/modules.ts';

const BODYLESS_METHODS = new Set(['GET', 'HEAD']);
const DEFAULT_MAX_BODY_BYTES = 10 * 1024 * 1024;
const MULTIPART_OVERHEAD_BYTES = 64 * 1024;
const DEFAULT_BODY_TIMEOUT_MS = 5_000;

export class RequestBodyError extends Error {
  constructor(
    readonly status: 400 | 408 | 413,
    message: string,
  ) {
    super(message);
    this.name = 'RequestBodyError';
  }
}

/**
 * 把 Hono 的请求体解析结果收敛成普通 JS 对象，
 * 这样模块层只面对旧项目兼容的 query 结构，不直接依赖框架细节。
 */
export const parseRequestBody = async (
  context: Context,
  limits: {
    readonly bodyTimeoutMs?: number;
    readonly maxBodyBytes?: number;
  } = {},
): Promise<ModuleQuery> => {
  if (BODYLESS_METHODS.has(context.req.method.toUpperCase())) {
    return {};
  }

  const contentType = context.req.header('content-type') ?? '';

  const body = await readBody(
    context.req.raw,
    contentType.includes('multipart/form-data')
      ? (limits.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES) +
          MULTIPART_OVERHEAD_BYTES
      : (limits.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES),
    limits.bodyTimeoutMs ?? DEFAULT_BODY_TIMEOUT_MS,
  );
  if (body.byteLength === 0) {
    return {};
  }

  try {
    if (contentType.includes('application/json')) {
      const payload: unknown = JSON.parse(new TextDecoder().decode(body));
      if (!isRecord(payload)) {
        throw new RequestBodyError(400, 'Request body must be an object');
      }
      return payload;
    }

    if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      const request = new Request(context.req.raw.url, {
        body: body as unknown as RequestInit['body'],
        headers: context.req.raw.headers,
        method: context.req.method,
      });
      const formData = await request.formData();
      const parsed: Record<string, string | File | Array<string | File>> = {};
      let fileBytes = 0;
      let fieldBytes = 0;
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
          fieldBytes += new TextEncoder().encode(value).length;
        } else {
          fileBytes += value.size;
        }
        const previous = parsed[key];
        parsed[key] =
          previous === undefined
            ? value
            : Array.isArray(previous)
              ? [...previous, value]
              : [previous, value];
      }
      if (
        Math.max(fileBytes, fieldBytes) >
        (limits.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES)
      ) {
        throw new RequestBodyError(413, 'Request body is too large');
      }
      return await normalizeParsedBody(parsed);
    }
  } catch (error) {
    if (error instanceof RequestBodyError) {
      throw error;
    }
    throw new RequestBodyError(400, 'Invalid request body');
  }

  return {};
};

const readBody = async (
  request: Request,
  maxBytes: number,
  timeoutMs: number,
): Promise<Uint8Array> => {
  const length = Number(request.headers.get('content-length'));
  if (Number.isFinite(length) && length > maxBytes) {
    throw new RequestBodyError(413, 'Request body is too large');
  }
  if (!request.body) {
    return new Uint8Array();
  }

  const reader = request.body.getReader();
  const chunks: Array<Uint8Array> = [];
  let total = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let timedOut = false;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      timedOut = true;
      reject(new RequestBodyError(408, 'Request body timed out'));
    }, timeoutMs);
  });
  try {
    while (true) {
      const result = await Promise.race([reader.read(), timeout]);
      if (result.done) {
        break;
      }
      total += result.value.byteLength;
      if (total > maxBytes) {
        throw new RequestBodyError(413, 'Request body is too large');
      }
      chunks.push(result.value);
    }
  } catch (error) {
    if (timedOut || error instanceof RequestBodyError) {
      void reader.cancel().catch(() => {});
    }
    throw error;
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
    reader.releaseLock();
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
};

const normalizeParsedBody = async (
  body: Record<string, string | File | Array<string | File>>,
): Promise<ModuleQuery> => {
  const normalized: ModuleQuery = {};

  for (const [key, value] of Object.entries(body)) {
    normalized[key] = await normalizeBodyValue(value);
  }

  return normalized;
};

const normalizeBodyValue = async (
  value: string | File | Array<string | File>,
): Promise<unknown> => {
  if (Array.isArray(value)) {
    return Promise.all(value.map((entry) => normalizeBodyValue(entry)));
  }

  if (value instanceof File) {
    return toLegacyUploadedFile(value);
  }

  return value;
};

const toLegacyUploadedFile = async (
  file: File,
): Promise<LegacyUploadedFile> => {
  const data = Buffer.from(await file.arrayBuffer());

  return {
    data,
    mimetype: file.type || 'application/octet-stream',
    name: file.name,
    size: file.size,
  };
};
