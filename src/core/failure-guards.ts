import type { NcmApiResponse, NcmFailureInfo } from '../types/index.ts';

const isFailureInfo = (value: unknown): value is NcmFailureInfo => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  try {
    if (Array.isArray(value)) {
      return false;
    }
    const kind = Reflect.get(value, 'kind');
    if (kind === 'business') {
      const code = Reflect.get(value, 'code');
      const message = Reflect.get(value, 'message');
      return (
        (code === null ||
          (typeof code === 'number' && Number.isFinite(code))) &&
        (message === undefined || typeof message === 'string')
      );
    }
    if (kind === 'rateLimited') {
      const code = Reflect.get(value, 'code');
      const retryAfter = Reflect.get(value, 'retryAfter');
      return (
        typeof code === 'number' &&
        Number.isFinite(code) &&
        typeof retryAfter === 'number' &&
        Number.isFinite(retryAfter)
      );
    }
    if (kind === 'upstreamShape') {
      return ['module', 'path', 'expected', 'actual'].every(
        (key) => typeof Reflect.get(value, key) === 'string',
      );
    }
    return (
      kind === 'timeout' ||
      kind === 'cancelled' ||
      kind === 'invalidRequest' ||
      kind === 'transport' ||
      kind === 'unknown'
    );
  } catch {
    return false;
  }
};

export const isNcmApiResponse = (value: unknown): value is NcmApiResponse => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  try {
    if (Array.isArray(value)) {
      return false;
    }
    const status = Reflect.get(value, 'status');
    const cookie = Reflect.get(value, 'cookie');
    return (
      typeof status === 'number' &&
      Number.isFinite(status) &&
      Array.isArray(cookie) &&
      cookie.every((item) => typeof item === 'string') &&
      Reflect.has(value, 'body')
    );
  } catch {
    return false;
  }
};

export const getNcmFailureInfo = (
  value: unknown,
): NcmFailureInfo | undefined => {
  if (!isNcmApiResponse(value)) {
    return undefined;
  }
  try {
    const failure = Reflect.get(value, 'failure');
    return isFailureInfo(failure) ? failure : undefined;
  } catch {
    return undefined;
  }
};
