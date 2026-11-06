import { describe, expect, test } from 'bun:test';

import * as errors from '../../src/core/errors.ts';
import type {
  ModuleResponse,
  NcmApiResponse,
  RequestIntent,
  UnknownJson,
} from '../../src/types/index.ts';
import type {
  UpstreamBody,
  UpstreamResponse,
} from '../../src/types/upstream.ts';

describe('Effect core contracts', () => {
  test('errors retain their discriminants and contextual fields', () => {
    const cases = [
      [
        'InvalidRequest',
        'Invalid target',
        new errors.InvalidRequest({ message: 'Invalid target' }),
      ],
      [
        'TargetRejected',
        'Target denied',
        new errors.TargetRejected({ message: 'Target denied' }),
      ],
      [
        'DeadlineExceeded',
        'Deadline elapsed',
        new errors.DeadlineExceeded({ message: 'Deadline elapsed' }),
      ],
      [
        'TransportFailed',
        'Connection failed',
        new errors.TransportFailed({ message: 'Connection failed' }),
      ],
      [
        'ResponseDecodeFailed',
        'Invalid JSON',
        new errors.ResponseDecodeFailed({ message: 'Invalid JSON' }),
      ],
      [
        'ProtocolFailed',
        'Invalid protocol response',
        new errors.ProtocolFailed({ message: 'Invalid protocol response' }),
      ],
      [
        'InvalidModuleInput',
        'Missing identifier',
        new errors.InvalidModuleInput({ message: 'Missing identifier' }),
      ],
      [
        'UpstreamBusinessFailed',
        'Login required',
        new errors.UpstreamBusinessFailed({ message: 'Login required' }),
      ],
      [
        'ModuleInvariantFailed',
        'Missing stage',
        new errors.ModuleInvariantFailed({ message: 'Missing stage' }),
      ],
    ] as const;

    for (const [tag, message, error] of cases) {
      expect(error._tag).toBe(tag);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(message);
    }
  });

  test('shape errors describe the unexpected field without retaining a response body', () => {
    const error = new errors.UnexpectedUpstreamShape({
      module: 'song_detail',
      path: 'songs',
      expected: 'array',
      actual: 'null',
    });
    expect(error).toMatchObject({
      _tag: 'UnexpectedUpstreamShape',
      module: 'song_detail',
      path: 'songs',
      expected: 'array',
      actual: 'null',
    });
    expect(error).not.toHaveProperty('body');
  });

  test('partial uploads retain completed stages and the original module identifier', () => {
    const error = new errors.PartialUpload({
      module: 'song_upload',
      completedStages: ['allocation', 'transfer'],
    });
    expect(error).toMatchObject({
      _tag: 'PartialUpload',
      module: 'song_upload',
      completedStages: ['allocation', 'transfer'],
    });
    expect(error).not.toHaveProperty('body');
  });

  test('recursive JSON and response envelopes permit arbitrary endpoint data', () => {
    const body: UnknownJson = {
      nested: [null, true, 7, 'value', { arbitrary: ['data'] }],
    };
    const upstreamBody: UpstreamBody = body;
    const response: ModuleResponse = {
      body: upstreamBody,
      cookie: [],
      status: 200,
    };
    const legacyResponse: NcmApiResponse = response;
    const upstreamResponse: UpstreamResponse = {
      ...response,
      headers: new Headers({ 'content-type': 'application/json' }),
    };
    const typedResponse: ModuleResponse<{ local: string }> = {
      body: { local: 'value' },
      cookie: [],
      status: 200,
    };

    expect(legacyResponse.body).toEqual({
      nested: [null, true, 7, 'value', { arbitrary: ['data'] }],
    });
    expect(upstreamResponse.headers.get('content-type')).toBe(
      'application/json',
    );
    expect(typedResponse.body.local).toBe('value');
  });

  test('request intents express the plain protocol and byte response without endpoint fields', () => {
    const intent: RequestIntent = {
      target: 'https://music.163.com/test',
      protocol: 'plain',
      method: 'POST',
      headers: { 'content-type': 'application/octet-stream' },
      body: new Uint8Array([1, 2]),
      response: 'bytes',
      semantic: 'upload',
    };
    expect(intent.body).toEqual(new Uint8Array([1, 2]));
    expect(intent.response).toBe('bytes');
  });

  test('legacy envelopes retain dynamic records while new JSON contracts exclude non-JSON values', () => {
    const dynamicBody: Record<string, unknown> = {
      query: { keyword: 'music' },
    };
    const legacy: NcmApiResponse = {
      body: dynamicBody,
      cookie: [],
      status: 200,
    };
    const excluded: [
      undefined extends UnknownJson ? true : false,
      Date extends UnknownJson ? true : false,
      (() => void) extends UnknownJson ? true : false,
      Record<string, unknown> extends UnknownJson ? true : false,
    ] = [false, false, false, false];

    expect(legacy.body).toEqual({ query: { keyword: 'music' } });
    expect(excluded).toEqual([false, false, false, false]);
  });
});
