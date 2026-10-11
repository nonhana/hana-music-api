import { describe, expect, test } from 'bun:test';

import {
  classifyConsumedRateLimit,
  classifyHeaderRateLimit,
} from '../../src/core/response.ts';
import type { ConsumedResponse } from '../../src/core/response.ts';

const encoder = new TextEncoder();

describe('rate limit classification', () => {
  const now = Date.now();

  describe('classifyHeaderRateLimit', () => {
    test('认出 HTTP 429', () => {
      const headers = new Headers({ 'retry-after': '60' });
      const decision = classifyHeaderRateLimit(429, headers, now);
      expect(decision).toEqual({ status: 429, retryAfterMs: 60_000 });
    });

    test('HTTP 429 缺少 Retry-After 时用默认值 30 秒', () => {
      const headers = new Headers();
      const decision = classifyHeaderRateLimit(429, headers, now);
      expect(decision).toEqual({ status: 429, retryAfterMs: 30_000 });
    });

    test('非 429 状态不识别为限频', () => {
      const headers = new Headers({ 'retry-after': '60' });
      expect(classifyHeaderRateLimit(200, headers, now)).toBeUndefined();
      expect(classifyHeaderRateLimit(500, headers, now)).toBeUndefined();
      expect(classifyHeaderRateLimit(405, headers, now)).toBeUndefined();
    });
  });

  describe('classifyConsumedRateLimit', () => {
    test('认出业务 code: 429', () => {
      const response: ConsumedResponse = {
        status: 200,
        headers: new Headers(),
        setCookies: [],
        body: encoder.encode(JSON.stringify({ code: 429, msg: 'too many' })),
      };
      const value = { code: 429, msg: 'too many' };
      const decision = classifyConsumedRateLimit(response, value, now);
      expect(decision).toEqual({ status: 429, retryAfterMs: 30_000 });
    });

    test('认出 HTTP 429 + 业务 code: 429', () => {
      const response: ConsumedResponse = {
        status: 429,
        headers: new Headers({ 'retry-after': '120' }),
        setCookies: [],
        body: encoder.encode(JSON.stringify({ code: 429 })),
      };
      const value = { code: 429 };
      const decision = classifyConsumedRateLimit(response, value, now);
      expect(decision).toEqual({ status: 429, retryAfterMs: 120_000 });
    });

    test('认出 HTTP 405 与业务 code: 405 "操作过于频繁"', () => {
      const response: ConsumedResponse = {
        status: 405,
        headers: new Headers(),
        setCookies: [],
        body: encoder.encode(
          JSON.stringify({
            code: 405,
            message: '操作过于频繁，请稍后再试',
            msg: '操作过于频繁，请稍后再试',
          }),
        ),
      };
      const value = {
        code: 405,
        message: '操作过于频繁，请稍后再试',
        msg: '操作过于频繁，请稍后再试',
      };
      const decision = classifyConsumedRateLimit(response, value, now);
      expect(decision).toEqual({ status: 405, retryAfterMs: 30_000 });
    });

    test('HTTP 200 的业务 code: 405 不识别为限频', () => {
      const response: ConsumedResponse = {
        status: 200,
        headers: new Headers(),
        setCookies: [],
        body: encoder.encode(
          JSON.stringify({
            code: 405,
            msg: '操作过于频繁，请稍后再试',
          }),
        ),
      };
      const value = {
        code: 405,
        msg: '操作过于频繁，请稍后再试',
      };
      expect(classifyConsumedRateLimit(response, value, now)).toBeUndefined();
    });

    test('普通业务错误不识别为限频', () => {
      const response: ConsumedResponse = {
        status: 200,
        headers: new Headers(),
        setCookies: [],
        body: encoder.encode(JSON.stringify({ code: 301, msg: 'error' })),
      };
      const value = { code: 301, msg: 'error' };
      expect(classifyConsumedRateLimit(response, value, now)).toBeUndefined();
    });

    test('HTTP 405 但业务 code 不是 405 时不识别为限频', () => {
      const response: ConsumedResponse = {
        status: 405,
        headers: new Headers(),
        setCookies: [],
        body: encoder.encode(JSON.stringify({ code: 200 })),
      };
      const value = { code: 200 };
      expect(classifyConsumedRateLimit(response, value, now)).toBeUndefined();
    });
  });

  describe('playlist_subscribe 405 录制数据', () => {
    test('真实的 405 限频返回应该被识别', () => {
      // tests/fixtures/netease/playlist_subscribe/rejected.json
      const response: ConsumedResponse = {
        status: 405,
        headers: new Headers(),
        setCookies: [],
        body: encoder.encode(
          JSON.stringify({
            code: 405,
            message: '操作过于频繁，请稍后再试',
            debugInfo: null,
            data: null,
            failData: null,
            msg: '操作过于频繁，请稍后再试',
          }),
        ),
      };
      const value = JSON.parse(new TextDecoder().decode(response.body));
      const decision = classifyConsumedRateLimit(response, value, now);
      expect(decision).toEqual({ status: 405, retryAfterMs: 30_000 });
    });
  });
});
