// 这些是普通错误值，不是 Effect 管道输入；分类 helper 直接接收它们。
// oxlint-disable effecttsgo/missed-pipeable-opportunity
import { describe, expect, test } from 'bun:test';

import { Cause } from 'effect';

import {
  DeadlineExceeded,
  InvalidModuleInput,
  InvalidRequest,
  ModuleInvariantFailed,
  PartialUpload,
  ProtocolFailed,
  ResponseDecodeFailed,
  TargetRejected,
  TransportFailed,
  UnexpectedUpstreamShape,
  UpstreamBusinessFailed,
  UpstreamRateLimited,
} from '../../../src/core/errors.ts';
import {
  getNcmFailureInfo,
  isNcmApiResponse,
  normalizeFailure,
} from '../../../src/core/response.ts';
import type { NcmFailureInfo } from '../../../src/types/index.ts';
import type { UpstreamResponse } from '../../../src/types/upstream.ts';

const upstreamResponse = (
  status: number,
  body: unknown,
  cookie: ReadonlyArray<string> = [],
  businessCode?: number,
): UpstreamResponse => ({
  status,
  body: body as UpstreamResponse['body'],
  cookie,
  headers: new Headers(),
  ...(businessCode === undefined ? {} : { businessCode }),
});

const failureInfo = (
  error: unknown,
  cancelled = false,
  timedOut = false,
): NcmFailureInfo => {
  const failure = normalizeFailure(error, cancelled, timedOut);
  const info = getNcmFailureInfo(failure);
  expect(info).toBeDefined();
  return info!;
};

describe('isNcmApiResponse', () => {
  test('accepts the three-field envelope with any body shape', () => {
    for (const body of [null, true, 0, 'text', [], {}, { code: 200 }]) {
      expect(isNcmApiResponse({ status: 200, cookie: [], body })).toBe(true);
    }
  });

  test('rejects values that are not a finite response envelope', () => {
    for (const value of [
      null,
      undefined,
      [],
      'response',
      new Error('failure'),
      {},
      { status: 200, cookie: [] },
      { status: Number.NaN, cookie: [], body: {} },
      { status: Number.POSITIVE_INFINITY, cookie: [], body: {} },
      { status: '200', cookie: [], body: {} },
      { status: 200, cookie: 'cookie', body: {} },
      { status: 200, cookie: [1], body: {} },
      { status: 200, cookie: [{}], body: {} },
    ]) {
      expect(isNcmApiResponse(value)).toBe(false);
    }
  });

  test('does not throw for getters or proxies that throw', () => {
    const getter = Object.defineProperty({ cookie: [], body: {} }, 'status', {
      enumerable: true,
      get: () => {
        throw new Error('getter');
      },
    });
    const proxy = new Proxy(
      { status: 200, cookie: [], body: {} },
      {
        get: () => {
          throw new Error('proxy get');
        },
      },
    );
    const has = new Proxy(
      { status: 200, cookie: [], body: {} },
      {
        has: () => {
          throw new Error('proxy has');
        },
      },
    );
    const revoked = Proxy.revocable({ status: 200, cookie: [], body: {} }, {});
    revoked.revoke();
    const revokedFailure = Proxy.revocable({ kind: 'timeout' }, {});
    const responseWithRevokedFailure = {
      status: 502,
      cookie: [],
      body: {},
      failure: revokedFailure.proxy,
    };
    revokedFailure.revoke();

    expect(isNcmApiResponse(getter)).toBe(false);
    expect(isNcmApiResponse(proxy)).toBe(false);
    expect(isNcmApiResponse(has)).toBe(false);
    expect(isNcmApiResponse(revoked.proxy)).toBe(false);
    expect(getNcmFailureInfo(getter)).toBeUndefined();
    expect(getNcmFailureInfo(proxy)).toBeUndefined();
    expect(getNcmFailureInfo(has)).toBeUndefined();
    expect(getNcmFailureInfo(revoked.proxy)).toBeUndefined();
    expect(getNcmFailureInfo(responseWithRevokedFailure)).toBeUndefined();
  });
});

describe('getNcmFailureInfo', () => {
  test('returns undefined for ordinary errors, successes and legacy envelopes', () => {
    expect(getNcmFailureInfo(new Error('failure'))).toBeUndefined();
    expect(
      getNcmFailureInfo({ status: 200, cookie: [], body: {} }),
    ).toBeUndefined();
    expect(
      getNcmFailureInfo({ status: 502, cookie: [], body: { code: 502 } }),
    ).toBeUndefined();
  });

  test('returns every valid failure kind unchanged', () => {
    const cases: ReadonlyArray<NcmFailureInfo> = [
      { kind: 'business', code: 301, message: '需要登录' },
      { kind: 'business', code: null },
      { kind: 'rateLimited', code: 429, retryAfter: 30 },
      {
        kind: 'upstreamShape',
        module: 'album',
        path: 'body.songs',
        expected: 'present',
        actual: 'missing',
      },
      { kind: 'timeout' },
      { kind: 'cancelled' },
      { kind: 'invalidRequest' },
      { kind: 'transport' },
      { kind: 'unknown' },
    ];
    for (const failure of cases) {
      expect(
        getNcmFailureInfo({ status: 502, cookie: [], body: {}, failure }),
      ).toEqual(failure);
    }
  });

  test('rejects forged or invalid metadata without guessing a kind', () => {
    const invalid: ReadonlyArray<unknown> = [
      null,
      'transport',
      {},
      { kind: 'other' },
      { kind: 'business' },
      { kind: 'business', code: Number.NaN },
      { kind: 'business', code: '301' },
      { kind: 'business', code: 301, message: 1 },
      { kind: 'rateLimited', code: 429 },
      { kind: 'rateLimited', code: 429, retryAfter: '30' },
      {
        kind: 'upstreamShape',
        module: 'album',
        path: 'body',
        expected: 'object',
      },
    ];
    for (const failure of invalid) {
      expect(
        getNcmFailureInfo({ status: 502, cookie: [], body: {}, failure }),
      ).toBeUndefined();
    }
  });
});

describe('normalizeFailure classification', () => {
  test('classifies business rejections with public code and message', () => {
    const info = failureInfo(
      UpstreamBusinessFailed.make({
        message: 'NetEase rejected the request with code 301',
        code: 301,
        response: upstreamResponse(
          301,
          { code: 301, msg: '需要登录', extra: 'kept' },
          ['MUSIC_U=session'],
        ),
      }),
    );
    expect(info).toEqual({ kind: 'business', code: 301, message: '需要登录' });
    const failure = normalizeFailure(
      UpstreamBusinessFailed.make({
        message: 'NetEase rejected the request with code 301',
        code: 301,
        response: upstreamResponse(
          301,
          { code: 301, msg: '需要登录', extra: 'kept' },
          ['MUSIC_U=session'],
        ),
      }),
    );
    expect(failure).toMatchObject({
      status: 301,
      cookie: ['MUSIC_U=session'],
      body: { code: 301, msg: '需要登录', extra: 'kept' },
    });
  });

  test('classifies confirmed business protocol failures without status guessing', () => {
    const business = normalizeFailure(
      ProtocolFailed.make({
        message: 'Upstream request failed',
        reason: 'business',
        response: upstreamResponse(
          405,
          { code: 405, msg: '请求方法不允许' },
          [],
          405,
        ),
      }),
    );
    const transport = normalizeFailure(
      ProtocolFailed.make({
        message: 'Upstream request failed',
        response: upstreamResponse(502, { message: 'gateway' }),
      }),
    );
    expect(getNcmFailureInfo(business)).toEqual({
      kind: 'business',
      code: 405,
      message: '请求方法不允许',
    });
    expect(getNcmFailureInfo(transport)).toEqual({ kind: 'transport' });
    expect(transport).toMatchObject({
      status: 502,
      body: { message: 'gateway' },
    });
  });

  test('classifies rate limits with seconds and keeps the parsed body', () => {
    const failure = normalizeFailure(
      UpstreamRateLimited.make({
        host: 'music.163.com',
        identity: 'test',
        status: 429,
        retryAfterMs: 7_500,
        response: upstreamResponse(429, { code: 429, msg: 'limited' }),
      }),
    );
    expect(getNcmFailureInfo(failure)).toEqual({
      kind: 'rateLimited',
      code: 429,
      retryAfter: 8,
    });
    expect(failure).toMatchObject({
      status: 429,
      body: { code: 429, msg: 'limited', retryAfter: 8 },
    });
  });

  test('classifies deadlines, cancellation and transport failures', () => {
    const deadline = DeadlineExceeded.make({ message: 'late' });
    const transport = TransportFailed.make({ message: 'socket failed' });
    const decode = ResponseDecodeFailed.make({ message: 'bad json' });
    const interrupt = Cause.interrupt(1);

    expect(failureInfo(deadline)).toEqual({ kind: 'timeout' });
    expect(failureInfo(new Error('late'), true)).toEqual({ kind: 'cancelled' });
    expect(failureInfo(transport)).toEqual({ kind: 'transport' });
    expect(failureInfo(decode)).toEqual({ kind: 'transport' });
    expect(failureInfo(interrupt)).toEqual({ kind: 'cancelled' });
  });

  test('classifies local rejections and module invariants', () => {
    const invalid = InvalidRequest.make({ message: 'bad config' });
    const rejected = TargetRejected.make({ message: 'bad target' });
    const missingFileInput = InvalidModuleInput.make({
      message: 'missing file',
      status: 502,
    });
    const missingFile = normalizeFailure(missingFileInput);
    const invariant = ModuleInvariantFailed.make({ message: 'qr failed' });

    expect(failureInfo(invalid)).toEqual({ kind: 'invalidRequest' });
    expect(failureInfo(rejected)).toEqual({ kind: 'invalidRequest' });
    expect(failureInfo(missingFileInput)).toEqual({ kind: 'invalidRequest' });
    expect(missingFile).toMatchObject({
      status: 502,
      body: { code: 502, msg: 'missing file' },
    });
    expect(failureInfo(invariant)).toEqual({ kind: 'unknown' });
  });

  test('classifies shape failures with the same public fields', () => {
    const failure = normalizeFailure(
      UnexpectedUpstreamShape.make({
        module: 'album',
        path: 'body.songs',
        expected: 'array',
        actual: 'string',
      }),
    );
    expect(getNcmFailureInfo(failure)).toEqual({
      kind: 'upstreamShape',
      module: 'album',
      path: 'body.songs',
      expected: 'array',
      actual: 'string',
    });
    expect(failure).toMatchObject({
      status: 502,
      body: {
        code: 502,
        upstreamShape: {
          module: 'album',
          path: 'body.songs',
          expected: 'array',
          actual: 'string',
        },
      },
    });
  });

  test('keeps partial completion and the underlying classification', () => {
    const failure = normalizeFailure(
      PartialUpload.make({
        module: 'voice_upload',
        completedStages: ['allocation', 'transfer'],
        cause: InvalidRequest.make({ message: 'bad stage' }),
      }),
    );
    expect(getNcmFailureInfo(failure)).toEqual({ kind: 'invalidRequest' });
    expect(failure).toMatchObject({
      status: 400,
      body: {
        code: 400,
        partialCompletion: true,
        completedStages: 2,
      },
    });
  });

  test('labels legacy response envelopes as unknown and keeps their fields', () => {
    const legacy = {
      status: 502,
      cookie: ['MUSIC_U=legacy'],
      body: { code: 502, msg: 'legacy' },
    };
    const failure = normalizeFailure(legacy);
    expect(getNcmFailureInfo(failure)).toEqual({ kind: 'unknown' });
    expect(failure).toMatchObject(legacy);
    expect(failure).not.toBe(legacy);
  });

  test('preserves existing metadata through a second normalization', () => {
    const first = normalizeFailure(
      UpstreamBusinessFailed.make({
        message: 'rejected',
        code: 400,
        response: upstreamResponse(400, { code: 400, msg: '参数异常' }),
      }),
    );
    const second = normalizeFailure(first);
    expect(second).toEqual(first);
    expect(getNcmFailureInfo(second)).toEqual({
      kind: 'business',
      code: 400,
      message: '参数异常',
    });
  });

  test('keeps sensitive sentinels out of the new metadata', () => {
    const failure = normalizeFailure(
      TransportFailed.make({
        message:
          'socket failed MUSIC_U=sentinel-token phone=13800000000 checkToken=sentinel',
      }),
    );
    const info = getNcmFailureInfo(failure);
    expect(info).toEqual({ kind: 'transport' });
    expect(JSON.stringify(info)).not.toContain('sentinel');
    expect(JSON.stringify(info)).not.toContain('13800000000');
  });

  test('survives object spread and JSON round-trips', () => {
    const failure = normalizeFailure(
      UpstreamBusinessFailed.make({
        message: 'rejected',
        code: 502,
        response: upstreamResponse(502, { code: 502, msg: '歌单内歌曲重复' }),
      }),
    );
    const spread = { ...failure };
    const roundTrip = JSON.parse(JSON.stringify(failure)) as unknown;
    expect(getNcmFailureInfo(spread)).toEqual({
      kind: 'business',
      code: 502,
      message: '歌单内歌曲重复',
    });
    expect(getNcmFailureInfo(roundTrip)).toEqual({
      kind: 'business',
      code: 502,
      message: '歌单内歌曲重复',
    });
  });
});
